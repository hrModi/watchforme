import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Hero from '@/components/Hero'
import AlertModule from '@/components/AlertModule'
import RatesTable from '@/components/RatesTable'
import AdSlot from '@/components/AdSlot'
import { getRegionRates, getAllRegionRates } from '@/lib/rates'
import { US_STATES, getStateBySlug } from '@/config/us-states'

export const revalidate = 3600

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
    title: `${state.name} Gas Price Today | Weekly EIA Data`,
    description: `This week's gasoline and diesel price in ${state.name}. Set a free alert to get notified when prices change. No account needed.`,
    alternates: {
      canonical: `/fuel-price/us/${state.slug}`,
    },
  }
}

export default async function USStateFuelPage({ params }: Props) {
  const { state: stateSlug } = await params
  const state = getStateBySlug(stateSlug)
  if (!state) notFound()

  const [stateRates, allStateRates] = await Promise.all([
    getRegionRates('fuel', 'US', stateSlug, ['gasoline', 'diesel']),
    getAllRegionRates('fuel', 'US', ['gasoline', 'diesel']),
  ])

  const regionsWithNames = allStateRates.map(r => ({
    ...r,
    name: US_STATES.find(s => s.slug === r.region)?.name ?? r.region,
  }))

  const gasoline = stateRates.find(r => r.subtype === 'gasoline') ?? null
  const diesel = stateRates.find(r => r.subtype === 'diesel') ?? null

  return (
    <>
      <Hero
        primaryRate={gasoline}
        secondaryRate={diesel}
        locationName={`${state.name} (${state.abbr})`}
        country="US"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <AdSlot slot="A" />

        <AlertModule
          watcher_type="fuel"
          country="US"
          region={state.slug}
          subtype="gasoline"
          unit="$/gal"
          currentValue={gasoline?.value}
        />

        <AdSlot slot="B" />

        <section aria-labelledby="states-table-heading">
          <h2
            id="states-table-heading"
            className="text-base font-semibold mb-3"
            style={{ color: 'var(--text)' }}
          >
            Gas Prices in Other States
          </h2>
          <RatesTable
            regions={regionsWithNames.filter(r => r.region !== stateSlug)}
            basePath="/fuel-price/us"
            primarySubtype="gasoline"
            secondarySubtype="diesel"
            regionLabel="State"
          />
        </section>

        <AdSlot slot="C" />

        <section aria-labelledby="about-heading">
          <h2 id="about-heading" className="text-base font-semibold mb-2" style={{ color: 'var(--text)' }}>
            About {state.name} Gas Prices
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {state.name} gasoline prices are published weekly by the U.S. Energy Information Administration.
            Prices reflect the retail average across the state and are updated every Monday after the EIA releases
            its weekly petroleum report.
          </p>
          <p className="text-sm leading-relaxed mt-2" style={{ color: 'var(--text-muted)' }}>
            Use the alert above to get notified when {state.name} gas prices cross a level you set.
          </p>
        </section>
      </div>
    </>
  )
}
