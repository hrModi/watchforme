import { NextRequest, NextResponse } from 'next/server'
import { runIndiaFuelFetcher } from '@/fetchers/india-fuel'
import { verifyCronRequest } from '@/lib/tokens'

export const maxDuration = 300

const VALID_FUEL_TYPES = ['petrol', 'diesel', 'cng'] as const
type FuelType = typeof VALID_FUEL_TYPES[number]

export async function POST(request: NextRequest) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const fuel = new URL(request.url).searchParams.get('fuel') as FuelType | null
  if (!fuel || !VALID_FUEL_TYPES.includes(fuel)) {
    return NextResponse.json({ error: 'fuel param required: petrol | diesel | cng' }, { status: 400 })
  }

  const result = await runIndiaFuelFetcher(fuel)
  return NextResponse.json(result)
}
