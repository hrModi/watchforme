import type { Metadata } from 'next'
import WatcherCard from '@/components/WatcherCard'
import { WATCHERS } from '@/config/watchers'
import { getLatestRate } from '@/lib/rates'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'watchforme.me | Free Price & Rate Watchers',
  description: 'Free fuel price alerts, gold rate watchers, currency rate trackers and more. No signup, no account needed.',
}

export default async function HomePage() {
  const liveRate = await getLatestRate('fuel', 'IN', 'petrol', null).catch(() => null)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Value prop */}
      <section className="mb-12" aria-labelledby="hero-heading">
        <h1
          id="hero-heading"
          className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
          style={{ color: 'var(--text)' }}
        >
          Price watchers. Free forever.
        </h1>
        <p className="text-base max-w-xl" style={{ color: 'var(--text-muted)' }}>
          Get notified when fuel prices, gold rates, or currency rates move. By email or WhatsApp.
          No account, no password. Just set a threshold and we&apos;ll ping you.
        </p>
      </section>

      {/* Watcher card grid */}
      <section aria-label="Available watchers">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {WATCHERS.map(watcher => (
            <WatcherCard
              key={watcher.watcher_type}
              watcher={watcher}
              liveRate={watcher.status === 'live' ? liveRate : undefined}
              country="india"
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
