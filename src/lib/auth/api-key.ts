import { createHash, randomBytes } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase/admin'

export function generateRawApiKey(): string {
  const random = randomBytes(24).toString('base64url')
  return `sk_live_${random}`
}

export function hashApiKey(raw: string): string {
  return createHash('sha256').update(raw).digest('hex')
}

export async function validateApiKey(raw: string): Promise<{ userId: string } | null> {
  if (!raw.startsWith('sk_live_')) return null
  const hash = hashApiKey(raw)

  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .select('id, user_id, is_active')
    .eq('key_hash', hash)
    .single()

  if (error || !data || !data.is_active) return null

  await supabaseAdmin
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', data.id)

  return { userId: data.user_id }
}

export async function requireApiKey(request: Request): Promise<{ userId: string } | Response> {
  const auth = request.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) {
    return Response.json({ error: 'Missing API key' }, { status: 401 })
  }
  const raw = auth.slice(7)
  const result = await validateApiKey(raw)
  if (!result) {
    return Response.json({ error: 'Invalid or revoked API key' }, { status: 401 })
  }
  return result
}
