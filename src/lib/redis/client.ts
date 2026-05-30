import { Redis } from '@upstash/redis'
import { env } from '@/env'
import type { RedisSlugValue } from '@/types'

export const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
})

const SLUG_TTL = 60 * 60 * 24 // 24 hours
const EXPIRED_TTL = 60 * 60 // 1 hour tombstone

export const SLUG_KEY = (slug: string) => `slug:${slug}`
export const PW_TOKEN_KEY = (slug: string, token: string) => `pw_token:${slug}:${token}`

export async function cacheSlug(slug: string, value: RedisSlugValue) {
  await redis.set(SLUG_KEY(slug), JSON.stringify(value), { ex: SLUG_TTL })
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
  try {
    return JSON.parse(raw) as RedisSlugValue
  } catch {
    return null
  }
}
