import { NextResponse } from 'next/server'
import { isAdminAuth } from '@/lib/admin/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  if (!(await isAdminAuth())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: links } = await supabaseAdmin.from('links').select('user_id')
  const { data: settings } = await supabaseAdmin.from('user_settings').select('*')

  const countsByUser: Record<string, number> = {}
  for (const link of links ?? []) {
    countsByUser[link.user_id] = (countsByUser[link.user_id] ?? 0) + 1
  }

  const quotaByUser: Record<string, number> = {}
  for (const s of settings ?? []) {
    quotaByUser[s.user_id] = s.link_quota
  }

  const userIds = Object.keys(countsByUser)
  const users = userIds.map((userId) => ({
    userId,
    linkCount: countsByUser[userId] ?? 0,
    quota: quotaByUser[userId] ?? 3,
  }))

  users.sort((a, b) => b.linkCount - a.linkCount)

  return NextResponse.json({ users })
}
