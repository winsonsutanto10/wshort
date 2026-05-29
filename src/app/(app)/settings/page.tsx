import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { ApiKeyManager } from '@/components/settings/ApiKeyManager'

export default async function SettingsPage() {
  const { userId } = await auth()
  if (!userId) return null

  const { data: keys } = await supabaseAdmin
    .from('api_keys')
    .select('id, name, key_prefix, last_used_at, is_active, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your API keys and account</p>
      </div>
      <ApiKeyManager initialKeys={keys ?? []} />
    </div>
  )
}
