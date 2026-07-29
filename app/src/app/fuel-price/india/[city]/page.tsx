import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Hero from '@/components/Hero'
import AlertModule from '@/components/AlertModule'
import RatesTable from '@/components/RatesTable'
import AdSlot from '@/components/AdSlot'
import { getRegionRates, getAllRegionRates } from '@/lib/rates'
import { INDIA_CITIES, getCityBySlug } from '@/config/india-cities'

export const revalidate = 3600

export async function generateStaticParams() {
  return INDIA_CITIES.map(city => ({ city: city.slug }))
}

interface Props {
  params: Promise<{ city: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug } = await params
  const city = getCityBySlug(citySlug)
  if (!city) return {}

  return {
    title: `${city.name} Petrol & Diesel Price Today`,
    description: `Today's petrol and diesel price in ${city.name}, ${city.state}. Set a free alert to get notified when the price changes. No account needed.`,
    alternates: {
      canonical: `/fuel-price/india/${city.slug}`,
    },
  }
}

export default async function IndiaCityFuelPage({ params }: Props) {
  const { city: citySlug } = await params
  const city = getCityBySlug(citySlug)
  if (!city) notFound()

  const [cityRates, allCityRates] = await Promise.all([
    getRegionRates('fuel', 'IN', citySlug, ['petrol', 'diesel']),
    getAllRegionRates('fuel', 'IN', ['petrol', 'diesel']),
  ])

  const regionsWithNames = allCityRates.map(r => ({
    ...r,
    name: INDIA_CITIES.find(c => c.slug === r.region)?.name ?? r.region,
  }))

  const petrol = cityRates.find(r => r.subtype === 'petrol') ?? null
  const diesel = cityRates.find(r => r.subtype === 'diesel') ?? null

  return (
    <>
      <Hero
        primaryRate={petrol}
        secondaryRate={diesel}
        locationName={`${city.name}, ${city.state}`}
        country="IN"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <AdSlot slot="A" />

        <AlertModule
          watcher_type="fuel"
          country="IN"
          region={city.slug}
          subtype="petrol"
          unit="₹/L"
          currentValue={petrol?.value}
        />

        <AdSlot slot="B" />

        <section aria-labelledby="cities-table-heading">
          <h2
            id="cities-table-heading"
            className="text-base font-semibold mb-3"
            style={{ color: 'var(--text)' }}
          >
            Prices in Other Cities
          </h2>
          <RatesTable
            regions={regionsWithNames.filter(r => r.region !== citySlug)}
            basePath="/fuel-price/india"
            primarySubtype="petrol"
            secondarySubtype="diesel"
            regionLabel="City"
          />
        </section>

        <AdSlot slot="C" />

        <section aria-labelledby="about-heading">
          <h2 id="about-heading" className="text-base font-semibold mb-2" style={{ color: 'var(--text)' }}>
            About {city.name} Fuel Prices
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Petrol and diesel prices in {city.name} are revised daily by oil marketing companies and
            reflect local state taxes and VAT levied by {city.state}. Prices may differ from the national
            average due to these state-level levies.
          </p>
          <p className="text-sm leading-relaxed mt-2" style={{ color: 'var(--text-muted)' }}>
            Use the alert form above to get notified by email or WhatsApp the next time {city.name} fuel prices change.
          </p>
        </section>
      </div>
    </>
  )
}
