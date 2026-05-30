import { LandingNav } from '@/components/layout/LandingNav'

export const metadata = {
  title: 'Privacy Policy — Wshort',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />
      <main className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: May 30, 2026</p>

        <Section title="1. Information We Collect">
          <p>When you use Wshort, we collect:</p>
          <ul>
            <li><strong>Account information</strong> — name, email address, and profile picture provided via Google OAuth through Clerk.</li>
            <li><strong>Links you create</strong> — the destination URLs, custom slugs, expiry settings, and passwords you configure.</li>
            <li><strong>Click analytics</strong> — anonymous click counts per link. We do not store visitor IP addresses or personal data of people who click your links.</li>
          </ul>
        </Section>

        <Section title="2. How We Use Your Information">
          <ul>
            <li>To operate and provide the Wshort service.</li>
            <li>To authenticate you securely via Clerk.</li>
            <li>To display click analytics on your dashboard.</li>
            <li>To enforce per-account link quotas and rate limits.</li>
          </ul>
        </Section>

        <Section title="3. Data Storage">
          <p>
            Links and analytics are stored in Supabase (PostgreSQL) and cached in Redis.
            Authentication data is managed by Clerk. All providers are GDPR-compliant.
          </p>
        </Section>

        <Section title="4. Data Sharing">
          <p>
            We do not sell, rent, or share your personal data with third parties except
            the infrastructure providers listed above (Clerk, Supabase, Redis) that are
            necessary to operate the service.
          </p>
        </Section>

        <Section title="5. Cookies">
          <p>
            Clerk uses cookies and local storage to maintain your authentication session.
            We do not use advertising or tracking cookies.
          </p>
        </Section>

        <Section title="6. Data Deletion">
          <p>
            You may delete your account and all associated links at any time from your
            settings page. To request complete data erasure, email us at{' '}
            <a href="mailto:winsonsutanto10@gmail.com" className="text-blue-600 hover:underline">
              winsonsutanto10@gmail.com
            </a>.
          </p>
        </Section>

        <Section title="7. Changes">
          <p>
            We may update this policy. Continued use of the service after changes
            constitutes acceptance. Material changes will be communicated via email.
          </p>
        </Section>

        <Section title="8. Contact">
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
