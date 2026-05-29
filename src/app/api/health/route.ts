import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { redis } from '@/lib/redis/client'

export async function GET() {
  const checks = await Promise.allSettled([
    supabaseAdmin.from('links').select('id').limit(1),
    redis.ping(),
  ])

  const db = checks[0].status === 'fulfilled'
  const cache = checks[1].status === 'fulfilled'

  return NextResponse.json(
    { ok: db && cache, db, cache },
    { status: db && cache ? 200 : 503 }
  )
}
