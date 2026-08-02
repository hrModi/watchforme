import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { WATCHERS } from '@/config/watchers'
import InterestForm from '@/components/InterestForm'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return WATCHERS
    .filter(w => w.status === 'coming_soon')
    .map(w => ({ slug: w.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const watcher = WATCHERS.find(w => w.slug === slug && w.status === 'coming_soon')
  if (!watcher) return {}
  return {
    title: `${watcher.name} | Coming Soon — WatchForMe.me`,
    description: watcher.description,
  }
}

export default async function ComingSoonPage({ params }: Props) {
  const { slug } = await params
  const watcher = WATCHERS.find(w => w.slug === slug)

  if (!watcher || watcher.status !== 'coming_soon') notFound()

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm mb-10 transition-opacity hover:opacity-70"
        style={{ color: 'var(--text-muted)' }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        All watchers
      </Link>

      <div className="space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl" aria-hidden="true">{watcher.icon}</span>
            <span
              className="text-xs font-medium px-2 py-1 rounded-full"
              style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-faint)' }}
            >
              Coming soon
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
            {watcher.name}
          </h1>
          <p className="text-base mt-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {watcher.description}
          </p>
        </div>

        {/* What you'll be able to do */}
        <div
          className="rounded-xl border p-5 space-y-3"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>
            What it will do
          </p>
          <ul className="space-y-2">
            {getFeatureList(watcher.slug).map((feature, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                <span className="mt-0.5 shrink-0" style={{ color: 'var(--accent)' }}>✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Interest form */}
        <InterestForm watcherType={watcher.slug} />

        <p className="text-xs text-center" style={{ color: 'var(--text-faint)' }}>
          No account needed. One email when it launches, nothing else.
        </p>
      </div>
    </div>
  )
}

function getFeatureList(slug: string): string[] {
  const features: Record<string, string[]> = {
    'gold-price': [
      'Live gold and silver spot prices, updated every 15 minutes',
      'Alerts when gold crosses a price you set — by email',
      'Track 24K, 22K, and silver rates in both INR and USD',
    ],
    'currency-rate': [
      'Real-time exchange rates for major currency pairs',
      'Alerts when a rate hits your target — useful for remittances and travel',
      'Supports INR, USD, EUR, GBP, AED, and more',
    ],
    'loan-rate': [
      'Home loan and mortgage rates from major Indian and US lenders',
      'Alerts when a bank revises its rate below your target',
      'Compare rates across banks in one view',
    ],
    'fd-rate': [
      'Fixed deposit and savings account interest rates from top banks',
      'Alerts when a bank offers a rate above your threshold',
      'Track senior citizen rates and special tenure offers',
    ],
    'stock-price': [
      'Price alerts for any NSE or BSE listed stock',
      'No account, no app — just an email or WhatsApp notification',
      "Set upper and lower bounds for any stock you're watching",
    ],
    'pnr-status': [
      'Instant alert the moment your PNR waitlist position improves',
      'Works for all IRCTC bookings — no manual checking',
      'Also notifies if the train is running late',
    ],
  }
  return features[slug] ?? [
    'Price alerts delivered by email',
    'No account or app needed',
    'Cancel instantly from any notification',
  ]
}
