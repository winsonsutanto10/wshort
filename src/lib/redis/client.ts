import { Redis } from '@upstash/redis'
import type { RedisSlugValue } from '@/types'

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('Missing Upstash Redis environment variables')
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

const SLUG_TTL = 60 * 60 * 24 // 24 hours
const EXPIRED_TTL = 60 * 60 // 1 hour tombstone

export const SLUG_KEY = (slug: string) => `slug:${slug}`
export const CLICKS_KEY = (linkId: string, date: string) => `clicks:${linkId}:${date}`
export const UV_KEY = (linkId: string, date: string) => `uv:${linkId}:${date}`
export const RATELIMIT_KEY = (ip: string) => `ratelimit:${ip}`
export const PW_TOKEN_KEY = (slug: string, token: string) => `pw_token:${slug}:${token}`

export function serializeSlugValue(v: RedisSlugValue): string {
  return [
    v.originalUrl,
    v.linkId,
    v.hasPassword ? '1' : '0',
    v.expiresAt,
    v.maxClicks,
  ].join('|')
}

export function deserializeSlugValue(raw: string): RedisSlugValue | null {
  if (raw === 'EXPIRED') return null
  const parts = raw.split('|')
  if (parts.length < 5) return null
  // URL may contain | chars — reconstruct it from all parts before the last 4
  const metaParts = parts.slice(-4)
  const urlParts = parts.slice(0, parts.length - 4)
  const [linkId, hasPw, expiresAt, maxClicks] = metaParts
  return {
    originalUrl: urlParts.join('|'),
    linkId,
    hasPassword: hasPw === '1',
    expiresAt: Number(expiresAt),
    maxClicks: Number(maxClicks),
  }
}

export async function cacheSlug(slug: string, value: RedisSlugValue) {
  await redis.set(SLUG_KEY(slug), serializeSlugValue(value), { ex: SLUG_TTL })
}

export async function markSlugExpired(slug: string) {
  await redis.set(SLUG_KEY(slug), 'EXPIRED', { ex: EXPIRED_TTL })
}

export async function invalidateSlug(slug: string) {
  await redis.del(SLUG_KEY(slug))
}

export async function getSlugValue(slug: string): Promise<RedisSlugValue | 'EXPIRED' | null> {
  const raw = await redis.get<string>(SLUG_KEY(slug))
  if (raw === null) return null
  if (raw === 'EXPIRED') return 'EXPIRED'
  return deserializeSlugValue(raw)
}

export async function incrementDailyClicks(linkId: string): Promise<void> {
  const date = new Date().toISOString().split('T')[0]
  const key = CLICKS_KEY(linkId, date)
  await redis.incr(key)
  await redis.expire(key, 60 * 60 * 24 * 8)
}

export async function addUniqueVisitor(linkId: string, ipHash: string): Promise<void> {
  const date = new Date().toISOString().split('T')[0]
  const key = UV_KEY(linkId, date)
  await redis.pfadd(key, ipHash)
  await redis.expire(key, 60 * 60 * 24 * 8)
}

export async function markSlugExpiredIfNeeded(slug: string) {
  await markSlugExpired(slug)
}
