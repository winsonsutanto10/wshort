'use client'

import { useEffect, useState } from 'react'
import type { LinkAnalytics } from '@/types'
import { ClickChart } from './ClickChart'
import { DeviceBreakdown } from './DeviceBreakdown'
import { ReferrerTable } from './ReferrerTable'

export function AnalyticsPanel({ linkId }: { linkId: string }) {
  const [data, setData] = useState<LinkAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/analytics/${linkId}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [linkId])

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-400">
        Loading analytics…
      </div>
    )
  }

  if (!data || data.total_clicks === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-400">
        No clicks yet. Share your link to start collecting data.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Total Clicks" value={data.total_clicks.toLocaleString()} />
        <StatCard label="Unique Visitors" value={data.unique_visitors.toLocaleString()} />
      </div>

      <ClickChart timeSeries={data.time_series} />

      <div className="grid grid-cols-2 gap-4">
        <DeviceBreakdown data={data.by_device} title="Devices" />
        <DeviceBreakdown data={data.by_browser} title="Browsers" />
      </div>

      <ReferrerTable data={data.by_referrer} />
      <DeviceBreakdown data={data.by_country} title="Countries" />
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  )
}
