import type { Metadata } from 'next'
import Hero from '@/components/Hero'
import RatesTable from '@/components/RatesTable'
import AlertModule from '@/components/AlertModule'
import AdSlot from '@/components/AdSlot'
import { getRegionRates, getAllRegionRates } from '@/lib/rates'
import { INDIA_CITIES } from '@/config/india-cities'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'India Fuel Prices Today | Petrol & Diesel Rates',
  description: 'Today\'s petrol and diesel prices across all major Indian cities. Set a free alert to get notified when prices change in your city.',
}

export default async function IndiaFuelPage() {
  const [nationalRates, cityRates] = await Promise.all([
    getRegionRates('fuel', 'IN', null, ['petrol', 'diesel']),
    getAllRegionRates('fuel', 'IN', ['petrol', 'diesel']),
  ])

  // Attach display names from city config
  const regionsWithNames = cityRates.map(r => ({
    ...r,
    name: INDIA_CITIES.find(c => c.slug === r.region)?.name ?? r.region,
  }))

  const petrol = nationalRates.find(r => r.subtype === 'petrol') ?? null
  const diesel = nationalRates.find(r => r.subtype === 'diesel') ?? null

  return (
    <>
      <Hero
        primaryRate={petrol}
        secondaryRate={diesel}
        locationName="India · National Average"
        country="IN"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <AdSlot slot="A" />

        <AlertModule
          watcher_type="fuel"
          country="IN"
          subtype="petrol"
          unit="₹/L"
          currentValue={petrol?.value}
        />

        <AdSlot slot="B" />

        <section aria-labelledby="city-table-heading">
          <h2
            id="city-table-heading"
            className="text-base font-semibold mb-3"
            style={{ color: 'var(--text)' }}
          >
            Petrol &amp; Diesel Prices by City
          </h2>
          <RatesTable
            regions={regionsWithNames}
            basePath="/fuel-price/india"
            primarySubtype="petrol"
            secondarySubtype="diesel"
            regionLabel="City"
          />
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
            all city pages automatically. Set an alert above to get notified the next time prices move in your city.
          </p>
        </section>
      </div>
    </>
  )
}
