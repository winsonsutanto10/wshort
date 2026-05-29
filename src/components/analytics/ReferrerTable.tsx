'use client'

import type { AnalyticsBreakdown } from '@/types'

export function ReferrerTable({ data }: { data: AnalyticsBreakdown[] }) {
  if (!data?.length) return null

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Top Referrers</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
            <th className="pb-2 font-medium">Source</th>
            <th className="pb-2 font-medium text-right">Clicks</th>
            <th className="pb-2 font-medium text-right">Share</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map((item) => (
            <tr key={item.label}>
              <td className="py-2 text-gray-700">{item.label || 'Direct'}</td>
              <td className="py-2 text-right text-gray-600">{item.count}</td>
              <td className="py-2 text-right text-gray-400">{item.percentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
