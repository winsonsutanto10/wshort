'use client'

import { Download } from 'lucide-react'

export function QRDisplay({ linkId, slug }: { linkId: string; slug: string }) {
  const pngUrl = `/api/links/${linkId}/qr?format=png&size=300`
  const svgUrl = `/api/links/${linkId}/qr?format=svg&size=300`

  async function download(format: 'png' | 'svg') {
    const res = await fetch(`/api/links/${linkId}/qr?format=${format}&size=400`)
    const blob = await res.blob()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `qr-${slug}.${format}`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">QR Code</h3>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={pngUrl}
        alt={`QR code for /${slug}`}
        className="w-full aspect-square rounded-md"
      />
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => download('png')}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-md border border-gray-300 px-3 py-2 text-xs hover:bg-gray-50"
        >
          <Download className="h-3.5 w-3.5" />
          PNG
        </button>
        <button
          onClick={() => download('svg')}
          className="flex-1 flex items-center justify-center gap-1.5 rounded-md border border-gray-300 px-3 py-2 text-xs hover:bg-gray-50"
        >
          <Download className="h-3.5 w-3.5" />
          SVG
        </button>
      </div>
    </div>
  )
}
