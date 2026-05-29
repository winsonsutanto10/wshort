import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import Link from 'next/link'
import { BarChart2 } from 'lucide-react'
import { formatDate, formatNumber } from '@/lib/utils'

export default async function AnalyticsPage() {
  const { userId } = await auth()
  if (!userId) return null

  const { data: links } = await supabaseAdmin
    .from('links')
    .select('id, slug, title, original_url, click_count, created_at')
    .eq('user_id', userId)
    .order('click_count', { ascending: false })
    .limit(50)

  const totalClicks = (links ?? []).reduce((sum, l) => sum + l.click_count, 0)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">
          {totalClicks.toLocaleString()} total clicks across {(links ?? []).length} links
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Link</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Destination</th>
              <th className="text-right px-4 py-3 font-medium text-gray-500">Clicks</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Created</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(links ?? []).map((link) => (
              <tr key={link.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-blue-600 font-medium">/{link.slug}</td>
                <td className="px-4 py-3 text-gray-600 truncate max-w-xs">
                  {link.original_url.replace(/^https?:\/\//, '')}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">
                  {formatNumber(link.click_count)}
                </td>
                <td className="px-4 py-3 text-gray-400">{formatDate(link.created_at)}</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/links/${link.id}`}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                  >
                    <BarChart2 className="h-3.5 w-3.5" />
                    Detail
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
