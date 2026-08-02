// India Fuel Price Fetcher
// Source: petrolpriceindia.com (aggregates IOCL/BPCL/HPCL daily prices)
// Cadence: daily at 06:00 UTC (11:30 IST) — after daily price revision
// Split by fuel type to stay under Cloudflare's 50 subrequest/invocation limit.

import { dbAdmin } from '@/lib/db'
import { INDIA_CITIES } from '@/config/india-cities'
import type { FetcherResult } from '@/types'

const BASE_URL = 'https://petrolpriceindia.com'
const SOURCE = 'petrolpriceindia'
const UA = 'Mozilla/5.0 (compatible; WatcherBot/1.0; +https://watchforme.me)'

type FuelType = 'petrol' | 'diesel' | 'cng'

async function fetchPrice(citySourceSlug: string, fuelType: FuelType): Promise<number | null> {
  const url = `${BASE_URL}/${fuelType}-price-in-${citySourceSlug}.html`
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(8_000),
    })
    if (!res.ok) return null
    const html = await res.text()
    const match = html.match(/₹([\d.]+)/)
    if (!match) return null
    const value = parseFloat(match[1])
    return isNaN(value) ? null : value
  } catch {
    return null
  }
}

export async function runIndiaFuelFetcher(fuelType: FuelType): Promise<{ success: number; failed: number }> {
  const unit = fuelType === 'cng' ? '₹/kg' : '₹/L'
  const rows: FetcherResult[] = []
  let failed = 0

  for (const city of INDIA_CITIES) {
    const slug = city.sourceSlug ?? city.slug
    if (slug === 'skip') continue

    const price = await fetchPrice(slug, fuelType)
    if (price === null) {
      console.error(JSON.stringify({ event: 'india_fetch_error', city: city.slug, fuelType }))
      failed++
      continue
    }
    rows.push({ country: 'IN', region: city.slug, subtype: fuelType, value: price, unit, source: SOURCE })
  }

  if (rows.length === 0) {
    console.error(JSON.stringify({ event: 'india_fetcher_no_data', fuelType }))
    return { success: 0, failed }
  }

  // National average
  const avg = rows.reduce((a, b) => a + b.value, 0) / rows.length
  rows.push({ country: 'IN', region: null, subtype: fuelType, value: Number(avg.toFixed(2)), unit, source: 'computed' })

  // Delete only today's rows for this fuel type — keeps each invocation independently idempotent
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)
  await dbAdmin.from('rates')
    .delete()
    .eq('watcher_type', 'fuel')
    .eq('country', 'IN')
    .eq('subtype', fuelType)
    .gte('fetched_at', todayStart.toISOString())

  const insertRows = rows.map(r => ({ watcher_type: 'fuel', ...r }))
  const { error } = await dbAdmin.from('rates').insert(insertRows)

  if (error) {
    console.error(JSON.stringify({ event: 'india_fetcher_db_error', fuelType, error: error.message }))
    return { success: 0, failed: rows.length }
  }

  const citiesSucceeded = rows.filter(r => r.region !== null).length
  console.log(JSON.stringify({ event: 'india_fetcher_done', fuelType, cities: citiesSucceeded, failed }))
  return { success: citiesSucceeded, failed }
}
