'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Copy, Check, Trash2, BarChart2, ExternalLink, Lock, Clock, Hash, Loader2,
} from 'lucide-react'
import type { LinkRow } from '@/types'
import { formatDate, formatDateTime, formatNumber, copyToClipboard, isLinkExpired } from '@/lib/utils'

export function LinkTable({ initialLinks }: { initialLinks: LinkRow[] }) {
  const router = useRouter()
  const [links, setLinks] = useState(initialLinks)
  useEffect(() => { setLinks(initialLinks) }, [initialLinks])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const baseUrl =
    typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL ?? ''

  async function handleCopy(link: LinkRow) {
    await copyToClipboard(`${baseUrl}/${link.slug}`)
    setCopiedId(link.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  async function handleDelete(link: LinkRow) {
    if (!confirm(`Delete /${link.slug}? This cannot be undone.`)) return
    setDeletingId(link.id)
    try {
      const res = await fetch(`/api/links/${link.id}`, { method: 'DELETE' })
      if (res.ok) {
        setLinks((prev) => prev.filter((l) => l.id !== link.id))
        router.refresh()
      }
    } finally {
      setDeletingId(null)
    }
  }

  if (links.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-400">
        No links yet. Create one above.
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full text-sm text-gray-900">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Link</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Destination</th>
            <th className="text-right px-4 py-3 font-medium text-gray-500">Clicks</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500">Created</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {links.map((link) => {
            const expired = isLinkExpired(link)
            const inactive = !link.is_active || expired
            return (
              <tr key={link.id} className={`hover:bg-gray-50 group ${inactive ? 'opacity-60' : ''}`}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium text-blue-600">/{link.slug}</span>
                    {link.password_hash && (
                      <span aria-label="Password protected">
                        <Lock className="h-3 w-3 text-gray-400" />
                      </span>
                    )}
                    {link.expires_at && (
                      <span aria-label={`Expires ${formatDateTime(link.expires_at)}`}>
                        <Clock className="h-3 w-3 text-gray-400" />
                      </span>
                    )}
                    {!link.is_active && (
                      <span className="text-xs bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">inactive</span>
                    )}
                    {link.is_active && expired && link.expires_at && new Date(link.expires_at).getTime() < Date.now() && (
                      <span className="text-xs bg-orange-100 text-orange-600 rounded px-1.5 py-0.5">expired</span>
                    )}
                    {link.is_active && expired && link.max_clicks && link.click_count >= link.max_clicks && (
                      <span className="text-xs bg-orange-100 text-orange-600 rounded px-1.5 py-0.5">limit reached</span>
                    )}
                  </div>
                  {link.title && (
                    <p className="text-xs text-gray-400 mt-0.5">{link.title}</p>
                  )}
                  {link.expires_at && (
                    <p className="text-xs text-gray-400 mt-0.5">Expires {formatDateTime(link.expires_at)}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <a
                    href={link.original_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-600 truncate max-w-xs block"
                  >
                    {link.original_url.replace(/^https?:\/\//, '')}
                  </a>
                </td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">
                  {link.max_clicks
                    ? <span className={link.click_count >= link.max_clicks ? 'text-red-600' : ''}>{formatNumber(link.click_count)} / {formatNumber(link.max_clicks)}</span>
                    : formatNumber(link.click_count)
                  }
                </td>
                <td className="px-4 py-3 text-gray-400">{formatDate(link.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopy(link)}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                      title="Copy short URL"
                    >
                      {copiedId === link.id ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                    <Link
                      href={`/links/${link.id}`}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                      title="View analytics"
                    >
                      <BarChart2 className="h-4 w-4" />
                    </Link>
                    <a
                      href={`/${link.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                      title="Visit short link"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(link)}
                      disabled={deletingId === link.id}
                      className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 disabled:opacity-50"
                      title="Delete link"
                    >
                      {deletingId === link.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
