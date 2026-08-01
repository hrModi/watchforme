// US Fuel Price Fetcher
// Source: AAA State Gas Price Averages (all 50 states + DC, updated daily)
// https://gasprices.aaa.com/state-gas-price-averages/
// Cadence: daily at 14:00 UTC (10:00 ET)

import { dbAdmin } from '@/lib/db'
import { US_STATES, AAA_URL, getStateByAbbr } from '@/config/us-states'
import type { FetcherResult } from '@/types'

const SOURCE = 'aaa'
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

// Row pattern: state abbr, state name, regular gas price, diesel price
const ROW_RE = /href="https:\/\/gasprices\.aaa\.com\?state=([A-Z]{2})">\s*([\w\s]+?)\s*<\/a>.*?class="regular"[^>]*>\$([\d.]+).*?class="diesel"[^>]*>\$([\d.]+)/gs

interface AAARow {
  abbr: string
  gasoline: number
  diesel: number
}

async function fetchAAAPage(): Promise<AAARow[]> {
  const res = await fetch(AAA_URL, {
    headers: { 'User-Agent': UA },
    signal: AbortSignal.timeout(15_000),
  })
  if (!res.ok) throw new Error(`AAA returned HTTP ${res.status}`)

  const html = await res.text()
  const rows: AAARow[] = []

  for (const match of html.matchAll(ROW_RE)) {
    const gasoline = parseFloat(match[3])
    const diesel = parseFloat(match[4])
    if (!isNaN(gasoline) && !isNaN(diesel)) {
      rows.push({ abbr: match[1], gasoline, diesel })
    }
  }

  return rows
}

export async function runUSFuelFetcher(): Promise<{ success: number; failed: number }> {
  let aaaRows: AAARow[]

  try {
    aaaRows = await fetchAAAPage()
  } catch (err) {
    console.error(JSON.stringify({ event: 'aaa_fetch_error', error: String(err) }))
    return { success: 0, failed: 1 }
  }

  if (aaaRows.length === 0) {
    console.error(JSON.stringify({ event: 'aaa_fetcher_no_data' }))
    return { success: 0, failed: 1 }
  }

  const rows: FetcherResult[] = []

  for (const row of aaaRows) {
    const state = getStateByAbbr(row.abbr)
    if (!state) continue

    rows.push(
      { country: 'US', region: state.slug, subtype: 'gasoline', value: row.gasoline, unit: '$/gal', source: SOURCE },
      { country: 'US', region: state.slug, subtype: 'diesel',   value: row.diesel,   unit: '$/gal', source: SOURCE },
    )
  }

  // National averages computed from all states
  const gasValues = rows.filter(r => r.subtype === 'gasoline').map(r => r.value)
  const dieselValues = rows.filter(r => r.subtype === 'diesel').map(r => r.value)

  if (gasValues.length > 0) {
    const avg = gasValues.reduce((a, b) => a + b, 0) / gasValues.length
    rows.push({ country: 'US', region: null, subtype: 'gasoline', value: Number(avg.toFixed(4)), unit: '$/gal', source: 'computed' })
  }
  if (dieselValues.length > 0) {
    const avg = dieselValues.reduce((a, b) => a + b, 0) / dieselValues.length
    rows.push({ country: 'US', region: null, subtype: 'diesel', value: Number(avg.toFixed(4)), unit: '$/gal', source: 'computed' })
  }

  // Delete today's rows before inserting to keep the fetch idempotent
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)
  await dbAdmin.from('rates')
    .delete()
    .eq('watcher_type', 'fuel')
    .eq('country', 'US')
    .gte('fetched_at', todayStart.toISOString())

  const insertRows = rows.map(r => ({ watcher_type: 'fuel', ...r }))
  const { error } = await dbAdmin.from('rates').insert(insertRows)

  if (error) {
    console.error(JSON.stringify({ event: 'aaa_fetcher_db_error', error: error.message }))
    return { success: 0, failed: rows.length }
  }

  console.log(JSON.stringify({ event: 'aaa_fetcher_done', states: gasValues.length }))
  return { success: gasValues.length, failed: 0 }
}
