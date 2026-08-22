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

const fetchGoldRates = cache((citySlug: string) =>
  getRegionRates('gold', 'IN', citySlug, ['gold_24k', 'gold_22k'])
)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: citySlug } = await params
  const city = getMetalCityBySlug(citySlug)
  if (!city) return {}
  const rates = await fetchGoldRates(citySlug)
  const rate = rates.find(r => r.subtype === 'gold_22k')
  const priceStr = rate ? `₹${rate.value.toLocaleString('en-IN')}/10g, ` : ''
  return {
    title: { absolute: `22K Gold Price in ${city.name} Today: ${priceStr}WatchForMe` },
    description: `Today's 22K gold price in ${city.name} is ₹${rate?.value?.toLocaleString('en-IN') ?? 'N/A'} per 10 grams. 22K is the standard for gold jewellery in India. Track the 30-day trend and set a free email alert when it crosses your target. No signup needed.`,
    alternates: { canonical: `/gold-price/india/${city.slug}/22k` },
  }
}

export default async function GoldPrice22KCityPage({ params }: Props) {
  const { city: citySlug } = await params
  const city = getMetalCityBySlug(citySlug)
  if (!city) notFound()

  const [cityRates, history, allCityRates] = await Promise.all([
    fetchGoldRates(citySlug),
    getHistoricalRates('gold', 'IN', citySlug, 'gold_22k', 30),
    getAllRegionRates('gold', 'IN', ['gold_22k']),
  ])

  const activeRate = cityRates.find(r => r.subtype === 'gold_22k') ?? null
  const activeFuel: FuelData = { subtype: 'gold_22k', label: '22K Gold', rate: activeRate, history, unit: '₹/10g' }

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
      const g = r?.rates.find(x => x.subtype === 'gold_22k')
      return { name: c.name, slug: c.slug, href: `/gold-price/india/${c.slug}/22k`, price: g?.value ?? null, unit: '₹/10g' }
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
      q: `What is the 22K gold price in ${city.name} today?`,
      a: `Today's 22K gold price in ${city.name} is ₹${activeRate?.value?.toLocaleString('en-IN') ?? 'N/A'} per 10 grams.`,
    },
    {
      q: `Why is 22K gold used for jewellery?`,
      a: `22K gold is 91.7% pure gold alloyed with copper or silver, making it harder and more durable than 24K gold. This makes it ideal for jewellery that must withstand daily wear.`,
    },
    {
      q: `What is the difference between 22K and 24K gold?`,
      a: `24K gold is 99.9% pure and used primarily for investment (coins, bars). 22K gold is 91.7% pure and is the standard for gold jewellery in India due to its greater durability.`,
    },
    {
      q: `How can I get a 22K gold price alert for ${city.name}?`,
      a: `Use WatchForMe to set a free price alert. Enter your target price and email. You'll be notified when the 22K gold price in ${city.name} crosses your threshold. No account needed.`,
    },
    ...(hasTrend ? [{
      q: `How has the 22K gold price in ${city.name} changed over the past 30 days?`,
      a: `Over the past 30 days, the 22K gold price in ${city.name} has ${dir30} by ₹${formatINR(Math.round(Math.abs(change30)))} (${pct30}%), from ₹${formatINR(Math.round(hFirst.value))}/10g to ₹${formatINR(Math.round(hLast.value))}/10g.`,
    }] : []),
  ]

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://watchforme.me'
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Gold Price India', item: `${baseUrl}/gold-price/india` },
      { '@type': 'ListItem', position: 3, name: `${city.name} Gold Price`, item: `${baseUrl}/gold-price/india/${city.slug}` },
      { '@type': 'ListItem', position: 4, name: `22K Gold Price in ${city.name}`, item: `${baseUrl}/gold-price/india/${city.slug}/22k` },
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
        unit="₹/10g"
        country="IN"
        region={city.slug}
        locationName={`${city.name}, ${city.state}`}
        pageHeading={`22K Gold Price in ${city.name} Today`}
        backHref="/gold-price/india"
        backLabel="India Gold Prices"
        nearbyItems={nearbyItems}
        allItemsHref="/gold-price/india"
        allItemsLabel="All cities"
        nearbyHeading="Other Cities"
        aboutHeading={`About 22K Gold Prices in ${city.name}`}
        aboutParagraphs={[
          `22K gold prices in ${city.name} are updated daily based on international spot prices, the USD/INR rate, import duty, and local state levies. Rates are quoted per 10 grams.`,
          ...(hasTrend ? [`Over the past 30 days, 22K gold in ${city.name} has ${dir30} by ₹${formatINR(Math.round(Math.abs(change30)))} (${pct30}%), from ₹${formatINR(Math.round(hFirst.value))}/10g to ₹${formatINR(Math.round(hLast.value))}/10g.`] : []),
          `22K gold (91.7% purity) is the most common standard for gold jewellery in India. Use the alert form above to get notified when prices cross your target.`,
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
