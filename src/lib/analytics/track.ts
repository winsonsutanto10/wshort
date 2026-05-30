import { supabaseAdmin } from '@/lib/supabase/admin'

export async function trackClick(_request: Request, linkId: string, _slug: string): Promise<void> {
  try {
    await supabaseAdmin.rpc('increment_click_count', { link_id_param: linkId })
  } catch (err) {
    console.error('[analytics] track error:', err)
  }
}
