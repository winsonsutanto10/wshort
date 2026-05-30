'use client'

import { useState } from 'react'
import { Copy, Check, ExternalLink, Lock, Clock, Hash } from 'lucide-react'
import type { LinkRow } from '@/types'
import { copyToClipboard, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

export function LinkDetailHeader({ link }: { link: LinkRow }) {
  const [copied, setCopied] = useState(false)
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const shortUrl = `${baseUrl}/${link.slug}`

  async function handleCopy() {
    await copyToClipboard(shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">/{link.slug}</h1>
            {link.password_hash && <Lock className="h-4 w-4 text-gray-400" />}
            {link.expires_at && <Clock className="h-4 w-4 text-gray-400" />}
            {link.max_clicks && <Hash className="h-4 w-4 text-gray-400" />}
            {!link.is_active && (
              <span className="text-xs bg-gray-100 text-gray-500 rounded px-2 py-0.5">inactive</span>
            )}
          </div>
          {link.title && <p className="text-sm text-gray-500 mt-0.5">{link.title}</p>}
          <a
            href={link.original_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline mt-1 flex items-center gap-1"
          >
            {link.original_url.slice(0, 80)}{link.original_url.length > 80 ? '…' : ''}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <Button variant="secondary" onClick={handleCopy}>
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied!' : 'Copy link'}
        </Button>
      </div>
      <div className="flex gap-4 mt-3 text-sm text-gray-500">
        <span>{link.click_count.toLocaleString()} clicks</span>
        <span>Created {formatDate(link.created_at)}</span>
        {link.expires_at && <span>Expires {formatDate(link.expires_at)}</span>}
        {link.max_clicks && <span>Max {link.max_clicks.toLocaleString()} clicks</span>}
      </div>
    </div>
  )
}
