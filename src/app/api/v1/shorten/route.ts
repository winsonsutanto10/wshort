import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { cacheSlug } from '@/lib/redis/client'
import { generateSlug, validateSlug } from '@/lib/slug'
import { requireApiKey } from '@/lib/auth/api-key'
import bcrypt from 'bcryptjs'

const schema = z.object({
  url: z.string().url('Invalid URL'),
  slug: z.string().optional(),
  title: z.string().max(200).optional(),
  expires_at: z.string().datetime().optional(),
  max_clicks: z.number().int().positive().optional(),
})

export async function POST(request: NextRequest) {
  const authResult = await requireApiKey(request)
  if (authResult instanceof Response) return authResult
  const { userId } = authResult

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { url, slug: customSlug, title, expires_at, max_clicks } = parsed.data

  let slug = customSlug
  if (slug) {
    const validation = validateSlug(slug)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }
  } else {
    for (let i = 0; i < 3; i++) {
      const candidate = generateSlug()
      const { data } = await supabaseAdmin
        .from('links')
        .select('id')
        .eq('slug', candidate)
        .maybeSingle()
      if (!data) { slug = candidate; break }
    }
    if (!slug) return NextResponse.json({ error: 'Slug generation failed' }, { status: 500 })
  }

  const { data, error } = await supabaseAdmin
    .from('links')
    .insert({
      user_id: userId,
      slug,
      original_url: url,
      title: title ?? null,
      expires_at: expires_at ?? null,
      max_clicks: max_clicks ?? null,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Slug already taken' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await cacheSlug(slug, {
    originalUrl: url,
    linkId: data.id,
    hasPassword: false,
    expiresAt: expires_at ? new Date(expires_at).getTime() : 0,
    maxClicks: max_clicks ?? 0,
  })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  return NextResponse.json(
    { link: data, short_url: `${baseUrl}/${slug}` },
    { status: 201 }
  )
}
