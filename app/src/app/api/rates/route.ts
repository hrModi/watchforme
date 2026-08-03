import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getRegionRates } from '@/lib/rates'
import type { Country, WatcherType } from '@/types'


const schema = z.object({
  watcher_type: z.string(),
  country: z.string(),
  region: z.string().optional(),
  subtype: z.string().optional(),
})

const FUEL_SUBTYPES: Record<string, string[]> = {
  IN: ['petrol', 'diesel'],
  US: ['gasoline', 'diesel'],
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const parsed = schema.safeParse(Object.fromEntries(searchParams))

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query params' }, { status: 400 })
  }

  const { watcher_type, country, region } = parsed.data
  const subtypes = parsed.data.subtype
    ? [parsed.data.subtype]
    : FUEL_SUBTYPES[country] ?? ['petrol', 'diesel']

  const rates = await getRegionRates(
    watcher_type as WatcherType,
    country as Country,
    region ?? null,
    subtypes,
  )

  return NextResponse.json(
    { watcher_type, country, region: region ?? null, rates },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    },
  )
}
