import { supabaseAdmin } from '@/lib/supabase/admin'

export async function trackClick(linkId: string): Promise<number> {
  try {
    const { data, error } = await supabaseAdmin.rpc('increment_click_count', { link_id_param: linkId })
    if (error) throw error
    return typeof data === 'number' ? data : 0
  } catch (err) {
    console.error('[analytics] track error:', err)
    return 0
  }
}
