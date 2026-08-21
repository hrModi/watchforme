// US Metal Price Fetcher
// Source: stooq.com daily OHLC CSV (no API key, no rate limit)
// XAUUSD = gold spot price in USD/troy oz
// XAGUSD = silver spot price in USD/troy oz
// Cadence: daily at 14:30 UTC (10:30 ET) — after NY market open

import { dbAdmin } from '@/lib/db'
import type { FetcherResult } from '@/types'

const SOURCE = 'stooq'
const UA = 'Mozilla/5.0 (compatible; WatcherBot/1.0; +https://watchforme.me)'

async function fetchSpotPrice(ticker: string): Promise<number | null> {
  const url = `https://stooq.com/q/d/l/?s=${ticker}&i=d`
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) return null
    const text = await res.text()
    // CSV format: Date,Open,High,Low,Close,Volume
    // First data row (after header) is the most recent day
    const lines = text.trim().split('\n')
    if (lines.length < 2) return null
    const cols = lines[1].split(',')
    const close = parseFloat(cols[4] ?? '')
    return isNaN(close) ? null : close
  } catch {
    return null
  }
}

export async function runUSMetalsFetcher(): Promise<{ success: number; failed: number }> {
  const [goldPrice, silverPrice] = await Promise.all([
    fetchSpotPrice('xauusd'),
    fetchSpotPrice('xagusd'),
  ])

  if (goldPrice === null && silverPrice === null) {
    console.error(JSON.stringify({ event: 'us_metals_no_data' }))
    return { success: 0, failed: 2 }
  }

  const rows: FetcherResult[] = []
  let failed = 0

  if (goldPrice !== null) {
    rows.push({ country: 'US', region: null, subtype: 'gold', value: Number(goldPrice.toFixed(2)), unit: '$/oz', source: SOURCE })
  } else {
    console.error(JSON.stringify({ event: 'us_metals_fetch_error', ticker: 'xauusd' }))
    failed++
  }

  if (silverPrice !== null) {
    rows.push({ country: 'US', region: null, subtype: 'silver', value: Number(silverPrice.toFixed(4)), unit: '$/oz', source: SOURCE })
  } else {
    console.error(JSON.stringify({ event: 'us_metals_fetch_error', ticker: 'xagusd' }))
    failed++
  }

  if (rows.length === 0) return { success: 0, failed }

  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)

  await dbAdmin.from('rates')
    .delete()
    .eq('watcher_type', 'gold')
    .eq('country', 'US')
    .gte('fetched_at', todayStart.toISOString())

  const insertRows = rows.map(r => ({ watcher_type: 'gold', ...r }))
  const { error } = await dbAdmin.from('rates').insert(insertRows)

  if (error) {
    console.error(JSON.stringify({ event: 'us_metals_db_error', error: error.message }))
    return { success: 0, failed: rows.length }
  }

  console.log(JSON.stringify({ event: 'us_metals_done', gold: goldPrice, silver: silverPrice }))
  return { success: rows.length, failed }
}
