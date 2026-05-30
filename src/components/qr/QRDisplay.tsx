'use client'

import { Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function QRDisplay({ linkId, slug }: { linkId: string; slug: string }) {
  const pngUrl = `/api/links/${linkId}/qr?format=png&size=300`

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
        <Button variant="secondary" size="sm" className="flex-1" onClick={() => download('png')}>
          <Download className="h-3.5 w-3.5" />
          PNG
        </Button>
        <Button variant="secondary" size="sm" className="flex-1" onClick={() => download('svg')}>
          <Download className="h-3.5 w-3.5" />
          SVG
        </Button>
      </div>
    </div>
  )
}
