import type { MetadataRoute } from 'next'
import { INDIA_CITIES } from '@/config/india-cities'
import { US_STATES } from '@/config/us-states'

const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://watchforme.me').replace(/\/$/, '')

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const indiaFuelUrls: MetadataRoute.Sitemap = INDIA_CITIES.flatMap(city => [
    // Legacy URLs kept for already-indexed pages; new canonical URLs added below
    { url: `${BASE}/fuel-price/india/${city.slug}`,   lastModified: now, changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${BASE}/petrol-price/india/${city.slug}`, lastModified: now, changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${BASE}/diesel-price/india/${city.slug}`, lastModified: now, changeFrequency: 'daily' as const, priority: 0.7 },
    { url: `${BASE}/cng-price/india/${city.slug}`,    lastModified: now, changeFrequency: 'daily' as const, priority: 0.7 },
  ])

  const usFuelUrls: MetadataRoute.Sitemap = US_STATES.flatMap(state => [
    // Legacy URLs kept for already-indexed pages; new canonical URLs added below
    { url: `${BASE}/fuel-price/us/${state.slug}`,     lastModified: now, changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${BASE}/gasoline-price/us/${state.slug}`, lastModified: now, changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${BASE}/diesel-price/us/${state.slug}`,   lastModified: now, changeFrequency: 'daily' as const, priority: 0.7 },
  ])

  return [
    { url: BASE, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE}/fuel-price/india`,    lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/petrol-price/india`,  lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/diesel-price/india`,  lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/cng-price/india`,     lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/fuel-price/us`,       lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/gasoline-price/us`,   lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/diesel-price/us`,     lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    ...indiaFuelUrls,
    ...usFuelUrls,
    { url: `${BASE}/about`,   lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/terms`,   lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
  ]
}
