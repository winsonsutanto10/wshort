import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  // Verify ownership
  const { data: link, error: linkError } = await supabaseAdmin
    .from('links')
    .select('id, slug, click_count')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (linkError || !link) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from') ?? new Date(Date.now() - 30 * 86400000).toISOString()
  const to = searchParams.get('to') ?? new Date().toISOString()

  const { data: events, error } = await supabaseAdmin
    .from('click_events')
    .select('clicked_at, ip_hash, country, device_type, browser, os, referrer')
    .eq('link_id', id)
    .gte('clicked_at', from)
    .lte('clicked_at', to)
    .order('clicked_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!events) return NextResponse.json({ error: 'No data' }, { status: 500 })

  // Time-series: group by day
  const dayMap = new Map<string, { clicks: number; visitors: Set<string> }>()
  for (const e of events) {
    const day = e.clicked_at.split('T')[0]
    if (!dayMap.has(day)) dayMap.set(day, { clicks: 0, visitors: new Set() })
    const d = dayMap.get(day)!
    d.clicks++
    if (e.ip_hash) d.visitors.add(e.ip_hash)
  }
  const timeSeries = Array.from(dayMap.entries()).map(([date, d]) => ({
    date,
    clicks: d.clicks,
    unique_visitors: d.visitors.size,
  }))

  // Breakdowns
  const breakdown = (field: string) => {
    const counts = new Map<string, number>()
    for (const e of events) {
      const val = (e as Record<string, string>)[field] ?? 'Unknown'
      counts.set(val, (counts.get(val) ?? 0) + 1)
    }
    const total = events.length || 1
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([label, count]) => ({ label, count, percentage: Math.round((count / total) * 100) }))
  }

  const uniqueVisitors = new Set(events.map((e) => e.ip_hash).filter(Boolean)).size

  return NextResponse.json({
    total_clicks: events.length,
    unique_visitors: uniqueVisitors,
    time_series: timeSeries,
    by_country: breakdown('country'),
    by_device: breakdown('device_type'),
    by_browser: breakdown('browser'),
    by_referrer: breakdown('referrer'),
  })
}
