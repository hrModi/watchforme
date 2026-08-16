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

const fetchDieselRate = cache((stateSlug: string) =>
  getRegionRates('fuel', 'US', stateSlug, ['diesel'])
)

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: stateSlug } = await params
  const state = getStateBySlug(stateSlug)
  if (!state) return {}
  const rates = await fetchDieselRate(stateSlug)
  const diesel = rates.find(r => r.subtype === 'diesel')
  const priceStr = diesel ? `$${diesel.value.toFixed(2)}/gal — ` : ''
  return {
    title: { absolute: `${state.name} Diesel Price Today: ${priceStr}WatchForMe` },
    description: `Today's average diesel price in ${state.name} is $${diesel?.value?.toFixed(2) ?? 'N/A'}/gallon. Check the 30-day trend and set a free price alert.`,
    alternates: { canonical: `/diesel-price/us/${state.slug}` },
  }
}

export default async function DieselPricePage({ params }: Props) {
  const { state: stateSlug } = await params
  const state = getStateBySlug(stateSlug)
  if (!state) notFound()

  const [stateRates, history, allStateRates] = await Promise.all([
    fetchDieselRate(stateSlug),
    getHistoricalRates('fuel', 'US', stateSlug, 'diesel', 30),
    getAllRegionRates('fuel', 'US', ['diesel']),
  ])

  const diesel = stateRates.find(r => r.subtype === 'diesel') ?? null

  const activeFuel: FuelData = { subtype: 'diesel', label: 'Diesel', rate: diesel, history }

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
      const d = r?.rates.find(x => x.subtype === 'diesel')
      return { name: s.name, slug: s.slug, href: `/diesel-price/us/${s.slug}`, price: d?.value ?? null, unit: '$/gal' }
    })

  const faqs: FAQ[] = [
    {
      q: `What is the diesel price in ${state.name} today?`,
      a: `Today's average diesel price in ${state.name} is $${diesel?.value?.toFixed(2) ?? 'N/A'} per gallon.`,
    },
    {
      q: `Why do diesel prices vary by state?`,
      a: `Diesel prices vary by state due to differences in state fuel taxes, proximity to supply terminals, and local demand from commercial trucking and agriculture.`,
    },
    {
      q: `How often are diesel prices updated?`,
      a: `WatchForMe updates diesel prices for ${state.name} daily, sourced from AAA. Prices reflect the retail average across the state.`,
    },
    {
      q: `How can I get a diesel price alert for ${state.name}?`,
      a: `Use WatchForMe to set a free price alert for ${state.name}. Enter your target price and email — you'll be notified when the average diesel price crosses your threshold. No app or account needed.`,
    },
  ]

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://watchforme.me'
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'US Gas Prices', item: `${baseUrl}/fuel-price/us` },
      { '@type': 'ListItem', position: 3, name: `${state.name} Diesel Price`, item: `${baseUrl}/diesel-price/us/${state.slug}` },
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
        pageHeading={`${state.name} Diesel Price Today`}
        backHref="/fuel-price/us"
        backLabel="US Gas Prices"
        nearbyItems={nearbyItems}
        allItemsHref="/fuel-price/us"
        allItemsLabel="All states"
        nearbyHeading="Other States"
        aboutHeading={`About ${state.name} Diesel Prices`}
        aboutParagraphs={[
          `${state.name} diesel prices are sourced from AAA, updated daily. Prices reflect the retail average across the state.`,
          `Use the alert form to get notified when ${state.name} diesel prices cross a level you set.`,
        ]}
        faqs={faqs}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
        <AdSlot slot="C" />
      </div>
    </>
  )
}
