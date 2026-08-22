import Link from 'next/link'
import AlertModule from './AlertModule'
import PriceTrendChart from './PriceTrendChart'
import PriceHistoryTable from './PriceHistoryTable'
import MarketInsight from './MarketInsight'
import { formatPrice } from '@/lib/format'
import type { Country, RateWithTrend, WatcherType } from '@/types'

export interface FuelData {
  subtype: string
  label: string
  rate: RateWithTrend | null
  history: Array<{ value: number; fetched_at: string }>
  unit?: string
}

export interface Tab {
  subtype: string
  label: string
  href: string
}

export interface NearbyItem {
  name: string
  slug: string
  href: string
  price: number | null
  unit: string
}

export interface FAQ {
  q: string
  a: string
}

interface CityFuelViewProps {
  activeFuel: FuelData
  tabs: Tab[]
  unit: string
  country: Country
  region?: string
  locationName: string
  pageHeading?: string
  backHref: string
  backLabel: string
  nearbyItems: NearbyItem[]
  allItemsHref: string
  allItemsLabel: string
  nearbyHeading: string
  aboutHeading: string
  aboutParagraphs: string[]
  faqs?: FAQ[]
  watcher_type?: WatcherType
}

function priceTextClass(value: number, unit: string): string {
  const formatted = formatPrice(value, unit)
  const totalLen = formatted.length + 1 // +1 for ₹ or $
  if (totalLen >= 9) return 'text-5xl sm:text-6xl'
  return 'text-6xl'
}

// Deterministic: IST (UTC+5:30, no DST) for India, UTC for US — avoids toLocaleString
// differences between Node.js and the browser.
function formatTimestamp(iso: string, country: Country): string {
  const offsetMs = country === 'IN' ? 330 * 60 * 1000 : 0
  const d = new Date(new Date(iso).getTime() + offsetMs)
  const day = d.getUTCDate()
  const month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getUTCMonth()]
  const h = d.getUTCHours()
  const m = d.getUTCMinutes().toString().padStart(2, '0')
  return `${day} ${month}, ${h % 12 || 12}:${m} ${h >= 12 ? 'pm' : 'am'}`
}

