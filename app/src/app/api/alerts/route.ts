import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAlert } from '@/lib/alerts'
import { sendConfirmationEmail } from '@/lib/email'

export const runtime = 'edge'

const schema = z.object({
  channel: z.enum(['email', 'whatsapp']),
  email: z.string().email().optional(),
  phone: z.string().min(7).optional(),
  watcher_type: z.string(),
  country: z.string().length(2),
  region: z.string().optional(),
  subtype: z.string(),
  operator: z.enum(['above', 'below', 'change_pct']),
  threshold: z.number().positive(),
  unit: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.channel === 'email' && !data.email) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'email required', path: ['email'] })
  }
  if (data.channel === 'whatsapp' && !data.phone) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'phone required', path: ['phone'] })
  }
})

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

  try {
    const { alert, isNew } = await createAlert({
      channel: parsed.data.channel,
      email: parsed.data.email,
      phone: parsed.data.phone,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      watcher_type: parsed.data.watcher_type as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      country: parsed.data.country as any,
      region: parsed.data.region,
      subtype: parsed.data.subtype,
      operator: parsed.data.operator,
      threshold: parsed.data.threshold,
    })

    if (!isNew) {
      return NextResponse.json(
        { message: 'Alert already active', alert_id: alert.id },
        { status: 409 },
      )
    }

    if (alert.channel === 'email') {
      try {
        await sendConfirmationEmail(alert, parsed.data.unit ?? '₹/L')
      } catch (err) {
        console.error('Failed to send confirmation email:', err)
      }
    }

    return NextResponse.json({ message: 'Confirmation sent' }, { status: 201 })
  } catch (err) {
    console.error('Alert creation error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
