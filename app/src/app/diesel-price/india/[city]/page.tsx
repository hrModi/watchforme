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

const fetchDieselRate = cache((citySlug: string) =>
  getRegionRates('fuel', 'IN', citySlug, ['diesel'])
)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug } = await params
  const city = getCityBySlug(citySlug)
  if (!city) return {}
  const rates = await fetchDieselRate(citySlug)
  const diesel = rates.find(r => r.subtype === 'diesel')
  const priceStr = diesel ? `₹${diesel.value.toFixed(2)}/L — ` : ''
  return {
    title: { absolute: `Diesel Price in ${city.name} Today: ${priceStr}WatchForMe` },
    description: `Today's diesel price in ${city.name} is ₹${diesel?.value?.toFixed(2) ?? 'N/A'}/litre. Check the 30-day trend and set a free price alert for ${city.name}, ${city.state}.`,
    alternates: { canonical: `/diesel-price/india/${city.slug}` },
  }
}

export default async function DieselPricePage({ params }: Props) {
  const { city: citySlug } = await params
  const city = getCityBySlug(citySlug)
  if (!city) notFound()

  const [cityRates, history, allCityRates] = await Promise.all([
    fetchDieselRate(citySlug),
    getHistoricalRates('fuel', 'IN', citySlug, 'diesel', 30),
    getAllRegionRates('fuel', 'IN', ['diesel']),
  ])

  const diesel = cityRates.find(r => r.subtype === 'diesel') ?? null

  const activeFuel: FuelData = { subtype: 'diesel', label: 'Diesel', rate: diesel, history }

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
      const p = r?.rates.find(x => x.subtype === 'diesel')
      return { name: c.name, slug: c.slug, href: `/diesel-price/india/${c.slug}`, price: p?.value ?? null, unit: '₹/L' }
    })

  const faqs: FAQ[] = [
    {
      q: `What is the diesel price in ${city.name} today?`,
      a: `Today's diesel price in ${city.name} is ₹${diesel?.value?.toFixed(2) ?? 'N/A'} per litre.`,
    },
    {
      q: `Why do diesel prices vary by city in India?`,
      a: `Diesel prices differ by city due to state-level VAT and local taxes levied on top of central excise duty. Transportation costs also vary based on distance from refineries.`,
    },
    {
      q: `How often are diesel prices revised in India?`,
      a: `Oil marketing companies revise diesel prices daily at 6 AM based on international crude prices, the rupee-dollar exchange rate, taxes, and dealer commissions.`,
    },
    {
      q: `How can I get a diesel price alert for ${city.name}?`,
      a: `Use WatchForMe to set a free price alert. Enter your target price and email — you'll be notified the moment the diesel price in ${city.name} crosses your threshold. No app or account needed.`,
    },
  ]

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://watchforme.me'
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'India Fuel Prices', item: `${baseUrl}/fuel-price/india` },
      { '@type': 'ListItem', position: 3, name: `Diesel Price in ${city.name}`, item: `${baseUrl}/diesel-price/india/${city.slug}` },
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
        pageHeading={`Diesel Price in ${city.name} Today`}
        backHref="/fuel-price/india"
        backLabel="India Fuel Prices"
        nearbyItems={nearbyItems}
        allItemsHref="/fuel-price/india"
        allItemsLabel="All cities"
        nearbyHeading={`Cities in ${city.state}`}
        aboutHeading={`About Diesel Prices in ${city.name}`}
        aboutParagraphs={[
          `Diesel prices in ${city.name} are revised daily by oil marketing companies and reflect local ${city.state} VAT and state taxes in addition to central excise duty.`,
          `Use the alert form to get notified by email when the diesel price in ${city.name} crosses a level you set.`,
        ]}
        faqs={faqs}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
        <AdSlot slot="C" />
      </div>
    </>
  )
}
