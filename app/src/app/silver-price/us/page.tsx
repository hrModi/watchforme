import type { Metadata } from 'next'
import { cache } from 'react'
import CityFuelView, { type FuelData, type Tab } from '@/components/CityFuelView'
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
    description: `Today's silver spot price in the US is $${silver?.value?.toFixed(4) ?? 'N/A'}/troy oz. Check the 30-day trend and set a free price alert.`,
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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://watchforme.me'
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'US Silver Price', item: `${baseUrl}/silver-price/us` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
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
        watcher_type="gold"
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
        <AdSlot slot="C" />
      </div>
    </>
  )
}
