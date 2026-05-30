import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'

export const ADMIN_COOKIE = 'admin_session'
const SECRET = process.env.ADMIN_SECRET ?? 'dev-secret-change-me'
const DURATION = 24 * 60 * 60 * 1000

function sign(payload: string): string {
  const sig = createHmac('sha256', SECRET).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

export function createAdminToken(): string {
  const exp = Date.now() + DURATION
  const payload = Buffer.from(JSON.stringify({ exp })).toString('base64url')
  return sign(payload)
}

export function verifyAdminToken(token: string): boolean {
  const dot = token.lastIndexOf('.')
  if (dot === -1) return false
  const payload = token.slice(0, dot)
  const expected = sign(payload)
  if (token.length !== expected.length) return false
  try {
    if (!timingSafeEqual(Buffer.from(token), Buffer.from(expected))) return false
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString())
    return Date.now() < data.exp
  } catch {
    return false
  }
}

export async function isAdminAuth(): Promise<boolean> {
  const store = await cookies()
  const token = store.get(ADMIN_COOKIE)?.value
  return !!token && verifyAdminToken(token)
}

export function checkAdminCredentials(username: string, password: string): boolean {
  const expectedUser = process.env.ADMIN_USERNAME ?? 'admin'
  const expectedPass = process.env.ADMIN_PASSWORD ?? 'change-me'
  if (username.length !== expectedUser.length || password.length !== expectedPass.length) return false
  try {
    return (
      timingSafeEqual(Buffer.from(username), Buffer.from(expectedUser)) &&
      timingSafeEqual(Buffer.from(password), Buffer.from(expectedPass))
    )
  } catch {
    return false
  }
}
