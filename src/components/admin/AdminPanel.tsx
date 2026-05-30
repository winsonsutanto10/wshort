'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, LogOut, Loader2, Check, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { DEFAULT_LINK_QUOTA } from '@/lib/constants'

interface UserRow {
  userId: string
  name: string
  email: string | null
  linkCount: number
  quota: number
}

const PAGE_SIZE = 10

export function AdminPanel() {
  const router = useRouter()
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [quotaInputs, setQuotaInputs] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return users
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        (u.email ?? '').toLowerCase().includes(q)
    )
  }, [users, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageUsers = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function handleSearchChange(val: string) {
    setSearch(val)
    setPage(1)
  }

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
    } else {
      const data = await res.json().catch(() => ({}))
      setSaveError(data.error ?? 'Failed to save quota')
      setTimeout(() => setSaveError(null), 3000)
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
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-700">User Quotas</h2>
            <p className="text-xs text-gray-400 mt-0.5">Default quota is {DEFAULT_LINK_QUOTA} links per user</p>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            <Input
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-8 text-xs"
            />
          </div>
        </div>

        {saveError && (
          <p className="px-4 py-2 text-sm text-red-600 bg-red-50 border-b border-red-100">
            {saveError}
          </p>
        )}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-12 text-sm">
            {search ? 'No users match your search' : 'No users yet'}
          </p>
        ) : (
          <>
            <table className="w-full text-sm text-gray-900">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">User</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Links used</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Quota</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageUsers.map((user) => (
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
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSaveQuota(user.userId)}
                        disabled={saving === user.userId}
                      >
                        {saving === user.userId ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : saved === user.userId ? (
                          <Check className="h-3 w-3" />
                        ) : null}
                        Save
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-500">
                  {filtered.length} user{filtered.length !== 1 ? 's' : ''}
                  {search && ' found'}
                  {' · '}page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Prev
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
