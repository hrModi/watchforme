import { NextResponse } from 'next/server'
import { runUSMetalsFetcher } from '@/fetchers/us-metals'
import { verifyCronRequest } from '@/lib/tokens'
import type { NextRequest } from 'next/server'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await runUSMetalsFetcher()
  return NextResponse.json(result)
}
