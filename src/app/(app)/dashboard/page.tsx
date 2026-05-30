import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { CreateLinkForm } from '@/components/links/CreateLinkForm'
import { LinkTable } from '@/components/links/LinkTable'
import { isLinkExpired } from '@/lib/utils'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) return null

  const [{ data: links }, { data: userSettings }] = await Promise.all([
    supabaseAdmin
      .from('links')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50),
    supabaseAdmin
      .from('user_settings')
      .select('link_quota')
      .eq('user_id', userId)
      .maybeSingle(),
  ])

  const linkList = links ?? []
  const quota = userSettings?.link_quota ?? 3
  const totalClicks = linkList.reduce((sum, l) => sum + l.click_count, 0)
  const activeLinks = linkList.filter((l) => !isLinkExpired(l)).length

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Manage and track your short links</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Links" value={linkList.length} />
        <StatCard label="Total Clicks" value={totalClicks} />
        <StatCard label="Active Links" value={activeLinks} />
      </div>

      <CreateLinkForm linkCount={linkList.length} quota={quota} />
      <LinkTable initialLinks={linkList} />
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value.toLocaleString()}</p>
    </div>
  )
}
