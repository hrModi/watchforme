import { NextRequest, NextResponse } from 'next/server'
import { verifyCronRequest } from '@/lib/tokens'
import { sendCronFailureEmail } from '@/lib/email'

interface CronResult {
  path: string
  status: number
  ok: boolean
  success?: number
  failed?: number
  error?: string
}

interface Payload {
  hour: number
  results: CronResult[]
}

export async function POST(request: NextRequest) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await request.json() as Payload

  try {
    await sendCronFailureEmail(payload.hour, payload.results)
  } catch (e) {
    console.error(JSON.stringify({ event: 'notify_failure_email_error', error: String(e) }))
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
