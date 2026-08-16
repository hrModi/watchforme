import type { Metadata } from 'next'
import FuelSearch from '@/components/FuelSearch'
import PriceCard from '@/components/PriceCard'
import AdSlot from '@/components/AdSlot'
import { getAllRegionRates } from '@/lib/rates'
import { US_STATES } from '@/config/us-states'

export const metadata: Metadata = {
  title: 'Diesel Prices by State Today | US Diesel Fuel Rates | WatchForMe',
  description: 'Today\'s diesel fuel prices across all 50 US states, updated daily from AAA. Find your state, check the 30-day trend, and set a free price alert.',
  alternates: { canonical: '/diesel-price/us' },
}

const POPULAR = [
  { name: 'California', slug: 'california' },
  { name: 'Texas', slug: 'texas' },
  { name: 'Florida', slug: 'florida' },
  { name: 'New York', slug: 'new-york' },
]

export default async function DieselPriceUSPage() {
  const stateRates = await getAllRegionRates('fuel', 'US', ['gasoline', 'diesel'])
  const ratesByRegion = new Map(stateRates.map(r => [r.region, r]))

  return (
    <>
      <div
        className="px-4 sm:px-6 py-8"
        style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}
      >
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text)' }}>
            Diesel Prices by State Today
          </h1>
          <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
            Diesel fuel prices across all 50 states, updated daily from AAA.
          </p>
          <FuelSearch
            items={US_STATES.map(s => ({ name: s.name, slug: s.slug }))}
            basePath="/diesel-price/us"
            fuelTypes={['Gasoline', 'Diesel']}
            popularItems={POPULAR}
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <AdSlot slot="A" />

        <section aria-labelledby="states-heading">
          <h2 id="states-heading" className="text-base font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Diesel Prices by State
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {US_STATES.map(state => {
              const r = ratesByRegion.get(state.slug)
              const diesel = r?.rates.find(x => x.subtype === 'diesel')
              const gasoline = r?.rates.find(x => x.subtype === 'gasoline')
              return (
                <PriceCard
                  key={state.slug}
                  name={state.name}
                  slug={state.slug}
                  basePath="/diesel-price/us"
                  primaryRate={diesel}
                  primaryLabel="Diesel"
                  secondaryRate={gasoline}
                  secondaryLabel="Gasoline"
                />
              )
            })}
          </div>
        </section>

        <AdSlot slot="C" />

        <section aria-labelledby="about-heading">
          <h2 id="about-heading" className="text-base font-semibold mb-2" style={{ color: 'var(--text)' }}>
            About US Diesel Prices
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            US retail diesel prices are sourced from AAA, updated daily. Diesel prices are influenced by
            crude oil costs, refinery capacity, state fuel taxes, and demand from commercial trucking and
            agriculture. Diesel typically trades above gasoline due to higher refining costs and global
            export demand.
          </p>
          <p className="text-sm leading-relaxed mt-2" style={{ color: 'var(--text-muted)' }}>
            Click any state to see its 30-day diesel trend and set a free alert for when prices hit your target.
          </p>
        </section>
      </div>
    </>
  )
}
