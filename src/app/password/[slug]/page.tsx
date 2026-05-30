'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function PasswordPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, password }),
      })
      const data = await res.json()
      if (res.ok) {
        router.push(`/${slug}`)
      } else {
        setError(data.error ?? 'Incorrect password')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <h1 className="text-center text-lg font-semibold text-gray-900">Password Required</h1>
        <p className="text-center text-sm text-gray-500 mt-1 mb-5">
          This link is password-protected. Enter the password to continue.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" variant="primary" disabled={loading || !password} className="w-full">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Continue
          </Button>
        </form>
      </div>
    </div>
  )
}
