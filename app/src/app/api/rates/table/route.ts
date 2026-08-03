import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAllRegionRates } from '@/lib/rates'
import type { Country, WatcherType } from '@/types'


const schema = z.object({
  watcher_type: z.string(),
  country: z.string(),
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

  const { watcher_type, country } = parsed.data
  const subtypes = FUEL_SUBTYPES[country] ?? ['petrol', 'diesel']

  const regions = await getAllRegionRates(
    watcher_type as WatcherType,
    country as Country,
    subtypes,
  )

  return NextResponse.json(
    { watcher_type, country, regions },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    },
  )
}
