import { UAParser } from 'ua-parser-js'
import { createHash } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { incrementDailyClicks, addUniqueVisitor } from '@/lib/redis/client'

function hashIp(ip: string): string {
  return createHash('sha256').update(ip + process.env.CLERK_SECRET_KEY).digest('hex').slice(0, 32)
}

function cleanReferrer(referrer: string | null): string | null {
  if (!referrer) return null
  try {
    const url = new URL(referrer)
    return url.hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

function getDeviceType(parser: UAParser): string {
  const device = parser.getDevice()
  if (device.type === 'mobile') return 'mobile'
  if (device.type === 'tablet') return 'tablet'
  return 'desktop'
}

export async function trackClick(request: Request, linkId: string, slug: string): Promise<void> {
  try {
    const ua = request.headers.get('user-agent') ?? ''
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'unknown'
    const country =
      request.headers.get('cf-ipcountry') ??
      request.headers.get('x-vercel-ip-country') ??
      null
    const referrer = cleanReferrer(request.headers.get('referer'))

    const parser = new UAParser(ua)
    const browser = parser.getBrowser().name ?? null
    const os = parser.getOS().name ?? null
    const deviceType = getDeviceType(parser)
    const ipHash = hashIp(ip)

    await Promise.all([
      supabaseAdmin.from('click_events').insert({
        link_id: linkId,
        slug,
        ip_hash: ipHash,
        country,
        referrer,
        device_type: deviceType,
        browser,
        os,
      }),
      supabaseAdmin.rpc('increment_click_count', { link_id_param: linkId }),
      incrementDailyClicks(linkId),
      addUniqueVisitor(linkId, ipHash),
    ])
  } catch (err) {
    console.error('[analytics] track error:', err)
  }
}
