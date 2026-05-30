import { NextRequest, NextResponse } from 'next/server'
import { checkAdminCredentials, createAdminToken, ADMIN_COOKIE } from '@/lib/admin/auth'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { username, password } = body ?? {}

  if (typeof username !== 'string' || typeof password !== 'string') {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  if (!checkAdminCredentials(username, password)) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = createAdminToken()
  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 24 * 60 * 60,
  })
  return res
}
