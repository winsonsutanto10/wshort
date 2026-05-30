'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (!res.ok) {
        setError('Invalid credentials')
        return
      }
      router.push('/admin/panel')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg border border-gray-200 p-8 w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
            <Shield className="h-5 w-5 text-blue-600" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900">Admin Login</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" variant="primary" disabled={loading} className="w-full">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign in
          </Button>
        </form>
      </div>
    </div>
  )
}
