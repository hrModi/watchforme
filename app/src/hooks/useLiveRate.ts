'use client'

import { useEffect, useRef, useState } from 'react'
import type { Country, Rate, WatcherType } from '@/types'

interface Options {
  watcherType: WatcherType
  country: Country
  region?: string | null
  subtype?: string
  // ms between polls; omit for a single fetch on mount
  refreshInterval?: number
  // value from server prerender — shown immediately while live fetch is in-flight
  initialValue?: number | null
}

interface Result {
  value: number | null
  unit: string | null
  fetchedAt: string | null
  loading: boolean
  error: boolean
}

export function useLiveRate({
  watcherType,
  country,
  region,
  subtype,
  refreshInterval,
  initialValue = null,
}: Options): Result {
  const [value, setValue] = useState<number | null>(initialValue)
  const [unit, setUnit] = useState<string | null>(null)
  const [fetchedAt, setFetchedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const params = new URLSearchParams({ watcher_type: watcherType, country })
      if (region) params.set('region', region)
      if (subtype) params.set('subtype', subtype)

      try {
        const res = await fetch(`/api/rates?${params}`)
        if (!res.ok || cancelled) return
        const data: { rates: Rate[] } = await res.json()
        const rate = subtype
          ? data.rates.find(r => r.subtype === subtype)
          : data.rates[0]
        if (rate && !cancelled) {
          setValue(rate.value)
          setUnit(rate.unit)
          setFetchedAt(rate.fetched_at)
          setError(false)
        }
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }

      if (refreshInterval && !cancelled) {
        timerRef.current = setTimeout(load, refreshInterval)
      }
    }

    load()

    return () => {
      cancelled = true
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [watcherType, country, region, subtype, refreshInterval])

  return { value, unit, fetchedAt, loading, error }
}
