import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { generateRawApiKey, hashApiKey } from '@/lib/auth/api-key'

const schema = z.object({ name: z.string().min(1).max(50) })

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  // Limit to 10 active keys per user
  const { count } = await supabaseAdmin
    .from('api_keys')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_active', true)

  if ((count ?? 0) >= 10) {
    return NextResponse.json({ error: 'Maximum 10 active API keys allowed' }, { status: 400 })
  }

  const raw = generateRawApiKey()
  const hash = hashApiKey(raw)
  const prefix = raw.slice(0, 12)

  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .insert({
      user_id: userId,
      name: parsed.data.name,
      key_hash: hash,
      key_prefix: prefix,
    })
    .select('id, name, key_prefix, last_used_at, is_active, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Return raw key once — never stored
  return NextResponse.json({ key: raw, record: data }, { status: 201 })
}
