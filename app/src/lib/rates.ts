import { db } from './db'
import type { Country, RateWithTrend, RegionRate, WatcherType } from '@/types'

export async function getLatestRate(
  watcher_type: WatcherType,
  country: Country,
  subtype: string,
  region: string | null = null,
): Promise<RateWithTrend | null> {
  let query = db
    .from('rates')
    .select('*')
    .eq('watcher_type', watcher_type)
    .eq('country', country)
    .eq('subtype', subtype)
    .order('fetched_at', { ascending: false })
    .limit(2)

  query = region === null ? query.is('region', null) : query.eq('region', region)

  const { data, error } = await query
  if (error || !data || data.length === 0) return null

  const [latest, prev] = data
  const delta = prev ? Number(latest.value) - Number(prev.value) : 0
  const trend = delta > 0.001 ? 'up' : delta < -0.001 ? 'down' : 'flat'

  return { ...latest, value: Number(latest.value), trend, delta: Number(delta.toFixed(2)) }
}

// Get latest petrol + diesel for a single region (used on detail pages)
export async function getRegionRates(
  watcher_type: WatcherType,
  country: Country,
  region: string | null,
  subtypes: string[],
): Promise<RateWithTrend[]> {
  const results = await Promise.all(
    subtypes.map(subtype => getLatestRate(watcher_type, country, subtype, region))
  )
  return results.filter((r): r is RateWithTrend => r !== null)
}

// Get all regions' latest rates for a country (used on the breakdown table)
export async function getAllRegionRates(
  watcher_type: WatcherType,
  country: Country,
  subtypes: string[],
): Promise<RegionRate[]> {
  const { data, error } = await db.rpc('get_latest_rates_by_region', {
    p_watcher_type: watcher_type,
    p_country: country,
  })

  if (error || !data) {
    // Fallback: manual DISTINCT ON emulation with a subquery
    return getAllRegionRatesFallback(watcher_type, country, subtypes)
  }

  return groupByRegion(data)
}

async function getAllRegionRatesFallback(
  watcher_type: WatcherType,
  country: Country,
  subtypes: string[],
): Promise<RegionRate[]> {
  const { data, error } = await db
    .from('rates')
    .select('region, subtype, value, unit, fetched_at')
    .eq('watcher_type', watcher_type)
    .eq('country', country)
    .in('subtype', subtypes)
    .not('region', 'is', null)
    .order('fetched_at', { ascending: false })
    .limit(1000)

  if (error || !data) return []

  // Keep only the latest row per (region, subtype)
  const seen = new Set<string>()
  const latest = data.filter(row => {
    const key = `${row.region}|${row.subtype}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return groupByRegion(latest)
}

function groupByRegion(rows: Array<{ region: string; subtype: string; value: number; unit: string; fetched_at: string }>): RegionRate[] {
  const map = new Map<string, RegionRate>()

  for (const row of rows) {
    if (!row.region) continue
    if (!map.has(row.region)) {
      map.set(row.region, { region: row.region, name: row.region, rates: [] })
    }
    map.get(row.region)!.rates.push({
      subtype: row.subtype,
      value: Number(row.value),
      unit: row.unit,
      fetched_at: row.fetched_at,
    })
  }

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
}