export default function CityFuelView({
  activeFuel,
  tabs,
  unit,
  country,
  region,
  locationName,
  pageHeading,
  backHref,
  backLabel,
  nearbyItems,
  allItemsHref,
  allItemsLabel,
  nearbyHeading,
  aboutHeading,
  aboutParagraphs,
  faqs,
  watcher_type = 'fuel',
}: CityFuelViewProps) {
  const activeUnit = activeFuel.unit ?? unit
  const sym = activeUnit.startsWith('₹') ? '₹' : '$'
  const denom = activeUnit.replace(/^[₹$]/, '')

  return (
    <>
      {/* Breadcrumb */}
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 pt-3 pb-0" aria-label="Breadcrumb">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-xs hover:underline"
          style={{ color: 'var(--text-muted)' }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {backLabel}
        </Link>
      </nav>

      {/* Hero */}
      <div
        className="px-4 sm:px-6 py-6"
        style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}
      >
        <div className="max-w-6xl mx-auto">
          {pageHeading && (
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1" style={{ color: 'var(--text)' }}>
              {pageHeading}
            </h1>
          )}
          <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
            {locationName}
          </p>

          {/* Fuel type tabs — navigate to fuel-specific URLs */}
          <div className="flex flex-wrap gap-1 mb-5">
            {tabs.map(tab => {
              const isActive = tab.subtype === activeFuel.subtype
              const baseClass = 'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors'
              const baseStyle = { border: '1px solid' }
              if (isActive) {
                return (
                  <span
                    key={tab.subtype}
                    className={baseClass}
                    style={{ ...baseStyle, backgroundColor: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' }}
                    aria-current="true"
                  >
                    {tab.label}
                  </span>
                )
              }
              return (
                <Link
                  key={tab.subtype}
                  href={tab.href}
                  className={baseClass}
                  style={{ ...baseStyle, backgroundColor: 'var(--surface-2)', color: 'var(--text-muted)', borderColor: 'var(--border)' }}
                >
                  {tab.label}
                </Link>
              )
            })}
          </div>

          {/* Selected fuel price */}
          {activeFuel.rate ? (
            <div>
              <div className="flex items-baseline gap-2">
                <span className={`font-display ${priceTextClass(activeFuel.rate.value, activeUnit)} font-bold tabular tracking-tight`} style={{ color: 'var(--text)' }}>
                  {sym}{formatPrice(activeFuel.rate.value, activeUnit)}
                </span>
                <span className="font-display text-xl font-normal" style={{ color: 'var(--text-muted)' }}>
                  {denom}
                </span>
                {activeFuel.rate.trend !== 'flat' && (
                  <span
                    className="text-sm font-semibold tabular"
                    style={{ color: activeFuel.rate.trend === 'up' ? '#dc2626' : '#16a34a' }}
                  >
                    {activeFuel.rate.trend === 'up' ? '↑' : '↓'} {formatPrice(Math.abs(activeFuel.rate.delta), activeUnit)}
                  </span>
                )}
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                Last updated: {formatTimestamp(activeFuel.rate.fetched_at, country)}
              </p>
              {activeFuel.rate.trend !== 'flat' && (
                <p className="text-xs mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1" style={{ color: 'var(--text-faint)' }}>
                  <span>Yesterday: {sym}{formatPrice(activeFuel.rate.value - activeFuel.rate.delta, activeUnit)}</span>
                  <span aria-hidden="true">→</span>
                  <span>Today: {sym}{formatPrice(activeFuel.rate.value, activeUnit)}</span>
                  <span style={{ color: activeFuel.rate.trend === 'up' ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                    {activeFuel.rate.trend === 'up' ? '↑' : '↓'} {activeFuel.rate.delta > 0 ? '+' : ''}{formatPrice(activeFuel.rate.delta, activeUnit)}
                  </span>
                </p>
              )}
            </div>
          ) : (
            <p className="text-3xl font-bold" style={{ color: 'var(--text-muted)' }}>
              Data not available
            </p>
          )}
        </div>
      </div>

      {/* Two-column content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_288px] gap-6">

          {/* Main column */}
          <div className="space-y-6">
            <AlertModule
              watcher_type={watcher_type}
              country={country}
              region={region}
              subtype={activeFuel.subtype}
              unit={activeUnit}
              currentValue={activeFuel.rate?.value}
            />

            <PriceTrendChart
              history={activeFuel.history}
              unit={activeUnit}
              label={activeFuel.label}
            />

            <PriceHistoryTable
              history={activeFuel.history}
              unit={activeUnit}
              label={activeFuel.label}
            />

            <section aria-labelledby="about-heading">
              <h2 id="about-heading" className="text-base font-semibold mb-2" style={{ color: 'var(--text)' }}>
                {aboutHeading}
              </h2>
              {aboutParagraphs.map((p, i) => (
                <p key={i} className="text-sm leading-relaxed mt-2" style={{ color: 'var(--text-muted)' }}>
                  {p}
                </p>
              ))}
            </section>

            {faqs && faqs.length > 0 && (
              <section aria-labelledby="faq-heading">
                <h2 id="faq-heading" className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>
                  Frequently Asked Questions
                </h2>
                <div className="space-y-2">
                  {faqs.map((faq, i) => (
                    <details
                      key={i}
                      className="rounded-lg border px-4 py-3 text-sm group"
                      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
                    >
                      <summary
                        className="font-medium cursor-pointer list-none flex items-center justify-between"
                        style={{ color: 'var(--text)' }}
                      >
                        {faq.q}
                        <svg
                          width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"
                          className="shrink-0 ml-2 transition-transform group-open:rotate-180"
                          style={{ color: 'var(--text-faint)' }}
                        >
                          <path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </summary>
                      <p className="mt-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        {faq.a}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <MarketInsight
              history={activeFuel.history}
              unit={activeUnit}
              label={activeFuel.label}
            />

            {nearbyItems.length > 0 && (
              <section aria-labelledby="nearby-heading">
                <div className="flex items-center justify-between mb-3">
                  <h2
                    id="nearby-heading"
                    className="text-sm font-semibold tracking-wider uppercase"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {nearbyHeading}
                  </h2>
                  <Link href={allItemsHref} className="text-xs hover:underline" style={{ color: 'var(--accent)' }}>
                    {allItemsLabel}
                  </Link>
                </div>
                <div className="space-y-2">
                  {nearbyItems.map(item => (
                    <Link
                      key={item.slug}
                      href={item.href}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm"
                      style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    >
                      <span>{item.name}</span>
                      <span className="tabular font-medium" style={{ color: item.price ? 'var(--text)' : 'var(--text-muted)' }}>
                        {item.price ? `${sym}${formatPrice(item.price, item.unit)}` : '-'}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      </div>
    </>
  )
}
