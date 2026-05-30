'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, LogOut, Loader2, Check } from 'lucide-react'
import { Input } from '@/components/ui/Input'

interface UserRow {
  userId: string
  name: string
  email: string | null
  linkCount: number
  quota: number
}

export function AdminPanel() {
  const router = useRouter()
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [quotaInputs, setQuotaInputs] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    const res = await fetch('/api/admin/users')
    if (!res.ok) { router.push('/admin'); return }
    const data = await res.json()
    setUsers(data.users)
    const inputs: Record<string, string> = {}
    for (const u of data.users) inputs[u.userId] = String(u.quota)
    setQuotaInputs(inputs)
    setLoading(false)
  }, [router])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  async function handleSaveQuota(userId: string) {
    const quota = Number(quotaInputs[userId])
    if (!Number.isInteger(quota) || quota < 1) return
    setSaving(userId)
    const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/quota`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quota }),
    })
    setSaving(null)
    if (res.ok) {
      setUsers((prev) => prev.map((u) => u.userId === userId ? { ...u, quota } : u))
      setSaved(userId)
      setTimeout(() => setSaved(null), 2000)
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin')
  }

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700">User Quotas</h2>
          <p className="text-xs text-gray-400 mt-0.5">Default quota is 3 links per user</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        ) : users.length === 0 ? (
          <p className="text-center text-gray-400 py-12 text-sm">No users yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">User</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Links used</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Quota</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.userId} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    {user.email && (
                      <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={user.linkCount >= user.quota ? 'text-red-600 font-medium' : 'text-gray-700'}>
                      {user.linkCount} / {user.quota}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Input
                      type="number"
                      min={1}
                      max={1000}
                      value={quotaInputs[user.userId] ?? user.quota}
                      onChange={(e) =>
                        setQuotaInputs((prev) => ({ ...prev, [user.userId]: e.target.value }))
                      }
                      className="w-20 text-right"
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleSaveQuota(user.userId)}
                      disabled={saving === user.userId}
                      className="flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 ml-auto"
                    >
                      {saving === user.userId ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : saved === user.userId ? (
                        <Check className="h-3 w-3" />
                      ) : null}
                      Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
