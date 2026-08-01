// India Fuel Price Fetcher
// Source: petrolpriceindia.com (aggregates IOCL/BPCL/HPCL daily prices)
// Cadence: daily at 06:00 UTC (11:30 IST) — after daily price revision

import { dbAdmin } from '@/lib/db'
import { INDIA_CITIES } from '@/config/india-cities'
import type { FetcherResult } from '@/types'

const BASE_URL = 'https://petrolpriceindia.com'
const SOURCE = 'petrolpriceindia'
const UA = 'Mozilla/5.0 (compatible; WatcherBot/1.0; +https://watchforme.me)'

async function fetchPrice(citySourceSlug: string, fuelType: 'petrol' | 'diesel' | 'cng'): Promise<number | null> {
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

export async function runIndiaFuelFetcher(): Promise<{ success: number; failed: number }> {
  const rows: FetcherResult[] = []
  let failed = 0

  for (const city of INDIA_CITIES) {
    const slug = city.sourceSlug ?? city.slug
    if (slug === 'skip') continue

    const [petrol, diesel, cng] = await Promise.all([
      fetchPrice(slug, 'petrol'),
      fetchPrice(slug, 'diesel'),
      fetchPrice(slug, 'cng'),
    ])

    if (petrol === null && diesel === null) {
      console.error(JSON.stringify({ event: 'india_fetch_error', city: city.slug }))
      failed++
      continue
    }

    if (petrol !== null) {
      rows.push({ country: 'IN', region: city.slug, subtype: 'petrol', value: petrol, unit: '₹/L', source: SOURCE })
    }
    if (diesel !== null) {
      rows.push({ country: 'IN', region: city.slug, subtype: 'diesel', value: diesel, unit: '₹/L', source: SOURCE })
    }
    if (cng !== null) {
      rows.push({ country: 'IN', region: city.slug, subtype: 'cng', value: cng, unit: '₹/kg', source: SOURCE })
    }
  }

  if (rows.length === 0) {
    console.error(JSON.stringify({ event: 'india_fetcher_no_data' }))
    return { success: 0, failed }
  }

  // Compute national averages from successfully fetched cities
  const petrolValues = rows.filter(r => r.subtype === 'petrol').map(r => r.value)
  const dieselValues = rows.filter(r => r.subtype === 'diesel').map(r => r.value)

  if (petrolValues.length > 0) {
    const avg = petrolValues.reduce((a, b) => a + b, 0) / petrolValues.length
    rows.push({ country: 'IN', region: null, subtype: 'petrol', value: Number(avg.toFixed(2)), unit: '₹/L', source: 'computed' })
  }
  if (dieselValues.length > 0) {
    const avg = dieselValues.reduce((a, b) => a + b, 0) / dieselValues.length
    rows.push({ country: 'IN', region: null, subtype: 'diesel', value: Number(avg.toFixed(2)), unit: '₹/L', source: 'computed' })
  }

  const cngValues = rows.filter(r => r.subtype === 'cng' && r.region !== null).map(r => r.value)
  if (cngValues.length > 0) {
    const avg = cngValues.reduce((a, b) => a + b, 0) / cngValues.length
    rows.push({ country: 'IN', region: null, subtype: 'cng', value: Number(avg.toFixed(2)), unit: '₹/kg', source: 'computed' })
  }

  // Delete today's rows before inserting to keep the fetch idempotent
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)
  await dbAdmin.from('rates')
    .delete()
    .eq('watcher_type', 'fuel')
    .eq('country', 'IN')
    .gte('fetched_at', todayStart.toISOString())

  const insertRows = rows.map(r => ({ watcher_type: 'fuel', ...r }))
  const { error } = await dbAdmin.from('rates').insert(insertRows)

  if (error) {
    console.error(JSON.stringify({ event: 'india_fetcher_db_error', error: error.message }))
    return { success: 0, failed: rows.length }
  }

  const citiesSucceeded = petrolValues.length
  console.log(JSON.stringify({ event: 'india_fetcher_done', cities: citiesSucceeded, failed }))
  return { success: citiesSucceeded, failed }
}
