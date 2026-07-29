import { NextRequest, NextResponse } from 'next/server'
import { runUSFuelFetcher } from '@/fetchers/us-fuel'
import { verifyCronRequest } from '@/lib/tokens'

export const runtime = 'edge'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await runUSFuelFetcher()
  return NextResponse.json(result)
}
