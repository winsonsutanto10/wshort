import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { CreateLinkForm } from '@/components/links/CreateLinkForm'
import { LinkTable } from '@/components/links/LinkTable'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) return null

  const { data: links } = await supabaseAdmin
    .from('links')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  const totalClicks = (links ?? []).reduce((sum, l) => sum + l.click_count, 0)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Manage and track your short links</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Links" value={(links ?? []).length} />
        <StatCard label="Total Clicks" value={totalClicks} />
        <StatCard
          label="Active Links"
          value={(links ?? []).filter((l) => l.is_active).length}
        />
      </div>

      <CreateLinkForm />
      <LinkTable initialLinks={links ?? []} />
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
