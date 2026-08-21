import { NextRequest, NextResponse } from 'next/server'
import { runIndiaMetalsFetcher } from '@/fetchers/india-metals'
import { verifyCronRequest } from '@/lib/tokens'

export const maxDuration = 300

const VALID_METALS = ['gold', 'silver'] as const
type MetalType = typeof VALID_METALS[number]

export async function POST(request: NextRequest) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const metal = new URL(request.url).searchParams.get('metal') as MetalType | null
  if (!metal || !VALID_METALS.includes(metal)) {
    return NextResponse.json({ error: 'metal param required: gold | silver' }, { status: 400 })
  }

  const result = await runIndiaMetalsFetcher(metal)
  return NextResponse.json(result)
}
