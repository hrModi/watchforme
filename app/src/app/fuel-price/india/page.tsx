import type { Metadata } from 'next'
import FuelSearch from '@/components/FuelSearch'
import PriceCard from '@/components/PriceCard'
import AdSlot from '@/components/AdSlot'
import { getAllRegionRates } from '@/lib/rates'
import { INDIA_CITIES } from '@/config/india-cities'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'India Fuel Prices Today | Petrol & Diesel Rates by City',
  description: 'Today\'s petrol and diesel prices across all major Indian cities. Find your city and set a free alert to get notified when prices change.',
}

const POPULAR = [
  { name: 'Delhi', slug: 'delhi' },
  { name: 'Mumbai', slug: 'mumbai' },
  { name: 'Bangalore', slug: 'bengaluru' },
  { name: 'Chennai', slug: 'chennai' },
  { name: 'Hyderabad', slug: 'hyderabad' },
]

export default async function IndiaFuelPage() {
  const cityRates = await getAllRegionRates('fuel', 'IN', ['petrol', 'diesel'])

  const ratesByRegion = new Map(cityRates.map(r => [r.region, r]))

  return (
    <>
      {/* Search header */}
      <div
        className="px-4 sm:px-6 py-8"
        style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}
      >
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text)' }}>
            India Fuel Prices Today
          </h1>
          <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
            Petrol and diesel prices across all major cities, updated daily.
          </p>
          <FuelSearch
            items={INDIA_CITIES.map(c => ({ name: c.name, slug: c.slug, state: c.state }))}
            basePath="/fuel-price/india"
            fuelTypes={['Petrol', 'Diesel']}
            popularItems={POPULAR}
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <AdSlot slot="A" />

        {/* City cards grid */}
        <section aria-labelledby="cities-heading">
          <h2
            id="cities-heading"
            className="text-base font-semibold mb-4"
            style={{ color: 'var(--text)' }}
          >
            Prices by City
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {INDIA_CITIES.map(city => {
              const r = ratesByRegion.get(city.slug)
              const petrol = r?.rates.find(x => x.subtype === 'petrol')
              const diesel = r?.rates.find(x => x.subtype === 'diesel')
              return (
                <PriceCard
                  key={city.slug}
                  name={city.name}
                  state={city.state}
                  slug={city.slug}
                  basePath="/fuel-price/india"
                  primaryRate={petrol}
                  primaryLabel="Petrol"
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
            About India Fuel Prices
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Petrol and diesel prices in India are revised daily by state-owned oil marketing companies:
            Indian Oil (IOCL), Bharat Petroleum (BPCL), and Hindustan Petroleum (HPCL). Prices vary by city
            due to local taxes, dealer commissions, and VAT rates set by individual state governments.
          </p>
          <p className="text-sm leading-relaxed mt-2" style={{ color: 'var(--text-muted)' }}>
            watchforme.me pulls the latest published rates every morning after the daily revision and updates
            all city pages automatically. Click a city above to set a price alert.
          </p>
        </section>
      </div>
    </>
  )
}
