'use client'

import { useState } from 'react'
import { Key, Trash2, Copy, Check, Loader2, Eye } from 'lucide-react'
import type { ApiKeyRow } from '@/types'
import { formatDate, copyToClipboard } from '@/lib/utils'

export function ApiKeyManager({ initialKeys }: { initialKeys: Partial<ApiKeyRow>[] }) {
  const [keys, setKeys] = useState(initialKeys)
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [copiedNewKey, setCopiedNewKey] = useState(false)
  const [revokingId, setRevokingId] = useState<string | null>(null)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (res.ok) {
        setNewKey(data.key)
        setKeys((prev) => [data.record, ...prev])
        setName('')
      }
    } finally {
      setCreating(false)
    }
  }

  async function handleRevoke(id: string) {
    if (!confirm('Revoke this API key? Any integrations using it will stop working.')) return
    setRevokingId(id)
    try {
      const res = await fetch(`/api/keys/${id}`, { method: 'DELETE' })
      if (res.ok) setKeys((prev) => prev.filter((k) => k.id !== id))
    } finally {
      setRevokingId(null)
    }
  }

  async function copyNewKey() {
    if (!newKey) return
    await copyToClipboard(newKey)
    setCopiedNewKey(true)
    setTimeout(() => setCopiedNewKey(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4">API Keys</h2>
        <p className="text-sm text-gray-500 mb-4">
          Use API keys to shorten URLs from the terminal or your own tools.
          Keys are shown once — store them securely.
        </p>

        {newKey && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-xs font-medium text-green-800 mb-1">
              New API key — copy it now, it won't be shown again:
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-white border border-green-200 rounded px-2 py-1.5 font-mono text-green-900 break-all">
                {newKey}
              </code>
              <button onClick={copyNewKey} className="p-1.5 rounded hover:bg-green-100">
                {copiedNewKey ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 text-green-600" />
                )}
              </button>
            </div>
            <button
              onClick={() => setNewKey(null)}
              className="mt-2 text-xs text-green-700 hover:underline"
            >
              I've saved it, dismiss
            </button>
          </div>
        )}

        <form onSubmit={handleCreate} className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Key name (e.g. CLI)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={50}
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={creating || !name}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
            Create
          </button>
        </form>

        {keys.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No API keys yet</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {keys.map((key) => (
              <div key={key.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{key.name}</p>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">
                    {key.key_prefix}••••••••
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Created {formatDate(key.created_at ?? null)} ·{' '}
                    {key.last_used_at ? `Last used ${formatDate(key.last_used_at)}` : 'Never used'}
                  </p>
                </div>
                <button
                  onClick={() => handleRevoke(key.id!)}
                  disabled={revokingId === key.id}
                  className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
                  title="Revoke"
                >
                  {revokingId === key.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
        <h3 className="font-medium text-gray-700 mb-2 text-sm">API Usage</h3>
        <pre className="text-xs bg-white border border-gray-200 rounded p-3 overflow-x-auto text-gray-700">
{`# Shorten a URL
curl -X POST ${typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/api/v1/shorten \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com"}'

# Response:
# {"link": {...}, "short_url": "https://your-domain.com/abc123"}`}
        </pre>
      </div>
    </div>
  )
}
