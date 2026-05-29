import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { invalidateSlug, cacheSlug } from '@/lib/redis/client'
import bcrypt from 'bcryptjs'

const updateLinkSchema = z.object({
  title: z.string().max(200).optional(),
  original_url: z.string().url().optional(),
  is_active: z.boolean().optional(),
  password: z.string().min(4).max(100).nullable().optional(),
  expires_at: z.string().datetime().nullable().optional(),
  max_clicks: z.number().int().positive().nullable().optional(),
})

async function getOwnedLink(userId: string, id: string) {
  const { data, error } = await supabaseAdmin
    .from('links')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()
  if (error || !data) return null
  return data
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const link = await getOwnedLink(userId, id)
  if (!link) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ link })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const link = await getOwnedLink(userId, id)
  if (!link) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await request.json()
  const parsed = updateLinkSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  const { title, original_url, is_active, password, expires_at, max_clicks } = parsed.data
  const updates: Record<string, unknown> = {}
  if (title !== undefined) updates.title = title
  if (original_url !== undefined) updates.original_url = original_url
  if (is_active !== undefined) updates.is_active = is_active
  if (expires_at !== undefined) updates.expires_at = expires_at
  if (max_clicks !== undefined) updates.max_clicks = max_clicks
  if (password !== undefined) {
    updates.password_hash = password ? await bcrypt.hash(password, 10) : null
  }
  updates.updated_at = new Date().toISOString()

  const { data, error } = await supabaseAdmin
    .from('links')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Invalidate Redis so next visit re-caches fresh data
  await invalidateSlug(link.slug)

  // Re-populate cache with updated values
  await cacheSlug(link.slug, {
    originalUrl: data.original_url,
    linkId: data.id,
    hasPassword: !!data.password_hash,
    expiresAt: data.expires_at ? new Date(data.expires_at).getTime() : 0,
    maxClicks: data.max_clicks ?? 0,
  })

  return NextResponse.json({ link: data })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const link = await getOwnedLink(userId, id)
  if (!link) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { error } = await supabaseAdmin.from('links').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await invalidateSlug(link.slug)

  return new NextResponse(null, { status: 204 })
}
