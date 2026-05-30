import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { UserButton } from '@clerk/nextjs'

export default async function SettingsPage() {
  const { userId } = await auth()
  if (!userId) return null

  const [{ data: links }, { data: userSettings }] = await Promise.all([
    supabaseAdmin
      .from('links')
      .select('id', { count: 'exact', head: false })
      .eq('user_id', userId),
    supabaseAdmin
      .from('user_settings')
      .select('link_quota')
      .eq('user_id', userId)
      .maybeSingle(),
  ])

  const linkCount = links?.length ?? 0
  const quota = userSettings?.link_quota ?? 3

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Account and usage</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Account</h2>
        <div className="flex items-center gap-3">
          <UserButton />
          <p className="text-sm text-gray-500">Manage your profile and sign out</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-3">
        <h2 className="font-semibold text-gray-900">Link Quota</h2>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">Links used</p>
          <span className="text-sm font-semibold text-gray-900">{linkCount} / {quota}</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${Math.min(100, Math.round((linkCount / quota) * 100))}%` }}
          />
        </div>
        {linkCount >= quota && (
          <p className="text-xs text-red-600">
            Limit reached. Contact an admin to increase your quota.
          </p>
        )}
      </div>
    </div>
  )
}
