import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuth } from '@/lib/admin/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  if (!(await isAdminAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { userId } = await params
  const body = await request.json()
  const quota = Number(body?.quota)

  if (!Number.isInteger(quota) || quota < 1 || quota > 1000) {
    return NextResponse.json({ error: 'Quota must be 1–1000' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('user_settings')
    .upsert({ user_id: userId, link_quota: quota }, { onConflict: 'user_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, userId, quota })
}
