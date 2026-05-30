import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { data: link, error } = await supabaseAdmin
    .from('links')
    .select('id, slug, click_count')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error || !link) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ total_clicks: link.click_count })
}
