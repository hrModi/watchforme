import { NextRequest, NextResponse } from 'next/server'
import { runIndiaFuelFetcher } from '@/fetchers/india-fuel'
import { verifyCronRequest } from '@/lib/tokens'

export const runtime = 'edge'
export const maxDuration = 300

export async function POST(request: NextRequest) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await runIndiaFuelFetcher()
  return NextResponse.json(result)
}
