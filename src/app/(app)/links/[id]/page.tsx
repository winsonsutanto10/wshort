import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { AnalyticsPanel } from '@/components/analytics/AnalyticsPanel'
import { QRDisplay } from '@/components/qr/QRDisplay'
import { LinkDetailHeader } from '@/components/links/LinkDetailHeader'

export default async function LinkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { userId } = await auth()
  if (!userId) return null
  const { id } = await params

  const { data: link, error } = await supabaseAdmin
    .from('links')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error || !link) notFound()

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <LinkDetailHeader link={link} />
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <AnalyticsPanel linkId={id} />
        </div>
        <div>
          <QRDisplay linkId={id} slug={link.slug} />
        </div>
      </div>
    </div>
  )
}
