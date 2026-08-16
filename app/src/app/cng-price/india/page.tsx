import type { Metadata } from 'next'
import Link from 'next/link'
import FuelSearch from '@/components/FuelSearch'
import PriceCard from '@/components/PriceCard'
import AdSlot from '@/components/AdSlot'
import { getAllRegionRates } from '@/lib/rates'
import { INDIA_CITIES } from '@/config/india-cities'

export const metadata: Metadata = {
  title: 'CNG Price in India Today | City-wise Rates | WatchForMe',
  description: 'Today\'s CNG prices across all major Indian cities. Check the latest rate per kg for Delhi, Mumbai, Bangalore, Chennai and more. Updated daily.',
  alternates: { canonical: '/cng-price/india' },
}

const POPULAR = [
  { name: 'Delhi', slug: 'delhi' },
  { name: 'Mumbai', slug: 'mumbai' },
  { name: 'Bangalore', slug: 'bengaluru' },
  { name: 'Chennai', slug: 'chennai' },
  { name: 'Hyderabad', slug: 'hyderabad' },
]

export default async function CngPriceIndiaPage() {
  const cityRates = await getAllRegionRates('fuel', 'IN', ['cng'])
  const ratesByRegion = new Map(cityRates.map(r => [r.region, r]))

  return (
    <>
      <div
        className="px-4 sm:px-6 py-8"
        style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}
      >
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text)' }}>
            CNG Price in India Today
          </h1>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            City-wise CNG rates across India, updated daily.
          </p>
          <div className="flex flex-wrap gap-2 mb-5">
            <Link href="/petrol-price/india" className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>Petrol</Link>
            <Link href="/diesel-price/india" className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>Diesel</Link>
            <span className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--accent)', color: '#fff', border: '1px solid var(--accent)' }}>CNG</span>
          </div>
          <FuelSearch
            items={INDIA_CITIES.map(c => ({ name: c.name, slug: c.slug, state: c.state }))}
            basePath="/cng-price/india"
            fuelTypes={['Petrol', 'Diesel', 'CNG']}
            popularItems={POPULAR}
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <AdSlot slot="A" />

        <section aria-labelledby="cities-heading">
          <h2 id="cities-heading" className="text-base font-semibold mb-4" style={{ color: 'var(--text)' }}>
            CNG Prices by City
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {INDIA_CITIES.map(city => {
              const r = ratesByRegion.get(city.slug)
              const cng = r?.rates.find(x => x.subtype === 'cng')
              return (
                <PriceCard
                  key={city.slug}
                  name={city.name}
                  state={city.state}
                  slug={city.slug}
                  basePath="/cng-price/india"
                  primaryRate={cng}
                  primaryLabel="CNG"
                />
              )
            })}
          </div>
        </section>

        <AdSlot slot="C" />

        <section aria-labelledby="about-heading">
          <h2 id="about-heading" className="text-base font-semibold mb-2" style={{ color: 'var(--text)' }}>
            About CNG Prices in India
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            CNG (Compressed Natural Gas) prices in India are set by city gas distribution companies and vary
            by city. Unlike petrol and diesel, CNG prices are not revised daily — they change periodically
            based on natural gas procurement costs and regulatory approvals.
          </p>
          <p className="text-sm leading-relaxed mt-2" style={{ color: 'var(--text-muted)' }}>
            Click any city to see the price history and set a free alert for when CNG crosses your target price.
          </p>
        </section>
      </div>
    </>
  )
}
