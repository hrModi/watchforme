import type { Metadata } from 'next'
import { cache } from 'react'
import CityFuelView, { type FuelData, type Tab } from '@/components/CityFuelView'
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
    description: `Today's gold spot price in the US is $${gold?.value?.toFixed(2) ?? 'N/A'}/troy oz. Check the 30-day trend and set a free price alert.`,
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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://watchforme.me'
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'US Gold Price', item: `${baseUrl}/gold-price/us` },
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
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
        <AdSlot slot="C" />
      </div>
    </>
  )
}
