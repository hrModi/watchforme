import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Resend } from 'resend'
import { db, dbAdmin } from '@/lib/db'

export const runtime = 'edge'

const NOTIFY_EMAIL = 'hridaymodi.work@gmail.com'
const FROM = process.env.EMAIL_FROM ?? 'alerts@watchforme.me'

function getResend() {
  const key = process.env.EMAIL_API_KEY
  if (!key) return null
  return new Resend(key)
}

async function notifyOwner(email: string, watcher_type: string) {
  const resend = getResend()
  if (!resend) return
  await resend.emails.send({
    from: FROM,
    to: NOTIFY_EMAIL,
    subject: `New interest: ${watcher_type}`,
    text: `${email} just signed up for the ${watcher_type} watcher on WatchForMe.me.`,
  })
}

const schema = z.object({
  email: z.string().email(),
  watcher_type: z.string().min(1),
})

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type')
  if (!type) return NextResponse.json({ count: 0 })

  const { count } = await db
    .from('interest_signups')
    .select('*', { count: 'exact', head: true })
    .eq('watcher_type', type)

  return NextResponse.json({ count: count ?? 0 })
}

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const { email, watcher_type } = parsed.data

  const { error } = await dbAdmin
    .from('interest_signups')
    .upsert({ email, watcher_type }, { onConflict: 'email,watcher_type', ignoreDuplicates: true })

  if (error) {
    console.error('Interest signup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }

  notifyOwner(email, watcher_type).catch(err => console.error('Notify owner failed:', err))

  return NextResponse.json({ message: 'Signed up' }, { status: 201 })
}
