import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { cacheSlug, invalidateSlug } from '@/lib/redis/client'
import { generateSlug, validateSlug } from '@/lib/slug'
import bcrypt from 'bcryptjs'

const createLinkSchema = z.object({
  url: z.string().url('Invalid URL'),
  slug: z.string().optional(),
  title: z.string().max(200).optional(),
  password: z.string().min(4).max(100).optional(),
  expires_at: z.string().datetime().optional(),
  max_clicks: z.number().int().positive().optional(),
})

export async function GET(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, Number(searchParams.get('page') ?? 1))
  const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') ?? 20)))
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await supabaseAdmin
    .from('links')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ links: data, total: count, page, limit })
}

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = createLinkSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { url, slug: customSlug, title, password, expires_at, max_clicks } = parsed.data

  let slug = customSlug
  if (slug) {
    const validation = validateSlug(slug)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }
  } else {
    // Generate unique slug with retry
    for (let i = 0; i < 3; i++) {
      const candidate = generateSlug()
      const { data } = await supabaseAdmin
        .from('links')
        .select('id')
        .eq('slug', candidate)
        .maybeSingle()
      if (!data) {
        slug = candidate
        break
      }
    }
    if (!slug) {
      return NextResponse.json({ error: 'Failed to generate slug, try again' }, { status: 500 })
    }
  }

  const password_hash = password ? await bcrypt.hash(password, 10) : null

  const { data, error } = await supabaseAdmin
    .from('links')
    .insert({
      user_id: userId,
      slug,
      original_url: url,
      title: title ?? null,
      password_hash,
      expires_at: expires_at ?? null,
      max_clicks: max_clicks ?? null,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Slug already taken' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Populate Redis cache
  await cacheSlug(slug, {
    originalUrl: url,
    linkId: data.id,
    hasPassword: !!password_hash,
    expiresAt: expires_at ? new Date(expires_at).getTime() : 0,
    maxClicks: max_clicks ?? 0,
  })

  return NextResponse.json({ link: data }, { status: 201 })
}
