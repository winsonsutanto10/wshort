import { customAlphabet } from 'nanoid'

const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const nanoid = customAlphabet(ALPHABET, 6)

export function generateSlug(): string {
  return nanoid()
}

export const RESERVED_SLUGS = new Set([
  'api', 'dashboard', 'sign-in', 'sign-up', 'settings', 'analytics',
  'password', 'health', 'links', 'favicon.ico', 'robots.txt', 'sitemap.xml',
  '_next', 'static', 'public', 'admin', 'login', 'logout', 'register',
  'app', 'www', 'mail', 'about', 'contact', 'pricing', 'blog',
])

const SLUG_REGEX = /^[a-zA-Z0-9_-]{3,50}$/

export function validateSlug(slug: string): { valid: boolean; error?: string } {
  if (!SLUG_REGEX.test(slug)) {
    return { valid: false, error: 'Slug must be 3–50 characters: letters, numbers, _ or -' }
  }
  if (RESERVED_SLUGS.has(slug.toLowerCase())) {
    return { valid: false, error: 'That slug is reserved' }
  }
  return { valid: true }
}
