import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireApiKey } from '@/lib/auth/api-key'

export async function GET(request: NextRequest) {
  const authResult = await requireApiKey(request)
  if (authResult instanceof Response) return authResult
  const { userId } = authResult

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, Number(searchParams.get('page') ?? 1))
  const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') ?? 20)))
  const from = (page - 1) * limit

  const { data, error, count } = await supabaseAdmin
    .from('links')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ links: data, total: count, page, limit })
}
