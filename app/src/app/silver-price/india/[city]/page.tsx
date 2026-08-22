import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import CityFuelView, { type FuelData, type Tab, type NearbyItem, type FAQ } from '@/components/CityFuelView'
import AdSlot from '@/components/AdSlot'
import { getRegionRates, getHistoricalRates, getAllRegionRates } from '@/lib/rates'
import { METAL_CITIES, getMetalCityBySlug } from '@/config/metal-cities'
import { formatINR } from '@/lib/format'

interface Props {
  params: Promise<{ city: string }>
}

const fetchSilverRate = cache((citySlug: string) =>
  getRegionRates('gold', 'IN', citySlug, ['silver'])
)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug } = await params
  const city = getMetalCityBySlug(citySlug)
  if (!city) return {}
  const rates = await fetchSilverRate(citySlug)
  const silver = rates.find(r => r.subtype === 'silver')
  const priceStr = silver ? `₹${silver.value.toLocaleString('en-IN')}/kg, ` : ''
  return {
    title: { absolute: `Silver Price in ${city.name} Today: ${priceStr}WatchForMe` },
    description: `Today's silver price in ${city.name} is ₹${silver?.value?.toLocaleString('en-IN') ?? 'N/A'} per kg. Track the 30-day trend, compare with yesterday's rate, and set a free email alert when silver crosses your target price. No signup needed.`,
    alternates: { canonical: `/silver-price/india/${city.slug}` },
  }
}

export default async function SilverPriceCityPage({ params }: Props) {
  const { city: citySlug } = await params
  const city = getMetalCityBySlug(citySlug)
  if (!city) notFound()

  const [cityRates, history, allCityRates] = await Promise.all([
    fetchSilverRate(citySlug),
    getHistoricalRates('gold', 'IN', citySlug, 'silver', 30),
    getAllRegionRates('gold', 'IN', ['silver']),
  ])

  const silver = cityRates.find(r => r.subtype === 'silver') ?? null
  const activeFuel: FuelData = { subtype: 'silver', label: 'Silver', rate: silver, history, unit: '₹/kg' }

  const tabs: Tab[] = [
    { subtype: 'gold_24k', label: '24K Gold', href: `/gold-price/india/${citySlug}` },
    { subtype: 'gold_22k', label: '22K Gold', href: `/gold-price/india/${citySlug}/22k` },
    { subtype: 'silver',   label: 'Silver',   href: `/silver-price/india/${citySlug}` },
  ]

  const ratesByRegion = new Map(allCityRates.map(r => [r.region, r]))
  const nearbyItems: NearbyItem[] = METAL_CITIES
    .filter(c => c.slug !== citySlug)
    .slice(0, 5)
    .map(c => {
      const r = ratesByRegion.get(c.slug)
      const s = r?.rates.find(x => x.subtype === 'silver')
      return { name: c.name, slug: c.slug, href: `/silver-price/india/${c.slug}`, price: s?.value ?? null, unit: '₹/kg' }
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
      q: `What is the silver price in ${city.name} today?`,
      a: `Today's silver price in ${city.name} is ₹${silver?.value?.toLocaleString('en-IN') ?? 'N/A'} per kilogram.`,
    },
    {
      q: `Why do silver prices vary between cities in India?`,
      a: `Silver prices differ between cities due to local state taxes, transportation costs, and dealer margins. The MCX silver futures price and international spot price form the common base.`,
    },
    {
      q: `How often are silver prices updated?`,
      a: `WatchForMe updates silver prices for ${city.name} daily, sourced from goodreturns.in.`,
    },
    {
      q: `How can I get a silver price alert for ${city.name}?`,
      a: `Use WatchForMe to set a free price alert. Enter your target price and email. You'll be notified when the silver price in ${city.name} crosses your threshold. No account needed.`,
    },
    ...(hasTrend ? [{
      q: `How has the silver price in ${city.name} changed over the past 30 days?`,
      a: `Over the past 30 days, the silver price in ${city.name} has ${dir30} by ₹${formatINR(Math.round(Math.abs(change30)))} (${pct30}%), from ₹${formatINR(Math.round(hFirst.value))}/kg to ₹${formatINR(Math.round(hLast.value))}/kg.`,
    }] : []),
  ]

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://watchforme.me'
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Silver Price India', item: `${baseUrl}/silver-price/india` },
      { '@type': 'ListItem', position: 3, name: `${city.name} Silver Price`, item: `${baseUrl}/silver-price/india/${city.slug}` },
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
        pageHeading={`Silver Price in ${city.name} Today`}
        backHref="/silver-price/india"
        backLabel="India Silver Prices"
        nearbyItems={nearbyItems}
        allItemsHref="/silver-price/india"
        allItemsLabel="All cities"
        nearbyHeading="Other Cities"
        aboutHeading={`About Silver Prices in ${city.name}`}
        aboutParagraphs={[
          `Silver prices in ${city.name} are updated daily based on MCX futures and international spot prices. Rates are quoted per kilogram.`,
          ...(hasTrend ? [`Over the past 30 days, silver in ${city.name} has ${dir30} by ₹${formatINR(Math.round(Math.abs(change30)))} (${pct30}%), from ₹${formatINR(Math.round(hFirst.value))}/kg to ₹${formatINR(Math.round(hLast.value))}/kg.`] : []),
          `Use the alert form above to get notified when ${city.name} silver prices cross a level you set.`,
        ]}
        faqs={faqs}
        watcher_type="gold"
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
        <AdSlot slot="C" />
      </div>
    </>
  )
}
