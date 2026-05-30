import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { redis, PW_TOKEN_KEY } from '@/lib/redis/client'
import { randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

const schema = z.object({
  slug: z.string().min(1),
  password: z.string().min(1),
})

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { slug, password } = parsed.data

  // 10 attempts per 60 s per IP+slug
  const allowed = await rateLimit(`pw:${ip}:${slug}`, 10, 60)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
  }

  const { data, error } = await supabaseAdmin
    .from('links')
    .select('password_hash, is_active')
    .eq('slug', slug)
    .single()

  if (error || !data || !data.is_active || !data.password_hash) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const match = await bcrypt.compare(password, data.password_hash)
  if (!match) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  const token = randomBytes(16).toString('hex')
  await redis.set(PW_TOKEN_KEY(slug, token), '1', { ex: 600 }) // 10 min

  const response = NextResponse.json({ ok: true })
  response.cookies.set(`pw_verified_${slug}`, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: `/${slug}`,
  })
  return response
}
