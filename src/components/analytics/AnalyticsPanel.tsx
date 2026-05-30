'use client'

import { useEffect, useState } from 'react'

export function AnalyticsPanel({ linkId }: { linkId: string }) {
  const [clicks, setClicks] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/analytics/${linkId}`)
      .then((r) => r.json())
      .then((data) => setClicks(data.total_clicks ?? 0))
      .finally(() => setLoading(false))
  }, [linkId])

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <p className="text-sm text-gray-500 mb-1">Total Clicks</p>
      {loading ? (
        <div className="h-8 w-20 bg-gray-100 animate-pulse rounded" />
      ) : (
        <p className="text-3xl font-bold text-gray-900">{(clicks ?? 0).toLocaleString()}</p>
      )}
    </div>
  )
}
