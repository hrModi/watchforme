// US Metal Price Fetcher
// Source: BullionVault (clean HTML, no API key needed)
// Cadence: daily at 14:00 UTC (10:00 ET) after NY market open

import { dbAdmin } from '@/lib/db'
import type { FetcherResult } from '@/types'

const SOURCE = 'bullionvault'
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

// Parses: <span data-currency="USD" data-weight="TOZ">$4,606.52</span>
const PRICE_RE = /data-currency="USD"\s+data-weight="TOZ">\s*\$([0-9,]+\.?\d*)/

async function fetchBullionVaultPrice(path: string): Promise<number | null> {
  const url = `https://www.bullionvault.com${path}`
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, 'Accept': 'text/html' },
      signal: AbortSignal.timeout(12_000),
    })
    if (!res.ok) return null
    const html = await res.text()
    const m = html.match(PRICE_RE)
    if (!m) return null
    const price = parseFloat(m[1].replace(/,/g, ''))
    return isNaN(price) ? null : price
  } catch {
    return null
  }
}

export async function runUSMetalsFetcher(): Promise<{ success: number; failed: number }> {
  const [goldPrice, silverPrice] = await Promise.all([
    fetchBullionVaultPrice('/gold-price-chart.do'),
    fetchBullionVaultPrice('/silver-price-chart.do'),
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
    console.error(JSON.stringify({ event: 'us_metals_fetch_error', metal: 'gold' }))
    failed++
  }

  if (silverPrice !== null) {
    rows.push({ country: 'US', region: null, subtype: 'silver', value: Number(silverPrice.toFixed(4)), unit: '$/oz', source: SOURCE })
  } else {
    console.error(JSON.stringify({ event: 'us_metals_fetch_error', metal: 'silver' }))
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
