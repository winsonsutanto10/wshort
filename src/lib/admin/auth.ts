import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'

export const ADMIN_COOKIE = 'admin_session'
const DURATION = 24 * 60 * 60 * 1000

function requireEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`${name} is not set. Configure ADMIN_SECRET, ADMIN_USERNAME, and ADMIN_PASSWORD.`)
  return v
}

const SECRET = requireEnv('ADMIN_SECRET')
const ADMIN_USERNAME_ENV = requireEnv('ADMIN_USERNAME')
const ADMIN_PASSWORD_ENV = requireEnv('ADMIN_PASSWORD')

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
  if (username.length !== ADMIN_USERNAME_ENV.length || password.length !== ADMIN_PASSWORD_ENV.length) {
    return false
  }
  try {
    return (
      timingSafeEqual(Buffer.from(username), Buffer.from(ADMIN_USERNAME_ENV)) &&
      timingSafeEqual(Buffer.from(password), Buffer.from(ADMIN_PASSWORD_ENV))
    )
  } catch {
    return false
  }
}
