import { LandingNav } from '@/components/layout/LandingNav'

export const metadata = {
  title: 'Terms of Service — Wshort',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />
      <main className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: May 30, 2026</p>

        <Section title="1. Acceptance">
          <p>
            By accessing or using Wshort at{' '}
            <a href="https://wshort.my.id" className="text-blue-600 hover:underline">
              wshort.my.id
            </a>{' '}
            you agree to these terms. If you do not agree, do not use the service.
          </p>
        </Section>

        <Section title="2. Service Description">
          <p>
            Wshort is a URL shortening service that allows registered users to create
            shortened links, track click analytics, generate QR codes, and optionally
            protect links with passwords or expiry conditions.
          </p>
        </Section>

        <Section title="3. Acceptable Use">
          <p>You must not use Wshort to shorten links that:</p>
          <ul>
            <li>Distribute malware, phishing pages, or other malicious content.</li>
            <li>Violate any applicable law or regulation.</li>
            <li>Infringe on intellectual property rights.</li>
            <li>Promote harassment, hate speech, or violence.</li>
            <li>Circumvent any access controls or security measures.</li>
          </ul>
          <p className="mt-2">
            We reserve the right to remove any link and suspend any account that
            violates these rules without notice.
          </p>
        </Section>

        <Section title="4. Account Responsibility">
          <p>
            You are responsible for all activity under your account. Keep your
            credentials secure. Notify us immediately at{' '}
            <a href="mailto:winsonsutanto10@gmail.com" className="text-blue-600 hover:underline">
              winsonsutanto10@gmail.com
            </a>{' '}
            if you suspect unauthorized access.
          </p>
        </Section>

        <Section title="5. Link Quotas and Rate Limits">
          <p>
            Free accounts are subject to link creation quotas and API rate limits.
            These limits exist to ensure fair use for all users and may change over time.
          </p>
        </Section>

        <Section title="6. Disclaimers">
          <p>
            Wshort is provided "as is" without warranties of any kind. We do not
            guarantee uptime, data retention, or fitness for any particular purpose.
            We are not responsible for the content of destination URLs.
          </p>
        </Section>

        <Section title="7. Limitation of Liability">
          <p>
            To the maximum extent permitted by law, Wshort and its operators shall
            not be liable for any indirect, incidental, or consequential damages
            arising from your use of the service.
          </p>
        </Section>

        <Section title="8. Termination">
          <p>
            We may suspend or terminate your access at any time for violation of
            these terms. You may delete your account at any time from your settings page.
          </p>
        </Section>

        <Section title="9. Changes">
          <p>
            We may modify these terms at any time. Continued use after changes
            constitutes acceptance. Material changes will be communicated via email.
          </p>
        </Section>

        <Section title="10. Contact">
          <p>
            Questions? Email{' '}
            <a href="mailto:winsonsutanto10@gmail.com" className="text-blue-600 hover:underline">
              winsonsutanto10@gmail.com
            </a>.
          </p>
        </Section>
      </main>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">{title}</h2>
      <div className="text-gray-600 text-sm space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
        {children}
      </div>
    </section>
  )
}
