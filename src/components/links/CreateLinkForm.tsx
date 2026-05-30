'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Link2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface Props {
  linkCount: number
  quota: number
}

export function CreateLinkForm({ linkCount, quota }: Props) {
  const router = useRouter()
  const atLimit = linkCount >= quota
  const [url, setUrl] = useState('')
  const [slug, setSlug] = useState('')
  const [title, setTitle] = useState('')
  const [password, setPassword] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [maxClicks, setMaxClicks] = useState('')
  const [advanced, setAdvanced] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'taken' | 'available'>('idle')

  async function checkSlug(value: string) {
    if (!value) { setSlugStatus('idle'); return }
    setSlugStatus('checking')
    const res = await fetch(`/api/links/check-slug?slug=${encodeURIComponent(value)}`)
    const data = await res.json()
    setSlugStatus(data.available ? 'available' : 'taken')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const body: Record<string, unknown> = { url }
      if (slug) body.slug = slug
      if (title) body.title = title
      if (password) body.password = password
      if (expiresAt) body.expires_at = new Date(expiresAt).toISOString()
      if (maxClicks) body.max_clicks = Number(maxClicks)

      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Failed to create link')
        return
      }
      setUrl(''); setSlug(''); setTitle(''); setPassword(''); setExpiresAt(''); setMaxClicks('')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg border border-gray-200 p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Shorten a URL</h2>
        <span className={cn(
          'text-xs font-medium px-2 py-0.5 rounded-full',
          atLimit ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
        )}>
          {linkCount} / {quota} links used
        </span>
      </div>

      {atLimit && (
        <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">
          Link limit reached ({quota} max). Contact admin to increase your quota.
        </p>
      )}

      <div className="flex gap-2">
        <Input
          type="url"
          placeholder="https://example.com/very-long-url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          disabled={atLimit}
          className="flex-1"
        />
        <Button
          type="button"
          variant="secondary"
          onClick={() => setAdvanced((v) => !v)}
          disabled={atLimit}
        >
          Options {advanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={loading || !url || atLimit}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
          Shorten
        </Button>
      </div>

      {advanced && (
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Custom slug
              {slugStatus === 'taken' && <span className="text-red-500 ml-2">Taken</span>}
              {slugStatus === 'available' && <span className="text-green-600 ml-2">Available</span>}
            </label>
            <Input
              type="text"
              placeholder="my-resume"
              value={slug}
              onChange={(e) => { setSlug(e.target.value); checkSlug(e.target.value) }}
              className={cn(slugStatus === 'taken' && 'border-red-400')}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
            <Input
              type="text"
              placeholder="My Resume"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
            <Input
              type="password"
              placeholder="Optional password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Max clicks</label>
            <Input
              type="number"
              placeholder="Unlimited"
              min="1"
              value={maxClicks}
              onChange={(e) => setMaxClicks(e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">Expires at</label>
            <Input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </form>
  )
}
