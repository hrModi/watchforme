import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CityFuelView, { type FuelData, type NearbyItem } from '@/components/CityFuelView'
import AdSlot from '@/components/AdSlot'
import { getRegionRates, getHistoricalRates, getAllRegionRates } from '@/lib/rates'
import { INDIA_CITIES, getCityBySlug } from '@/config/india-cities'

export const runtime = 'edge'

interface Props {
  params: Promise<{ city: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug } = await params
  const city = getCityBySlug(citySlug)
  if (!city) return {}
  return {
    title: `${city.name} Petrol, Diesel & CNG Price Today`,
    description: `Today's petrol, diesel and CNG prices in ${city.name}, ${city.state}. See 30-day trend and set a free alert.`,
    alternates: { canonical: `/fuel-price/india/${city.slug}` },
  }
}

export default async function IndiaCityFuelPage({ params }: Props) {
  const { city: citySlug } = await params
  const city = getCityBySlug(citySlug)
  if (!city) notFound()

  const [cityRates, petrolHistory, dieselHistory, cngHistory, allCityRates] = await Promise.all([
    getRegionRates('fuel', 'IN', citySlug, ['petrol', 'diesel', 'cng']),
    getHistoricalRates('fuel', 'IN', citySlug, 'petrol', 30),
    getHistoricalRates('fuel', 'IN', citySlug, 'diesel', 30),
    getHistoricalRates('fuel', 'IN', citySlug, 'cng', 30),
    getAllRegionRates('fuel', 'IN', ['petrol', 'diesel']),
  ])

  const petrol = cityRates.find(r => r.subtype === 'petrol') ?? null
  const diesel = cityRates.find(r => r.subtype === 'diesel') ?? null
  const cng = cityRates.find(r => r.subtype === 'cng') ?? null

  const fuels: FuelData[] = [
    { subtype: 'petrol', label: 'Petrol', rate: petrol, history: petrolHistory },
    { subtype: 'diesel', label: 'Diesel', rate: diesel, history: dieselHistory },
    { subtype: 'cng', label: 'CNG', rate: cng, history: cngHistory, unit: '₹/kg' },
  ]

  // Same-state nearby cities (max 6, excluding current)
  const ratesByRegion = new Map(allCityRates.map(r => [r.region, r]))
  const nearbyItems: NearbyItem[] = INDIA_CITIES
    .filter(c => c.state === city.state && c.slug !== city.slug)
    .slice(0, 6)
    .map(c => {
      const r = ratesByRegion.get(c.slug)
      const p = r?.rates.find(x => x.subtype === 'petrol')
      return { name: c.name, slug: c.slug, price: p?.value ?? null, unit: '₹/L' }
    })

  return (
    <>
      <AdSlot slot="A" />

      <CityFuelView
        fuels={fuels}
        unit="₹/L"
        country="IN"
        region={city.slug}
        locationName={`${city.name}, ${city.state}`}
        backHref="/fuel-price/india"
        backLabel="India Fuel Prices"
        nearbyItems={nearbyItems}
        allItemsHref="/fuel-price/india"
        allItemsLabel="All cities"
        nearbyHeading={`Cities in ${city.state}`}
        aboutHeading={`About ${city.name} Fuel Prices`}
        aboutParagraphs={[
          `Petrol, diesel, and CNG prices in ${city.name} are revised daily by oil marketing companies and reflect local state taxes and VAT levied by ${city.state}. CNG prices may not be available in all cities.`,
          `Use the alert form to get notified by email or WhatsApp when ${city.name} fuel prices change.`,
        ]}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
        <AdSlot slot="C" />
      </div>
    </>
  )
}
