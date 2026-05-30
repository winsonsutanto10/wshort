import { redis } from '@/lib/redis/client'
import { NextRequest } from 'next/server'

export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

// Fixed-window rate limiter. Returns true if the request is allowed.
export async function rateLimit(
  key: string,
  limit: number,
  windowSecs: number,
): Promise<boolean> {
  const rlKey = `rl:${key}`
  const count = await redis.incr(rlKey)
  if (count === 1) await redis.expire(rlKey, windowSecs)
  return count <= limit
}
