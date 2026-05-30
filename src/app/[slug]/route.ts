import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getSlugValue, cacheSlug, markSlugExpired, redis, PW_TOKEN_KEY } from '@/lib/redis/client'
import { trackClick } from '@/lib/analytics/track'

export const runtime = 'nodejs'
// Set to 'edge' after verifying Edge compatibility in production

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  // 1. Try Redis cache
  const cached = await getSlugValue(slug)

  if (cached === 'EXPIRED') {
    return new NextResponse('Link has expired', { status: 410 })
  }

  let linkData = cached

  if (!linkData) {
    // 2. Cache miss — query DB
    const { data, error } = await supabaseAdmin
      .from('links')
      .select('id, original_url, is_active, password_hash, expires_at, max_clicks, click_count')
      .eq('slug', slug)
      .single()

    if (error || !data) {
      return new NextResponse('Not found', { status: 404 })
    }

    if (!data.is_active) {
      return new NextResponse('Link is inactive', { status: 410 })
    }

    linkData = {
      originalUrl: data.original_url,
      linkId: data.id,
      hasPassword: !!data.password_hash,
      expiresAt: data.expires_at ? new Date(data.expires_at).getTime() : 0,
      maxClicks: data.max_clicks ?? 0,
    }

    // Populate Redis (only if not expired/maxed)
    const now = Date.now()
    const isExpired = linkData.expiresAt > 0 && now > linkData.expiresAt
    const isMaxed = linkData.maxClicks > 0 && data.click_count >= linkData.maxClicks

    if (isExpired || isMaxed) {
      await markSlugExpired(slug)
      return new NextResponse('Link has expired', { status: 410 })
    }

    await cacheSlug(slug, linkData)
  }

  // 3. Check expiry from cached value
  const now = Date.now()
  if (linkData.expiresAt > 0 && now > linkData.expiresAt) {
    await markSlugExpired(slug)
    return new NextResponse('Link has expired', { status: 410 })
  }

  // 4. Check password protection
  if (linkData.hasPassword) {
    const pwCookie = request.cookies.get(`pw_verified_${slug}`)?.value
    const valid = pwCookie ? await redis.get(PW_TOKEN_KEY(slug, pwCookie)) : null
    if (!valid) {
      return NextResponse.redirect(new URL(`/password/${slug}`, request.url))
    }
  }

  // 5. Skip tracking for browser prefetch requests
  const purpose = request.headers.get('Purpose') ?? request.headers.get('Sec-Purpose') ?? ''
  if (!purpose.includes('prefetch')) {
    const newCount = await trackClick(linkData.linkId)
    if (linkData.maxClicks > 0 && newCount >= linkData.maxClicks) {
      void markSlugExpired(slug)
    }
  }

  // 6. Redirect — guard against non-http(s) URLs stored in DB
  if (!/^https?:\/\//i.test(linkData.originalUrl)) {
    return new NextResponse('Invalid redirect target', { status: 400 })
  }
  return NextResponse.redirect(linkData.originalUrl, { status: 302 })
}
