import type { Metadata } from 'next'
import { cache } from 'react'
import CityFuelView, { type FuelData, type Tab, type FAQ } from '@/components/CityFuelView'
import AdSlot from '@/components/AdSlot'
import { getRegionRates, getHistoricalRates } from '@/lib/rates'

const fetchSilverRate = cache(() =>
  getRegionRates('gold', 'US', null, ['silver'])
)

export async function generateMetadata(): Promise<Metadata> {
  const rates = await fetchSilverRate()
  const silver = rates.find(r => r.subtype === 'silver')
  const priceStr = silver ? `$${silver.value.toFixed(4)}/oz, ` : ''
  return {
    title: { absolute: `Silver Price Today (USA): ${priceStr}WatchForMe` },
    description: `Today's silver spot price in the US is $${silver?.value?.toFixed(4) ?? 'N/A'}/troy oz. Track the 30-day trend, compare with yesterday's rate, and set a free email alert when silver crosses your target. No signup needed.`,
    alternates: { canonical: '/silver-price/us' },
  }
}

export default async function SilverPriceUSPage() {
  const [rates, history] = await Promise.all([
    fetchSilverRate(),
    getHistoricalRates('gold', 'US', null, 'silver', 30),
  ])

  const silver = rates.find(r => r.subtype === 'silver') ?? null
  const activeFuel: FuelData = { subtype: 'silver', label: 'Silver', rate: silver, history, unit: '$/oz' }

  const tabs: Tab[] = [
    { subtype: 'gold',   label: 'Gold',   href: '/gold-price/us' },
    { subtype: 'silver', label: 'Silver', href: '/silver-price/us' },
  ]

  const faqs: FAQ[] = [
    {
      q: 'What is the silver spot price today?',
      a: `Today's silver spot price is $${silver?.value?.toFixed(4) ?? 'N/A'} per troy ounce. The spot price represents the current market rate for immediate delivery of one troy ounce of 99.9% pure silver.`,
    },
    {
      q: 'What drives the US silver spot price?',
      a: 'Silver prices are driven by a mix of industrial demand (electronics, solar panels, medical devices) and investment demand. The US dollar strength, Federal Reserve policy, and gold price movements also influence silver. Silver tends to be more volatile than gold, often amplifying gold moves in both directions.',
    },
    {
      q: 'What is the gold-to-silver ratio?',
      a: `The gold-to-silver ratio shows how many ounces of silver it takes to buy one ounce of gold. Historically it has averaged around 60:1 to 80:1. A high ratio suggests silver may be undervalued relative to gold; a low ratio suggests the reverse. Investors use it to assess relative value between the two metals.`,
    },
    {
      q: 'How can I set a silver price alert?',
      a: 'Enter your target price and email address in the alert form above. WatchForMe will notify you by email when the silver spot price crosses your threshold. No account or signup needed.',
    },
  ]

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://watchforme.me'
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'US Silver Price', item: `${baseUrl}/silver-price/us` },
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
        pageHeading="Silver Price Today (USA)"
        backHref="/"
        backLabel="WatchForMe"
        nearbyItems={[]}
        allItemsHref="/"
        allItemsLabel=""
        nearbyHeading=""
        aboutHeading="About US Silver Prices"
        aboutParagraphs={[
          'The silver spot price shown is sourced from BullionVault, updated daily after the New York market opens. Prices are in USD per troy ounce.',
          'Use the alert form above to get notified when the silver price crosses a level you set.',
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
