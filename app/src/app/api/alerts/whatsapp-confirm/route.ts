import { NextRequest, NextResponse } from 'next/server'
import { confirmAlert, expireAlert } from '@/lib/alerts'
import { dbAdmin } from '@/lib/db'


// WhatsApp Cloud API webhook verification
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return new Response(challenge ?? '', { status: 200 })
  }

  return new Response('Forbidden', { status: 403 })
}

interface WhatsAppMessage {
  from: string
  text?: { body: string }
  type: string
}

interface WhatsAppEntry {
  changes: Array<{
    value: {
      messages?: WhatsAppMessage[]
    }
  }>
}

interface WhatsAppWebhookBody {
  object: string
  entry: WhatsAppEntry[]
}

export async function POST(request: NextRequest) {
  // Verify HMAC signature (Meta requires this)
  const signature = request.headers.get('X-Hub-Signature-256') ?? ''
  const body = await request.text()

  if (!verifySignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: WhatsAppWebhookBody
  try {
    payload = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      for (const message of change.value.messages ?? []) {
        const phone = `+${message.from}`
        const text = (message.text?.body ?? '').trim().toUpperCase()

        if (text === 'STOP') {
          // Expire all confirmed alerts for this phone number
          await dbAdmin
            .from('alerts')
            .update({ status: 'expired' })
            .eq('phone', phone)
            .in('status', ['pending', 'confirmed'])
        } else {
          // Any other message = opt-in confirmation
          // Find the most recent pending alert for this phone
          const { data } = await dbAdmin
            .from('alerts')
            .select('token')
            .eq('phone', phone)
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          if (data?.token) {
            await confirmAlert(data.token)
          }
        }
      }
    }
  }

  return NextResponse.json({ status: 'ok' })
}

async function verifySignature(body: string, signature: string): Promise<boolean> {
  const secret = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN
  if (!secret) return false

  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    )
    const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body))
    const expected = 'sha256=' + Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2, '0')).join('')
    return signature === expected
  } catch {
    return false
  }
}
