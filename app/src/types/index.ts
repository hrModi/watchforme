export type Country = 'IN' | 'US'
export type WatcherType = 'fuel' | 'gold' | 'currency' | 'loan' | 'fd' | 'stock' | 'pnr'
export type AlertStatus = 'pending' | 'confirmed' | 'triggered' | 'expired'
export type AlertChannel = 'email' | 'whatsapp'
export type AlertOperator = 'above' | 'below' | 'change_pct'
export type WatcherStatus = 'live' | 'coming_soon'
export type Trend = 'up' | 'down' | 'flat'

export interface Rate {
  id: string
  watcher_type: WatcherType
  country: Country
  region: string | null
  subtype: string
  value: number
  unit: string
  source: string
  fetched_at: string
}

export interface RateWithTrend extends Rate {
  trend: Trend
  delta: number
}

export interface Alert {
  id: string
  email: string | null
  phone: string | null
  channel: AlertChannel
  watcher_type: WatcherType
  country: Country
  region: string | null
  subtype: string
  operator: AlertOperator
  threshold: number
  status: AlertStatus
  token: string
  last_value: number | null
  created_at: string
  triggered_at: string | null
}

export interface WatcherDef {
  slug: string
  watcher_type: WatcherType
  name: string
  description: string
  countries: Country[]
  status: WatcherStatus
  icon: string
}

export interface RegionRate {
  region: string
  name: string
  rates: Array<{
    subtype: string
    value: number
    unit: string
    fetched_at: string
  }>
}

export interface FetcherResult {
  country: Country
  region: string | null
  subtype: string
  value: number
  unit: string
  source: string
}
