import type { Metadata } from 'next'
import Link from 'next/link'

import FuelSearch from '@/components/FuelSearch'
import PriceCard from '@/components/PriceCard'
import AdSlot from '@/components/AdSlot'
import { getAllRegionRates } from '@/lib/rates'
import { US_STATES } from '@/config/us-states'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'US Gas Prices by State Today | Gasoline & Diesel',
  description: 'Today\'s gasoline and diesel prices across all 50 US states, updated daily from AAA. Find your state and set a free alert.',
  alternates: { canonical: '/fuel-price/us' },
}

const POPULAR = [
  { name: 'California', slug: 'california' },
  { name: 'Texas', slug: 'texas' },
  { name: 'Florida', slug: 'florida' },
  { name: 'New York', slug: 'new-york' },
]

export default async function USFuelPage() {
  const stateRates = await getAllRegionRates('fuel', 'US', ['gasoline', 'diesel'])
  const ratesByRegion = new Map(stateRates.map(r => [r.region, r]))

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://watchforme.me'
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'US Gas Prices', item: `${baseUrl}/fuel-price/us` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {/* Search header */}
      <div
        className="px-4 sm:px-6 py-8"
        style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}
      >
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text)' }}>
            US Gas Prices by State
          </h1>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            Gasoline and diesel prices across all 50 states, updated daily from AAA.
          </p>
          <div className="flex flex-wrap gap-2 mb-5">
            <Link href="/gasoline-price/us" className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>Gasoline</Link>
            <Link href="/diesel-price/us" className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>Diesel</Link>
          </div>
          <FuelSearch
            items={US_STATES.map(s => ({ name: s.name, slug: s.slug }))}
            basePath="/gasoline-price/us"
            fuelTypes={['Gasoline', 'Diesel']}
            popularItems={POPULAR}
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <AdSlot slot="A" />

        {/* State cards grid */}
        <section aria-labelledby="states-heading">
          <h2
            id="states-heading"
            className="text-base font-semibold mb-4"
            style={{ color: 'var(--text)' }}
          >
            Prices by State
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {US_STATES.map(state => {
              const r = ratesByRegion.get(state.slug)
              const gasoline = r?.rates.find(x => x.subtype === 'gasoline')
              const diesel = r?.rates.find(x => x.subtype === 'diesel')
              return (
                <PriceCard
                  key={state.slug}
                  name={state.name}
                  slug={state.slug}
                  basePath="/gasoline-price/us"
                  primaryRate={gasoline}
                  primaryLabel="Gasoline"
                  secondaryRate={diesel}
                  secondaryLabel="Diesel"
                />
              )
            })}
          </div>
        </section>

        <AdSlot slot="C" />

        <section aria-labelledby="about-heading">
          <h2 id="about-heading" className="text-base font-semibold mb-2" style={{ color: 'var(--text)' }}>
            About US Gas Prices
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            US retail gasoline and diesel prices are sourced from AAA, updated daily. Prices vary significantly
            by state due to local taxes, refinery capacity, and distance from supply terminals.
          </p>
          <p className="text-sm leading-relaxed mt-2" style={{ color: 'var(--text-muted)' }}>
            Click a state above to see its price history and set an alert for when prices hit your target.
          </p>
        </section>
      </div>
    </>
  )
}
