import { NextResponse } from 'next/server'
import { isAdminAuth } from '@/lib/admin/auth'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { clerkClient } from '@clerk/nextjs/server'

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
  if (userIds.length === 0) return NextResponse.json({ users: [] })

  let clerkUsers: Record<string, { email: string; name: string }> = {}
  try {
    const client = await clerkClient()
    const { data: clerks } = await client.users.getUserList({ userId: userIds, limit: 100 })
    for (const u of clerks) {
      const email = u.emailAddresses[0]?.emailAddress ?? ''
      const name = [u.firstName, u.lastName].filter(Boolean).join(' ') || email.split('@')[0]
      clerkUsers[u.id] = { email, name }
    }
  } catch {
    // Clerk API unavailable — degrade gracefully
  }

  const users = userIds.map((userId) => ({
    userId,
    name: clerkUsers[userId]?.name ?? userId.slice(0, 12) + '…',
    email: clerkUsers[userId]?.email ?? null,
    linkCount: countsByUser[userId] ?? 0,
    quota: quotaByUser[userId] ?? 3,
  }))

  users.sort((a, b) => b.linkCount - a.linkCount)

  return NextResponse.json({ users })
}
