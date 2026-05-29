'use client'

import type { AnalyticsBreakdown } from '@/types'

export function DeviceBreakdown({ data, title }: { data: AnalyticsBreakdown[]; title: string }) {
  if (!data?.length) return null

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">{title}</h3>
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.label}>
            <div className="flex justify-between text-xs text-gray-600 mb-0.5">
              <span>{item.label || 'Unknown'}</span>
              <span>{item.count} ({item.percentage}%)</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
