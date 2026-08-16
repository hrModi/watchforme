import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import CityFuelView, { type FuelData, type Tab, type NearbyItem, type FAQ } from '@/components/CityFuelView'
import AdSlot from '@/components/AdSlot'
import { getRegionRates, getHistoricalRates, getAllRegionRates } from '@/lib/rates'
import { US_STATES, getStateBySlug } from '@/config/us-states'

interface Props {
  params: Promise<{ state: string }>
}

const fetchGasolineRate = cache((stateSlug: string) =>
  getRegionRates('fuel', 'US', stateSlug, ['gasoline'])
)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: stateSlug } = await params
  const state = getStateBySlug(stateSlug)
  if (!state) return {}
  const rates = await fetchGasolineRate(stateSlug)
  const gasoline = rates.find(r => r.subtype === 'gasoline')
  const priceStr = gasoline ? `$${gasoline.value.toFixed(2)}/gal — ` : ''
  return {
    title: { absolute: `${state.name} Gas Price Today: ${priceStr}WatchForMe` },
    description: `Today's average gasoline price in ${state.name} is $${gasoline?.value?.toFixed(2) ?? 'N/A'}/gallon. Check the 30-day trend and set a free price alert.`,
    alternates: { canonical: `/gasoline-price/us/${state.slug}` },
  }
}

export default async function GasolinePricePage({ params }: Props) {
  const { state: stateSlug } = await params
  const state = getStateBySlug(stateSlug)
  if (!state) notFound()

  const [stateRates, history, allStateRates] = await Promise.all([
    fetchGasolineRate(stateSlug),
    getHistoricalRates('fuel', 'US', stateSlug, 'gasoline', 30),
    getAllRegionRates('fuel', 'US', ['gasoline']),
  ])

  const gasoline = stateRates.find(r => r.subtype === 'gasoline') ?? null

  const activeFuel: FuelData = { subtype: 'gasoline', label: 'Gasoline', rate: gasoline, history }

  const tabs: Tab[] = [
    { subtype: 'gasoline', label: 'Gasoline', href: `/gasoline-price/us/${stateSlug}` },
    { subtype: 'diesel',   label: 'Diesel',   href: `/diesel-price/us/${stateSlug}` },
  ]

  const ratesByRegion = new Map(allStateRates.map(r => [r.region, r]))
  const stateIdx = US_STATES.findIndex(s => s.slug === stateSlug)
  const nearbyItems: NearbyItem[] = US_STATES
    .filter(s => s.slug !== stateSlug)
    .slice(Math.max(0, stateIdx - 3), stateIdx + 5)
    .slice(0, 5)
    .map(s => {
      const r = ratesByRegion.get(s.slug)
      const g = r?.rates.find(x => x.subtype === 'gasoline')
      return { name: s.name, slug: s.slug, href: `/gasoline-price/us/${s.slug}`, price: g?.value ?? null, unit: '$/gal' }
    })

  const faqs: FAQ[] = [
    {
      q: `What is the average gas price in ${state.name} today?`,
      a: `Today's average gasoline price in ${state.name} is $${gasoline?.value?.toFixed(2) ?? 'N/A'} per gallon.`,
    },
    {
      q: `Why do gas prices vary by state?`,
      a: `Gas prices differ across states due to varying state fuel taxes, proximity to refineries, local supply and demand, and whether a state requires special fuel blends. States like California often pay more due to higher taxes and stricter environmental fuel standards.`,
    },
    {
      q: `How often are gas prices updated?`,
      a: `WatchForMe updates gas prices for ${state.name} daily, sourced from AAA. Prices reflect the retail average across all grades and stations in the state.`,
    },
    {
      q: `How can I get a gas price alert for ${state.name}?`,
      a: `Use WatchForMe to set a free price alert for ${state.name}. Enter your target price and email — you'll be notified when the average gas price crosses your threshold. No app or account needed.`,
    },
  ]

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://watchforme.me'
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'US Gas Prices', item: `${baseUrl}/fuel-price/us` },
      { '@type': 'ListItem', position: 3, name: `${state.name} Gas Price`, item: `${baseUrl}/gasoline-price/us/${state.slug}` },
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
        unit="$/gal"
        country="US"
        region={state.slug}
        locationName={`${state.name} (${state.abbr})`}
        pageHeading={`${state.name} Gas Price Today`}
        backHref="/fuel-price/us"
        backLabel="US Gas Prices"
        nearbyItems={nearbyItems}
        allItemsHref="/fuel-price/us"
        allItemsLabel="All states"
        nearbyHeading="Other States"
        aboutHeading={`About ${state.name} Gas Prices`}
        aboutParagraphs={[
          `${state.name} gasoline prices are sourced from AAA, updated daily. Prices reflect the retail average across the state.`,
          `Use the alert form to get notified when ${state.name} gas prices cross a level you set.`,
        ]}
        faqs={faqs}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
        <AdSlot slot="C" />
      </div>
    </>
  )
}
