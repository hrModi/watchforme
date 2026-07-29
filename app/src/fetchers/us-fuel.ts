// US Fuel Price Fetcher
// Source: EIA (U.S. Energy Information Administration) — official, free API
// Cadence: weekly on Monday at 18:00 UTC (after EIA ~1pm ET Monday release)
// EIA API docs: https://www.eia.gov/opendata/

import { dbAdmin } from '@/lib/db'
import { US_STATES, EIA_NATIONAL_CODE, getStateByEiaCode } from '@/config/us-states'
import type { FetcherResult } from '@/types'

const EIA_BASE = 'https://api.eia.gov/v2/petroleum/pri/gnd/data/'
const SOURCE = 'eia'

// EIA product codes
const EIA_PRODUCTS = {
  gasoline: 'EPM0',  // Regular gasoline (all grades)
  diesel: 'EPD2D',   // No. 2 diesel retail
}

interface EIADataRow {
  period: string
  duoarea: string
  product: string
  value: string
  units: string
}

interface EIAResponse {
  response: {
    data: EIADataRow[]
    total: number
    dateFormat: string
    frequency: string
  }
}

async function fetchEIARates(): Promise<EIADataRow[]> {
  const apiKey = process.env.EIA_API_KEY
  if (!apiKey) throw new Error('EIA_API_KEY not set')

  const stateCodes = US_STATES.map(s => s.eiaCode)
  const duoAreaParam = [...stateCodes, EIA_NATIONAL_CODE]
    .map(c => `facets[duoarea][]=${c}`)
    .join('&')

  const productParam = Object.values(EIA_PRODUCTS)
    .map(p => `facets[product][]=${p}`)
    .join('&')

  const url = `${EIA_BASE}?api_key=${apiKey}&frequency=weekly&${productParam}&${duoAreaParam}&sort[0][column]=period&sort[0][direction]=desc&length=200`

  const response = await fetch(url, { signal: AbortSignal.timeout(15_000) })
  if (!response.ok) throw new Error(`EIA API returned HTTP ${response.status}`)

  const json: EIAResponse = await response.json()
  return json.response.data
}

export async function runUSFuelFetcher(): Promise<{ success: number; failed: number }> {
  let data: EIADataRow[]

  try {
    data = await fetchEIARates()
  } catch (err) {
    console.error(JSON.stringify({ event: 'eia_fetch_error', error: String(err) }))
    return { success: 0, failed: 1 }
  }

  // Keep only the most recent week's data (first occurrence per duoarea+product)
  const seen = new Set<string>()
  const latest = data.filter(row => {
    const key = `${row.duoarea}|${row.product}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  const rows: FetcherResult[] = []

  for (const row of latest) {
    if (!row.value) continue
    const value = parseFloat(row.value)
    if (isNaN(value)) continue

    const subtype = row.product === EIA_PRODUCTS.gasoline ? 'gasoline' : 'diesel'

    if (row.duoarea === EIA_NATIONAL_CODE) {
      // National average
      rows.push({ country: 'US', region: null, subtype, value, unit: '$/gal', source: SOURCE })
    } else {
      const state = getStateByEiaCode(row.duoarea)
      if (!state) continue
      rows.push({ country: 'US', region: state.slug, subtype, value, unit: '$/gal', source: SOURCE })
    }
  }

  if (rows.length === 0) {
    console.error(JSON.stringify({ event: 'eia_fetcher_no_data' }))
    return { success: 0, failed: 1 }
  }

  const insertRows = rows.map(r => ({ watcher_type: 'fuel', ...r }))
  const { error } = await dbAdmin.from('rates').insert(insertRows)

  if (error) {
    console.error(JSON.stringify({ event: 'eia_fetcher_db_error', error: error.message }))
    return { success: 0, failed: rows.length }
  }

  console.log(JSON.stringify({ event: 'eia_fetcher_done', rows: rows.length }))
  return { success: rows.length, failed: 0 }
}
