import type { MetadataRoute } from 'next'
import { INDIA_CITIES } from '@/config/india-cities'
import { US_STATES } from '@/config/us-states'

const BASE = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://watchforme.me').replace(/\/$/, '')

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const cityUrls: MetadataRoute.Sitemap = INDIA_CITIES.map(city => ({
    url: `${BASE}/fuel-price/india/${city.slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  const stateUrls: MetadataRoute.Sitemap = US_STATES.map(state => ({
    url: `${BASE}/fuel-price/us/${state.slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  return [
    { url: BASE, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE}/fuel-price/india`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/fuel-price/us`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    ...cityUrls,
    ...stateUrls,
  ]
}
