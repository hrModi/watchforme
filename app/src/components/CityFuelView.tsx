'use client'

import { useState } from 'react'
import AlertModule from './AlertModule'
import PriceTrendChart from './PriceTrendChart'
import MarketInsight from './MarketInsight'
import Link from 'next/link'
import type { Country, RateWithTrend } from '@/types'

export interface FuelData {
  subtype: string
  label: string
  rate: RateWithTrend | null
  history: Array<{ value: number; fetched_at: string }>
  status?: 'live' | 'coming_soon'
}

export interface NearbyItem {
  name: string
  slug: string
  price: number | null
  unit: string
}

interface CityFuelViewProps {
  fuels: FuelData[]
  unit: string
  country: Country
  region: string
  locationName: string
  backHref: string
  backLabel: string
  nearbyItems: NearbyItem[]
  allItemsHref: string
  allItemsLabel: string
  nearbyHeading: string
  aboutHeading: string
  aboutParagraphs: string[]
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function CityFuelView({
  fuels,
  unit,
  country,
  region,
  locationName,
  backHref,
  backLabel,
  nearbyItems,
  allItemsHref,
  allItemsLabel,
  nearbyHeading,
  aboutHeading,
  aboutParagraphs,
}: CityFuelViewProps) {
  const firstLive = fuels.find(f => f.status !== 'coming_soon') ?? fuels[0]
  const [activeSubtype, setActiveSubtype] = useState(firstLive.subtype)

  const active = fuels.find(f => f.subtype === activeSubtype) ?? firstLive
  const sym = unit.startsWith('₹') ? '₹' : '$'
  const denom = unit.replace(/^[₹$]/, '') // '/L' or '/gal'

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
          <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
            {locationName}
          </p>

          {/* Fuel type tabs */}
          <div className="flex gap-1 mb-5">
            {fuels.map(fuel => {
              const isActive = fuel.subtype === activeSubtype
              const isSoon = fuel.status === 'coming_soon'
              return (
                <button
                  key={fuel.subtype}
                  type="button"
                  disabled={isSoon}
                  onClick={() => !isSoon && setActiveSubtype(fuel.subtype)}
                  title={isSoon ? 'Coming soon' : undefined}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: isActive ? 'var(--accent)' : 'var(--surface-2)',
                    color: isActive ? '#fff' : isSoon ? 'var(--text-faint)' : 'var(--text-muted)',
                    cursor: isSoon ? 'default' : 'pointer',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--accent)' : 'var(--border)',
                  }}
                >
                  {fuel.label}
                  {isSoon && (
                    <span className="ml-1.5 text-xs" style={{ color: 'var(--text-faint)' }}>Soon</span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Selected fuel price */}
          {active.rate ? (
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-bold tabular tracking-tight" style={{ color: 'var(--text)' }}>
                  {sym}{active.rate.value.toFixed(2)}
                </span>
                <span className="text-xl font-normal" style={{ color: 'var(--text-muted)' }}>
                  {denom}
                </span>
                {active.rate.trend !== 'flat' && (
                  <span
                    className="text-sm font-semibold tabular"
                    style={{ color: active.rate.trend === 'up' ? '#dc2626' : '#16a34a' }}
                  >
                    {active.rate.trend === 'up' ? '↑' : '↓'} {Math.abs(active.rate.delta).toFixed(2)}
                  </span>
                )}
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                Last updated: {formatTimestamp(active.rate.fetched_at)}
              </p>
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
              watcher_type="fuel"
              country={country}
              region={region}
              subtype={active.subtype}
              unit={unit}
              currentValue={active.rate?.value}
            />

            <PriceTrendChart
              history={active.history}
              unit={unit}
              label={active.label}
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
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <MarketInsight
              history={active.history}
              unit={unit}
              label={active.label}
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
                      href={`${allItemsHref.replace(/\/?$/, '')}/${item.slug}`}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm"
                      style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    >
                      <span>{item.name}</span>
                      <span className="tabular font-medium" style={{ color: item.price ? 'var(--text)' : 'var(--text-muted)' }}>
                        {item.price ? `${sym}${item.price.toFixed(2)}` : '-'}
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
