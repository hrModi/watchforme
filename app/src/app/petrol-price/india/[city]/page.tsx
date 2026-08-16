import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import CityFuelView, { type FuelData, type Tab, type NearbyItem, type FAQ } from '@/components/CityFuelView'
import AdSlot from '@/components/AdSlot'
import { getRegionRates, getHistoricalRates, getAllRegionRates } from '@/lib/rates'
import { INDIA_CITIES, getCityBySlug } from '@/config/india-cities'

interface Props {
  params: Promise<{ city: string }>
}

const fetchPetrolRate = cache((citySlug: string) =>
  getRegionRates('fuel', 'IN', citySlug, ['petrol'])
)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug } = await params
  const city = getCityBySlug(citySlug)
  if (!city) return {}
  const rates = await fetchPetrolRate(citySlug)
  const petrol = rates.find(r => r.subtype === 'petrol')
  const priceStr = petrol ? `₹${petrol.value.toFixed(2)}/L — ` : ''
  return {
    title: { absolute: `Petrol Price in ${city.name} Today: ${priceStr}WatchForMe` },
    description: `Today's petrol price in ${city.name} is ₹${petrol?.value?.toFixed(2) ?? 'N/A'}/litre. Check the 30-day trend and set a free price alert for ${city.name}, ${city.state}.`,
    alternates: { canonical: `/petrol-price/india/${city.slug}` },
  }
}

export default async function PetrolPricePage({ params }: Props) {
  const { city: citySlug } = await params
  const city = getCityBySlug(citySlug)
  if (!city) notFound()

  const [cityRates, history, allCityRates] = await Promise.all([
    fetchPetrolRate(citySlug),
    getHistoricalRates('fuel', 'IN', citySlug, 'petrol', 30),
    getAllRegionRates('fuel', 'IN', ['petrol']),
  ])

  const petrol = cityRates.find(r => r.subtype === 'petrol') ?? null

  const activeFuel: FuelData = { subtype: 'petrol', label: 'Petrol', rate: petrol, history }

  const tabs: Tab[] = [
    { subtype: 'petrol',  label: 'Petrol',  href: `/petrol-price/india/${citySlug}` },
    { subtype: 'diesel',  label: 'Diesel',  href: `/diesel-price/india/${citySlug}` },
    { subtype: 'cng',     label: 'CNG',     href: `/cng-price/india/${citySlug}` },
  ]

  const ratesByRegion = new Map(allCityRates.map(r => [r.region, r]))
  const nearbyItems: NearbyItem[] = INDIA_CITIES
    .filter(c => c.state === city.state && c.slug !== city.slug)
    .slice(0, 6)
    .map(c => {
      const r = ratesByRegion.get(c.slug)
      const p = r?.rates.find(x => x.subtype === 'petrol')
      return { name: c.name, slug: c.slug, href: `/petrol-price/india/${c.slug}`, price: p?.value ?? null, unit: '₹/L' }
    })

  const faqs: FAQ[] = [
    {
      q: `What is the petrol price in ${city.name} today?`,
      a: `Today's petrol price in ${city.name} is ₹${petrol?.value?.toFixed(2) ?? 'N/A'} per litre.`,
    },
    {
      q: `Why do petrol prices vary by city in India?`,
      a: `Fuel prices vary by city because state governments levy different VAT rates on top of central excise duty. Cities farther from refineries also face higher transportation costs.`,
    },
    {
      q: `How often are petrol prices revised in India?`,
      a: `Oil marketing companies (IOCL, BPCL, HPCL) revise petrol prices daily at 6 AM. Prices reflect international crude oil prices, the rupee-dollar rate, taxes, and dealer margins.`,
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
      { '@type': 'ListItem', position: 3, name: `Petrol Price in ${city.name}`, item: `${baseUrl}/petrol-price/india/${city.slug}` },
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
        activeFuel={activeFuel}
        tabs={tabs}
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
        aboutHeading={`About Petrol Prices in ${city.name}`}
        aboutParagraphs={[
          `Petrol prices in ${city.name} are revised daily by oil marketing companies and reflect local ${city.state} state taxes and VAT in addition to central excise duty.`,
          `Use the alert form to get notified by email when the petrol price in ${city.name} crosses a level you set.`,
        ]}
        faqs={faqs}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
        <AdSlot slot="C" />
      </div>
    </>
  )
}
