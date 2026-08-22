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

const fetchCngRate = cache((citySlug: string) =>
  getRegionRates('fuel', 'IN', citySlug, ['cng'])
)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug } = await params
  const city = getCityBySlug(citySlug)
  if (!city) return {}
  const rates = await fetchCngRate(citySlug)
  const cng = rates.find(r => r.subtype === 'cng')
  const priceStr = cng ? `₹${cng.value.toFixed(2)}/kg — ` : ''
  return {
    title: { absolute: `CNG Price in ${city.name} Today: ${priceStr}WatchForMe` },
    description: `Today's CNG price in ${city.name} is ₹${cng?.value?.toFixed(2) ?? 'N/A'}/kg. Track the 30-day trend, compare with yesterday's rate, and get a free email alert when CNG crosses your target. No signup needed.`,
    alternates: { canonical: `/cng-price/india/${city.slug}` },
  }
}

export default async function CngPricePage({ params }: Props) {
  const { city: citySlug } = await params
  const city = getCityBySlug(citySlug)
  if (!city) notFound()

  const [cityRates, history, allCityRates] = await Promise.all([
    fetchCngRate(citySlug),
    getHistoricalRates('fuel', 'IN', citySlug, 'cng', 30),
    getAllRegionRates('fuel', 'IN', ['cng']),
  ])

  const cng = cityRates.find(r => r.subtype === 'cng') ?? null

  const activeFuel: FuelData = { subtype: 'cng', label: 'CNG', rate: cng, history, unit: '₹/kg' }

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
      const p = r?.rates.find(x => x.subtype === 'cng')
      return { name: c.name, slug: c.slug, href: `/cng-price/india/${c.slug}`, price: p?.value ?? null, unit: '₹/kg' }
    })

  const sorted = [...history].sort((a, b) => new Date(a.fetched_at).getTime() - new Date(b.fetched_at).getTime())
  const hFirst = sorted[0]
  const hLast = sorted[sorted.length - 1]
  const hasTrend = sorted.length >= 2 && hFirst.fetched_at !== hLast.fetched_at
  const change30 = hasTrend ? hLast.value - hFirst.value : 0
  const pct30 = hasTrend && hFirst.value > 0 ? Math.abs(change30 / hFirst.value * 100).toFixed(1) : '0.0'
  const dir30 = change30 > 0 ? 'risen' : change30 < 0 ? 'fallen' : 'remained stable'

  const faqs: FAQ[] = [
    {
      q: `What is the CNG price in ${city.name} today?`,
      a: `Today's CNG price in ${city.name} is ₹${cng?.value?.toFixed(2) ?? 'N/A'} per kg.`,
    },
    {
      q: `Why do CNG prices vary by city in India?`,
      a: `CNG prices vary by city because they are set by city gas distribution (CGD) companies such as MGL (Mumbai), IGL (Delhi), and GSPC (Gujarat). Prices depend on the company's sourcing costs, pipeline infrastructure, and city-specific taxes.`,
    },
    {
      q: `How often are CNG prices revised?`,
      a: `CNG prices are revised periodically by the respective city gas distribution company, usually when natural gas sourcing costs change. Unlike petrol and diesel, there is no fixed daily revision schedule.`,
    },
    {
      q: `How can I get a CNG price alert for ${city.name}?`,
      a: `Use WatchForMe to set a free price alert. Enter your target price and email — you'll be notified when the CNG price in ${city.name} crosses your threshold. No app or account needed.`,
    },
    ...(hasTrend ? [{
      q: `How has the CNG price in ${city.name} changed over the past 30 days?`,
      a: `Over the past 30 days, the CNG price in ${city.name} has ${dir30} by ₹${Math.abs(change30).toFixed(2)} (${pct30}%), from ₹${hFirst.value.toFixed(2)}/kg to ₹${hLast.value.toFixed(2)}/kg.`,
    }] : []),
  ]

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://watchforme.me'
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'India Fuel Prices', item: `${baseUrl}/fuel-price/india` },
      { '@type': 'ListItem', position: 3, name: `CNG Price in ${city.name}`, item: `${baseUrl}/cng-price/india/${city.slug}` },
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
        unit="₹/kg"
        country="IN"
        region={city.slug}
        locationName={`${city.name}, ${city.state}`}
        pageHeading={`CNG Price in ${city.name} Today`}
        backHref="/fuel-price/india"
        backLabel="India Fuel Prices"
        nearbyItems={nearbyItems}
        allItemsHref="/fuel-price/india"
        allItemsLabel="All cities"
        nearbyHeading={`Cities in ${city.state}`}
        aboutHeading={`About CNG Prices in ${city.name}`}
        aboutParagraphs={[
          `CNG prices in ${city.name} are set by the city gas distribution company and revised periodically based on natural gas sourcing costs and pipeline infrastructure charges.`,
          ...(hasTrend ? [`Over the past 30 days, CNG in ${city.name} has ${dir30} by ₹${Math.abs(change30).toFixed(2)} (${pct30}%), from ₹${hFirst.value.toFixed(2)}/kg to ₹${hLast.value.toFixed(2)}/kg.`] : []),
          `Use the alert form to get notified by email when the CNG price in ${city.name} changes.`,
        ]}
        faqs={faqs}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
        <AdSlot slot="C" />
      </div>
    </>
  )
}
