// India Metal Price Fetcher
// Source: goodreturns.in (city-wise 22K/24K gold and silver rates)
// Cadence: daily at 07:00 UTC (12:30 IST) after MCX opens
// Split by metal type to keep invocations under Cloudflare's subrequest limit.

import { dbAdmin } from '@/lib/db'
import { METAL_CITIES } from '@/config/metal-cities'
import type { FetcherResult } from '@/types'

const BASE_URL = 'https://www.goodreturns.in'
const SOURCE = 'goodreturns'
const UA = 'Mozilla/5.0 (compatible; WatcherBot/1.0; +https://watchforme.me)'

type MetalType = 'gold' | 'silver'

function parseInrAmount(s: string): number | null {
  const n = parseFloat(s.replace(/[,\s]/g, ''))
  return isNaN(n) ? null : n
}

interface GoldRates { k24: number | null; k22: number | null }

function extractGoldRates(html: string): GoldRates {
  // Split at the 24K section boundary; 22K section comes first on goodreturns
  const parts = html.split(/24\s*(?:Carat|Karat|K)\b/i)
  const section22 = parts[0] ?? ''
  const section24 = parts[1] ?? ''

  const tenGramRe = /10\s*(?:[Gg]ram|g\b)[^₹]*₹\s*([\d,]+)/s

  const m22 = section22.match(tenGramRe)
  const m24 = section24.match(tenGramRe)

  return {
    k22: m22 ? parseInrAmount(m22[1]) : null,
    k24: m24 ? parseInrAmount(m24[1]) : null,
  }
}

function extractSilverRate(html: string): number | null {
  // Look for 1 Kg row price
  const m = html.match(/1\s*(?:Kg|kg|KG)\b[^₹]*₹\s*([\d,]+)/s)
  return m ? parseInrAmount(m[1]) : null
}

async function fetchGoldPage(goodreturnsSlug: string): Promise<GoldRates> {
  try {
    const res = await fetch(`${BASE_URL}/gold-rates/${goodreturnsSlug}.html`, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) return { k24: null, k22: null }
    const html = await res.text()
    return extractGoldRates(html)
  } catch {
    return { k24: null, k22: null }
  }
}

async function fetchSilverPage(goodreturnsSlug: string): Promise<number | null> {
  try {
    const res = await fetch(`${BASE_URL}/silver-rates/${goodreturnsSlug}.html`, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) return null
    const html = await res.text()
    return extractSilverRate(html)
  } catch {
    return null
  }
}

export async function runIndiaMetalsFetcher(metal: MetalType): Promise<{ success: number; failed: number }> {
  const rows: FetcherResult[] = []
  let failed = 0

  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)

  if (metal === 'gold') {
    for (const city of METAL_CITIES) {
      const rates = await fetchGoldPage(city.goodreturnsSlug)
      if (rates.k24 === null && rates.k22 === null) {
        console.error(JSON.stringify({ event: 'india_metal_fetch_error', city: city.slug, metal }))
        failed++
        continue
      }
      if (rates.k24 !== null) {
        rows.push({ country: 'IN', region: city.slug, subtype: 'gold_24k', value: rates.k24, unit: '₹/10g', source: SOURCE })
      }
      if (rates.k22 !== null) {
        rows.push({ country: 'IN', region: city.slug, subtype: 'gold_22k', value: rates.k22, unit: '₹/10g', source: SOURCE })
      }
    }

    if (rows.length === 0) {
      console.error(JSON.stringify({ event: 'india_metals_no_data', metal }))
      return { success: 0, failed }
    }

    // National averages
    const k24rows = rows.filter(r => r.subtype === 'gold_24k')
    const k22rows = rows.filter(r => r.subtype === 'gold_22k')
    if (k24rows.length > 0) {
      const avg = k24rows.reduce((a, b) => a + b.value, 0) / k24rows.length
      rows.push({ country: 'IN', region: null, subtype: 'gold_24k', value: Number(avg.toFixed(2)), unit: '₹/10g', source: 'computed' })
    }
    if (k22rows.length > 0) {
      const avg = k22rows.reduce((a, b) => a + b.value, 0) / k22rows.length
      rows.push({ country: 'IN', region: null, subtype: 'gold_22k', value: Number(avg.toFixed(2)), unit: '₹/10g', source: 'computed' })
    }

    await dbAdmin.from('rates')
      .delete()
      .eq('watcher_type', 'gold')
      .eq('country', 'IN')
      .in('subtype', ['gold_24k', 'gold_22k'])
      .gte('fetched_at', todayStart.toISOString())

  } else {
    for (const city of METAL_CITIES) {
      const price = await fetchSilverPage(city.goodreturnsSlug)
      if (price === null) {
        console.error(JSON.stringify({ event: 'india_metal_fetch_error', city: city.slug, metal }))
        failed++
        continue
      }
      rows.push({ country: 'IN', region: city.slug, subtype: 'silver', value: price, unit: '₹/kg', source: SOURCE })
    }

    if (rows.length === 0) {
      console.error(JSON.stringify({ event: 'india_metals_no_data', metal }))
      return { success: 0, failed }
    }

    // National average
    const avg = rows.reduce((a, b) => a + b.value, 0) / rows.length
    rows.push({ country: 'IN', region: null, subtype: 'silver', value: Number(avg.toFixed(2)), unit: '₹/kg', source: 'computed' })

    await dbAdmin.from('rates')
      .delete()
      .eq('watcher_type', 'gold')
      .eq('country', 'IN')
      .eq('subtype', 'silver')
      .gte('fetched_at', todayStart.toISOString())
  }

  const insertRows = rows.map(r => ({ watcher_type: 'gold', ...r }))
  const { error } = await dbAdmin.from('rates').insert(insertRows)

  if (error) {
    console.error(JSON.stringify({ event: 'india_metals_db_error', metal, error: error.message }))
    return { success: 0, failed: rows.length }
  }

  const citiesSucceeded = rows.filter(r => r.region !== null).length
  console.log(JSON.stringify({ event: 'india_metals_done', metal, cities: citiesSucceeded, failed }))
  return { success: citiesSucceeded, failed }
}
