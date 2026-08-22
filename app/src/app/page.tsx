import type { Metadata } from 'next'
import { headers, cookies } from 'next/headers'


import WatcherCard from '@/components/WatcherCard'
import { WATCHERS } from '@/config/watchers'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'WatchForMe | Free Price & Rate Watchers',
  description: 'Free fuel price alerts, gold rate watchers, currency trackers and more. Get notified by email when prices cross your target. No signup, no account needed.',
}

export default async function HomePage() {
  const [headersList, cookiesList] = await Promise.all([headers(), cookies()])
  const prefCountry = cookiesList.get('country_pref')?.value   // explicit user choice
  const cfCountry = headersList.get('x-vercel-ip-country')     // IP-detected
  const isIndia = prefCountry === 'IN' || (!prefCountry && cfCountry === 'IN')
  const country = isIndia ? 'india' : 'us'
  const countryCode = isIndia ? 'IN' : 'US'

  const visibleWatchers = WATCHERS.filter(w => w.countries.includes(countryCode))

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Value prop */}
      <section className="mb-10" aria-labelledby="hero-heading">
        <h1
          id="hero-heading"
          className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
          style={{ color: 'var(--text)' }}
        >
          Never check prices again.
        </h1>
        <p className="text-base max-w-xl" style={{ color: 'var(--text-muted)' }}>
          Get notified when fuel prices, gold rates, stock prices, or exchange rates cross your target.
          No signup. No password. Free forever.
        </p>

        {/* Trust badges */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 mt-5">
          {[
            'Free Forever',
            'No Signup',
            'Privacy Friendly',
            'Email & WhatsApp Alerts',
          ].map(badge => (
            <span key={badge} className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                <circle cx="7.5" cy="7.5" r="7.5" fill="var(--accent)" opacity="0.15" />
                <path d="M4.5 7.5l2 2 4-4" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {badge}
            </span>
          ))}
        </div>
      </section>

      {/* Watcher card grid */}
      <section aria-label="Available watchers">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleWatchers.map(watcher => (
            <WatcherCard
              key={watcher.watcher_type}
              watcher={watcher}
              country={country}
            />
          ))}
        </div>
      </section>

      {/* Trust blurb */}
      <section className="mt-16 pt-8 border-t" style={{ borderColor: 'var(--border)' }}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--text)' }}>Free forever.</strong> No personal data sold.
          Alerts use only the contact info you provide, and you can unsubscribe instantly from any notification.
        </p>
      </section>
    </div>
  )
}
