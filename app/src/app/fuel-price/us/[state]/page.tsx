import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CityFuelView, { type FuelData, type NearbyItem } from '@/components/CityFuelView'
import AdSlot from '@/components/AdSlot'
import { getRegionRates, getHistoricalRates, getAllRegionRates } from '@/lib/rates'
import { US_STATES, getStateBySlug } from '@/config/us-states'

export async function generateStaticParams() {
  return US_STATES.map(state => ({ state: state.slug }))
}

interface Props {
  params: Promise<{ state: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: stateSlug } = await params
  const state = getStateBySlug(stateSlug)
  if (!state) return {}
  return {
    title: `${state.name} Gas Price Today | Gasoline & Diesel`,
    description: `Today's gasoline and diesel price in ${state.name}. See 30-day trend and set a free alert.`,
    alternates: { canonical: `/fuel-price/us/${state.slug}` },
  }
}

export default async function USStateFuelPage({ params }: Props) {
  const { state: stateSlug } = await params
  const state = getStateBySlug(stateSlug)
  if (!state) notFound()

  const [stateRates, gasolineHistory, dieselHistory, allStateRates] = await Promise.all([
    getRegionRates('fuel', 'US', stateSlug, ['gasoline', 'diesel']),
    getHistoricalRates('fuel', 'US', stateSlug, 'gasoline', 30),
    getHistoricalRates('fuel', 'US', stateSlug, 'diesel', 30),
    getAllRegionRates('fuel', 'US', ['gasoline', 'diesel']),
  ])

  const gasoline = stateRates.find(r => r.subtype === 'gasoline') ?? null
  const diesel = stateRates.find(r => r.subtype === 'diesel') ?? null

  const fuels: FuelData[] = [
    { subtype: 'gasoline', label: 'Gasoline', rate: gasoline, history: gasolineHistory },
    { subtype: 'diesel',   label: 'Diesel',   rate: diesel,   history: dieselHistory },
  ]

  // 5 alphabetically adjacent states as "Other States"
  const ratesByRegion = new Map(allStateRates.map(r => [r.region, r]))
  const stateIdx = US_STATES.findIndex(s => s.slug === stateSlug)
  const nearbyItems: NearbyItem[] = US_STATES
    .filter(s => s.slug !== stateSlug)
    .slice(Math.max(0, stateIdx - 3), stateIdx + 5)
    .slice(0, 5)
    .map(s => {
      const r = ratesByRegion.get(s.slug)
      const g = r?.rates.find(x => x.subtype === 'gasoline')
      return { name: s.name, slug: s.slug, price: g?.value ?? null, unit: '$/gal' }
    })

  return (
    <>
      <AdSlot slot="A" />

      <CityFuelView
        fuels={fuels}
        unit="$/gal"
        country="US"
        region={state.slug}
        locationName={`${state.name} (${state.abbr})`}
        backHref="/fuel-price/us"
        backLabel="US Gas Prices"
        nearbyItems={nearbyItems}
        allItemsHref="/fuel-price/us"
        allItemsLabel="All states"
        nearbyHeading="Other States"
        aboutHeading={`About ${state.name} Gas Prices`}
        aboutParagraphs={[
          `${state.name} gasoline and diesel prices are sourced from AAA, updated daily. Prices reflect the retail average across the state.`,
          `Use the alert form to get notified when ${state.name} gas prices cross a level you set.`,
        ]}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
        <AdSlot slot="C" />
      </div>
    </>
  )
}
