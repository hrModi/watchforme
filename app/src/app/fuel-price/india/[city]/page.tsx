import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CityFuelView, { type FuelData, type NearbyItem, type FAQ } from '@/components/CityFuelView'
import AdSlot from '@/components/AdSlot'
import { getRegionRates, getHistoricalRates, getAllRegionRates } from '@/lib/rates'
import { INDIA_CITIES, getCityBySlug } from '@/config/india-cities'

export const runtime = 'edge'

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
    title: { absolute: `Petrol Price in ${city.name} Today | WatchForMe` },
    description: `Today's petrol, diesel and CNG prices in ${city.name}, ${city.state}. See 30-day trend and set a free price alert.`,
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

  const faqs: FAQ[] = [
    {
      q: `What is the petrol price in ${city.name} today?`,
      a: `Today's petrol price in ${city.name} is ₹${petrol?.value?.toFixed(2) ?? 'N/A'} per litre.`,
    },
    {
      q: `What is the diesel price in ${city.name} today?`,
      a: `Today's diesel price in ${city.name} is ₹${diesel?.value?.toFixed(2) ?? 'N/A'} per litre.`,
    },
    {
      q: `Why do petrol prices vary by city in India?`,
      a: `Fuel prices in India vary by city because state governments levy different VAT rates and local taxes on top of central excise duty. Cities farther from refineries also face higher transportation costs.`,
    },
    {
      q: `How often are petrol prices revised in India?`,
      a: `Oil marketing companies (IOCL, BPCL, HPCL) revise petrol and diesel prices daily at 6 AM. Prices reflect the international crude oil price, rupee-dollar exchange rate, taxes, and dealer margins.`,
    },
    {
      q: `How can I get a petrol price alert for ${city.name}?`,
      a: `Use WatchForMe to set a free price alert. Enter your target price and email — you'll be notified the moment the petrol price in ${city.name} crosses your threshold. No app or account needed.`,
    },
  ]

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://watchforme.me'
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'India Fuel Prices', item: `${baseUrl}/fuel-price/india` },
      { '@type': 'ListItem', position: 3, name: `${city.name} Fuel Prices`, item: `${baseUrl}/fuel-price/india/${city.slug}` },
    ],
  }
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <AdSlot slot="A" />

      <CityFuelView
        fuels={fuels}
        unit="₹/L"
        country="IN"
        region={city.slug}
        locationName={`${city.name}, ${city.state}`}
        pageHeading={`Petrol Price in ${city.name} Today`}
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
        faqs={faqs}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
        <AdSlot slot="C" />
      </div>
    </>
  )
}
