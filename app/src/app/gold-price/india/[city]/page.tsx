import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import CityFuelView, { type FuelData, type Tab, type NearbyItem, type FAQ } from '@/components/CityFuelView'
import AdSlot from '@/components/AdSlot'
import { getRegionRates, getHistoricalRates, getAllRegionRates } from '@/lib/rates'
import { METAL_CITIES, getMetalCityBySlug } from '@/config/metal-cities'

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
  const rate = rates.find(r => r.subtype === 'gold_24k')
  const priceStr = rate ? `₹${rate.value.toLocaleString('en-IN')}/10g, ` : ''
  return {
    title: { absolute: `24K Gold Price in ${city.name} Today: ${priceStr}WatchForMe` },
    description: `Today's 24K gold price in ${city.name} is ₹${rate?.value?.toLocaleString('en-IN') ?? 'N/A'} per 10 grams. Track the 30-day trend, compare with yesterday's rate, and set a free email alert when gold crosses your target price. No signup needed.`,
    alternates: { canonical: `/gold-price/india/${city.slug}` },
  }
}

export default async function GoldPriceCityPage({ params }: Props) {
  const { city: citySlug } = await params
  const city = getMetalCityBySlug(citySlug)
  if (!city) notFound()

  const karat = 'gold_24k'
  const karatLabel = '24K Gold'

  const [cityRates, history, allCityRates] = await Promise.all([
    fetchGoldRates(citySlug),
    getHistoricalRates('gold', 'IN', citySlug, karat, 30),
    getAllRegionRates('gold', 'IN', ['gold_24k']),
  ])

  const activeRate = cityRates.find(r => r.subtype === karat) ?? null
  const activeFuel: FuelData = { subtype: karat, label: karatLabel, rate: activeRate, history, unit: '₹/10g' }

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
      const g = r?.rates.find(x => x.subtype === 'gold_24k')
      return { name: c.name, slug: c.slug, href: `/gold-price/india/${c.slug}`, price: g?.value ?? null, unit: '₹/10g' }
    })

  const faqs: FAQ[] = [
    {
      q: `What is the ${karatLabel} gold price in ${city.name} today?`,
      a: `Today's ${karatLabel} gold price in ${city.name} is ₹${activeRate?.value?.toLocaleString('en-IN') ?? 'N/A'} per 10 grams.`,
    },
    {
      q: `Why do gold prices differ between cities?`,
      a: `Gold prices vary between cities due to differences in local state taxes, making charges, and dealer margins. International spot price and the USD/INR exchange rate form the common base.`,
    },
    {
      q: `What is the difference between 22K and 24K gold?`,
      a: `24K gold is 99.9% pure and used primarily for investment (coins, bars). 22K gold is 91.7% pure and is preferred for jewellery due to its greater durability.`,
    },
    {
      q: `How can I get a gold price alert for ${city.name}?`,
      a: `Use WatchForMe to set a free price alert. Enter your target price and email. You'll be notified when the gold price in ${city.name} crosses your threshold. No account needed.`,
    },
  ]

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://watchforme.me'
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Gold Price India', item: `${baseUrl}/gold-price/india` },
      { '@type': 'ListItem', position: 3, name: `${city.name} Gold Price`, item: `${baseUrl}/gold-price/india/${city.slug}` },
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
        pageHeading={`${karatLabel} Price in ${city.name} Today`}
        backHref="/gold-price/india"
        backLabel="India Gold Prices"
        nearbyItems={nearbyItems}
        allItemsHref="/gold-price/india"
        allItemsLabel="All cities"
        nearbyHeading="Other Cities"
        aboutHeading={`About Gold Prices in ${city.name}`}
        aboutParagraphs={[
          `Gold prices in ${city.name} are updated daily based on international spot prices, the USD/INR rate, import duty, and local state levies. Rates are quoted per 10 grams.`,
          `Use the alert form above to get notified when ${city.name} gold prices cross a level you set.`,
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
