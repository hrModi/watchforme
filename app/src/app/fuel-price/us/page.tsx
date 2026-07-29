import type { Metadata } from 'next'
import Hero from '@/components/Hero'
import RatesTable from '@/components/RatesTable'
import AlertModule from '@/components/AlertModule'
import AdSlot from '@/components/AdSlot'
import { getRegionRates, getAllRegionRates } from '@/lib/rates'
import { US_STATES } from '@/config/us-states'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'US Gas Prices by State Today — Weekly EIA Data',
  description: 'This week\'s gasoline and diesel prices across all 50 US states, sourced from the EIA. Set a free alert to get notified when gas prices change in your state.',
}

export default async function USFuelPage() {
  const [nationalRates, stateRates] = await Promise.all([
    getRegionRates('fuel', 'US', null, ['gasoline', 'diesel']),
    getAllRegionRates('fuel', 'US', ['gasoline', 'diesel']),
  ])

  const regionsWithNames = stateRates.map(r => ({
    ...r,
    name: US_STATES.find(s => s.slug === r.region)?.name ?? r.region,
  }))

  const gasoline = nationalRates.find(r => r.subtype === 'gasoline') ?? null
  const diesel = nationalRates.find(r => r.subtype === 'diesel') ?? null

  return (
    <>
      <Hero
        primaryRate={gasoline}
        secondaryRate={diesel}
        locationName="United States — National Average"
        country="US"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <AdSlot slot="A" />

        <AlertModule
          watcher_type="fuel"
          country="US"
          subtype="gasoline"
          unit="$/gal"
          currentValue={gasoline?.value}
        />

        <AdSlot slot="B" />

        <section aria-labelledby="state-table-heading">
          <h2
            id="state-table-heading"
            className="text-base font-semibold mb-3"
            style={{ color: 'var(--text)' }}
          >
            Gas Prices by State
          </h2>
          <RatesTable
            regions={regionsWithNames}
            basePath="/fuel-price/us"
            primarySubtype="gasoline"
            secondarySubtype="diesel"
            regionLabel="State"
          />
        </section>

        <AdSlot slot="C" />

        <section className="max-w-2xl" aria-labelledby="about-heading">
          <h2 id="about-heading" className="text-base font-semibold mb-2" style={{ color: 'var(--text)' }}>
            About US Gas Prices
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            US retail gasoline and diesel prices are published weekly by the Energy Information Administration (EIA),
            typically every Monday. Prices vary significantly by state due to local taxes, refinery capacity, and
            distance from supply terminals.
          </p>
          <p className="text-sm leading-relaxed mt-2" style={{ color: 'var(--text-muted)' }}>
            WatcherFor.me updates state-level prices every Monday evening after the EIA release. Set an alert
            above to get notified when the national average or your state's price crosses a threshold you care about.
          </p>
        </section>
      </div>
    </>
  )
}
