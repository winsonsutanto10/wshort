import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireApiKey } from '@/lib/auth/api-key'
import { invalidateSlug } from '@/lib/redis/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireApiKey(request)
  if (authResult instanceof Response) return authResult
  const { userId } = authResult
  const { id } = await params

  const { data, error } = await supabaseAdmin
    .from('links')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ link: data })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireApiKey(request)
  if (authResult instanceof Response) return authResult
  const { userId } = authResult
  const { id } = await params

  const { data: link, error: fetchError } = await supabaseAdmin
    .from('links')
    .select('slug')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (fetchError || !link) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { error } = await supabaseAdmin.from('links').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await invalidateSlug(link.slug)
  return new NextResponse(null, { status: 204 })
}
