// India Fuel Price Fetcher
// Source: IOCL city-wise daily price pages
// Cadence: daily at 06:00 UTC (11:30 IST) — after daily price revision
//
// IOCL URL pattern (verify against live site before deploying):
// https://iocl.com/fuel-price

import { dbAdmin } from '@/lib/db'
import { INDIA_CITIES } from '@/config/india-cities'
import type { FetcherResult } from '@/types'

const SOURCE = 'iocl'

interface ParsedCityRate {
  petrol: number
  diesel: number
}

// Parse IOCL HTML for a city's petrol & diesel price
// The exact selectors MUST be verified against the live IOCL page before first run.
// Prices are published in ₹/L format (e.g. "94.72").
function parseIOCLResponse(html: string): ParsedCityRate | null {
  // TODO: Replace with actual selectors from live IOCL page.
  // Common pattern: table rows with "Petrol" and "Diesel" labels.
  const petrolMatch = html.match(/petrol[^₹]*₹\s*([\d.]+)/i)
  const dieselMatch = html.match(/diesel[^₹]*₹\s*([\d.]+)/i)

  if (!petrolMatch || !dieselMatch) return null

  const petrol = parseFloat(petrolMatch[1])
  const diesel = parseFloat(dieselMatch[1])

  if (isNaN(petrol) || isNaN(diesel)) return null
  return { petrol, diesel }
}

async function fetchCityRate(citySlug: string): Promise<ParsedCityRate | null> {
  // TODO: Replace with actual IOCL city URL format
  const url = `https://iocl.com/fuel-price/${citySlug}`

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'WatcherBot/1.0 (+https://yourdomain.com)' },
      signal: AbortSignal.timeout(10_000),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const html = await response.text()
    return parseIOCLResponse(html)
  } catch (err) {
    console.error(JSON.stringify({ event: 'iocl_fetch_error', city: citySlug, error: String(err) }))
    return null
  }
}

export async function runIndiaFuelFetcher(): Promise<{ success: number; failed: number }> {
  const rows: FetcherResult[] = []
  let failed = 0

  for (const city of INDIA_CITIES) {
    const rates = await fetchCityRate(city.slug)
    if (!rates) { failed++; continue }

    rows.push(
      { country: 'IN', region: city.slug, subtype: 'petrol', value: rates.petrol, unit: '₹/L', source: SOURCE },
      { country: 'IN', region: city.slug, subtype: 'diesel', value: rates.diesel, unit: '₹/L', source: SOURCE },
    )
  }

  if (rows.length === 0) {
    console.error(JSON.stringify({ event: 'india_fetcher_no_data' }))
    return { success: 0, failed }
  }

  // Compute national averages from successfully fetched cities
  const petrolValues = rows.filter(r => r.subtype === 'petrol').map(r => r.value)
  const dieselValues = rows.filter(r => r.subtype === 'diesel').map(r => r.value)
  const avgPetrol = petrolValues.reduce((a, b) => a + b, 0) / petrolValues.length
  const avgDiesel = dieselValues.reduce((a, b) => a + b, 0) / dieselValues.length

  rows.push(
    { country: 'IN', region: null, subtype: 'petrol', value: Number(avgPetrol.toFixed(2)), unit: '₹/L', source: 'computed' },
    { country: 'IN', region: null, subtype: 'diesel', value: Number(avgDiesel.toFixed(2)), unit: '₹/L', source: 'computed' },
  )

  const insertRows = rows.map(r => ({ watcher_type: 'fuel', ...r }))
  const { error } = await dbAdmin.from('rates').insert(insertRows)

  if (error) {
    console.error(JSON.stringify({ event: 'india_fetcher_db_error', error: error.message }))
    return { success: 0, failed: rows.length }
  }

  console.log(JSON.stringify({ event: 'india_fetcher_done', cities: petrolValues.length, failed }))
  return { success: petrolValues.length, failed }
}
