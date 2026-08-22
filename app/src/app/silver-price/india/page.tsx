import type { Metadata } from 'next'
import Link from 'next/link'
import FuelSearch from '@/components/FuelSearch'
import PriceCard from '@/components/PriceCard'
import AdSlot from '@/components/AdSlot'
import { getAllRegionRates } from '@/lib/rates'
import { METAL_CITIES } from '@/config/metal-cities'

export const metadata: Metadata = {
  title: 'Silver Price in India Today | City-wise Rates per Kg | WatchForMe',
  description: "Today's silver prices across major Indian cities. Check the latest rate per kg for Delhi, Mumbai, Bangalore, Chennai and more. Updated daily.",
  alternates: { canonical: '/silver-price/india' },
}

const POPULAR = [
  { name: 'Delhi', slug: 'delhi' },
  { name: 'Mumbai', slug: 'mumbai' },
  { name: 'Bangalore', slug: 'bengaluru' },
  { name: 'Chennai', slug: 'chennai' },
  { name: 'Hyderabad', slug: 'hyderabad' },
]

export default async function SilverPriceIndiaPage() {
  const cityRates = await getAllRegionRates('gold', 'IN', ['silver'])
  const ratesByRegion = new Map(cityRates.map(r => [r.region, r]))

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://watchforme.me'
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Silver Price in India', item: `${baseUrl}/silver-price/india` },
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
            Silver Price in India Today
          </h1>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            City-wise silver rates across India, updated daily.
          </p>
          <div className="flex flex-wrap gap-2 mb-5">
            <Link href="/gold-price/india" className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>Gold</Link>
            <span className="px-3 py-1.5 rounded-lg text-sm font-medium" style={{ backgroundColor: 'var(--accent)', color: '#fff', border: '1px solid var(--accent)' }}>Silver</span>
          </div>
          <FuelSearch
            items={METAL_CITIES.map(c => ({ name: c.name, slug: c.slug, state: c.state }))}
            basePath="/silver-price/india"
            fuelTypes={['Gold', 'Silver']}
            popularItems={POPULAR}
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <AdSlot slot="A" />

        <section aria-labelledby="cities-heading">
          <h2 id="cities-heading" className="text-base font-semibold mb-4" style={{ color: 'var(--text)' }}>
            Silver Prices by City
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {METAL_CITIES.map(city => {
              const r = ratesByRegion.get(city.slug)
              const silver = r?.rates.find(x => x.subtype === 'silver')
              return (
                <PriceCard
                  key={city.slug}
                  name={city.name}
                  state={city.state}
                  slug={city.slug}
                  basePath="/silver-price/india"
                  primaryRate={silver}
                  primaryLabel="Silver"
                />
              )
            })}
          </div>
        </section>

        <AdSlot slot="C" />

        <section aria-labelledby="about-heading">
          <h2 id="about-heading" className="text-base font-semibold mb-2" style={{ color: 'var(--text)' }}>
            About Silver Prices in India
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Silver prices in India are quoted per kilogram and are influenced by MCX silver futures, international
            spot prices, and the USD/INR exchange rate. Prices vary slightly between cities due to local taxes
            and dealer margins.
          </p>
          <p className="text-sm leading-relaxed mt-2" style={{ color: 'var(--text-muted)' }}>
            Click any city to see the 30-day price trend and set a free alert for when silver crosses your target price.
          </p>
        </section>
      </div>
    </>
  )
}
