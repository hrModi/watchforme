import type { Metadata } from 'next'
import { cache } from 'react'
import CityFuelView, { type FuelData, type Tab, type FAQ } from '@/components/CityFuelView'
import AdSlot from '@/components/AdSlot'
import { getRegionRates, getHistoricalRates } from '@/lib/rates'

const fetchGoldRate = cache(() =>
  getRegionRates('gold', 'US', null, ['gold'])
)

export async function generateMetadata(): Promise<Metadata> {
  const rates = await fetchGoldRate()
  const gold = rates.find(r => r.subtype === 'gold')
  const priceStr = gold ? `$${gold.value.toFixed(2)}/oz, ` : ''
  return {
    title: { absolute: `Gold Price Today (USA): ${priceStr}WatchForMe` },
    description: `Today's gold spot price in the US is $${gold?.value?.toFixed(2) ?? 'N/A'}/troy oz. Track the 30-day trend, compare with yesterday's rate, and set a free email alert when gold crosses your target. No signup needed.`,
    alternates: { canonical: '/gold-price/us' },
  }
}

export default async function GoldPriceUSPage() {
  const [rates, history] = await Promise.all([
    fetchGoldRate(),
    getHistoricalRates('gold', 'US', null, 'gold', 30),
  ])

  const gold = rates.find(r => r.subtype === 'gold') ?? null
  const activeFuel: FuelData = { subtype: 'gold', label: 'Gold', rate: gold, history, unit: '$/oz' }

  const tabs: Tab[] = [
    { subtype: 'gold',   label: 'Gold',   href: '/gold-price/us' },
    { subtype: 'silver', label: 'Silver', href: '/silver-price/us' },
  ]

  const faqs: FAQ[] = [
    {
      q: 'What is the gold spot price today?',
      a: `Today's gold spot price is $${gold?.value?.toFixed(2) ?? 'N/A'} per troy ounce. The spot price represents the current market rate for immediate delivery of one troy ounce of 99.9% pure gold.`,
    },
    {
      q: 'What drives the US gold spot price?',
      a: 'Gold prices are influenced by US Federal Reserve interest rate decisions, inflation data, the strength of the US dollar, geopolitical uncertainty, and demand from central banks and ETFs. Gold typically rises when inflation expectations increase or when investors seek safe-haven assets.',
    },
    {
      q: 'How does the US spot price compare to gold rates in India?',
      a: "India's gold price is derived from the US spot price, but adds import duty (currently 10%), GST (3%), and USD/INR currency conversion. Indian rates are also quoted per 10 grams rather than per troy ounce, and karat purity (22K or 24K) affects the price further.",
    },
    {
      q: 'How can I set a gold price alert?',
      a: 'Enter your target price and email address in the alert form above. WatchForMe will notify you by email when the gold spot price crosses your threshold. No account or signup needed.',
    },
  ]

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://watchforme.me'
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'US Gold Price', item: `${baseUrl}/gold-price/us` },
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
        unit="$/oz"
        country="US"
        locationName="United States (spot price)"
        pageHeading="Gold Price Today (USA)"
        backHref="/"
        backLabel="WatchForMe"
        nearbyItems={[]}
        allItemsHref="/"
        allItemsLabel=""
        nearbyHeading=""
        aboutHeading="About US Gold Prices"
        aboutParagraphs={[
          'The gold spot price shown is sourced from BullionVault, updated daily after the New York market opens. Prices are in USD per troy ounce.',
          'Use the alert form above to get notified when the gold price crosses a level you set.',
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
