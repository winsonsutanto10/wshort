import { Link2, BarChart2, Lock, Clock, Zap, Key } from 'lucide-react'
import { LandingNav } from '@/components/layout/LandingNav'
import { HeroCta } from '@/components/layout/HeroCta'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="text-5xl font-bold text-gray-900 leading-tight">
          Short links with{' '}
          <span className="text-blue-600">deep analytics</span>
        </h1>
        <p className="mt-4 text-lg text-gray-500">
          Shorten URLs, track clicks, generate QR codes, and protect links with passwords.
          Built for developers.
        </p>
        <HeroCta />
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="rounded-lg border border-gray-200 p-5">
              <div className="h-9 w-9 rounded-md bg-blue-50 flex items-center justify-center mb-3">
                <f.icon className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">{f.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{f.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

const features = [
  {
    icon: Zap,
    title: 'Fast redirects',
    description: 'Redis-cached slugs resolve in milliseconds. Optimized for high read traffic.',
  },
  {
    icon: BarChart2,
    title: 'Click analytics',
    description: 'Track clicks, unique visitors, device, browser, country, and referrers.',
  },
  {
    icon: Link2,
    title: 'QR codes',
    description: 'Auto-generated QR code for every link. Download as PNG or SVG.',
  },
  {
    icon: Clock,
    title: 'Link expiration',
    description: 'Set an expiry date or a maximum click count. Expired links return 410.',
  },
  {
    icon: Lock,
    title: 'Password protection',
    description: 'Gate sensitive links behind a password before redirecting.',
  },
  {
    icon: Key,
    title: 'API access',
    description: 'Personal API keys to shorten URLs from the terminal or your own tools.',
  },
]
