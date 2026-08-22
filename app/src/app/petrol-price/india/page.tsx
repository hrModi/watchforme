import type { Metadata } from 'next'
import Link from 'next/link'
import FuelSearch from '@/components/FuelSearch'
import PriceCard from '@/components/PriceCard'
import AdSlot from '@/components/AdSlot'
import { getAllRegionRates } from '@/lib/rates'
import { INDIA_CITIES } from '@/config/india-cities'

export const metadata: Metadata = {
  title: 'Petrol Price in India Today | City-wise Rates | WatchForMe',
  description: 'Today\'s petrol prices across all major Indian cities. Check the latest rate per litre for Delhi, Mumbai, Bangalore, Chennai and more. Updated daily.',
  alternates: { canonical: '/petrol-price/india' },
}

const POPULAR = [
  { name: 'Delhi', slug: 'delhi' },
  { name: 'Mumbai', slug: 'mumbai' },
  { name: 'Bangalore', slug: 'bengaluru' },
  { name: 'Chennai', slug: 'chennai' },
  { name: 'Hyderabad', slug: 'hyderabad' },
]

export default async function PetrolPriceIndiaPage() {
  const cityRates = await getAllRegionRates('fuel', 'IN', ['petrol', 'diesel'])
  const ratesByRegion = new Map(cityRates.map(r => [r.region, r]))

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://watchforme.me'
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Petrol Price in India', item: `${baseUrl}/petrol-price/india` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <div
        className="px-4 sm:px-6 py-8"
        style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}
      >
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text)' }}>
            Petrol Price in India Today
          </h1>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            City-wise petrol rates across India, updated daily at 6 AM.
          </p>
          <div className="flex flex-wrap gap-2 mb-5">
            <span className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--accent)', color: '#fff', border: '1px solid var(--accent)' }}>Petrol</span>
            <Link href="/diesel-price/india" className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>Diesel</Link>
            <Link href="/cng-price/india" className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>CNG</Link>
          </div>
          <FuelSearch
            items={INDIA_CITIES.map(c => ({ name: c.name, slug: c.slug, state: c.state }))}
            basePath="/petrol-price/india"
            fuelTypes={['Petrol', 'Diesel', 'CNG']}
            popularItems={POPULAR}
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <AdSlot slot="A" />

        <section aria-labelledby="cities-heading">
          <h2 id="cities-heading" className="text-base font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Petrol Prices by City
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
                  basePath="/petrol-price/india"
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
            About Petrol Prices in India
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Petrol prices in India are revised daily at 6 AM by oil marketing companies: Indian Oil (IOCL),
            Bharat Petroleum (BPCL), and Hindustan Petroleum (HPCL). Prices vary by city due to state VAT,
            local taxes, and dealer commissions set by each state government.
          </p>
          <p className="text-sm leading-relaxed mt-2" style={{ color: 'var(--text-muted)' }}>
            Click any city to see the 30-day price trend and set a free alert for when petrol crosses
            your target price.
          </p>
        </section>
      </div>
    </>
  )
}
