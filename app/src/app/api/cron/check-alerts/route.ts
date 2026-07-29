import { NextRequest, NextResponse } from 'next/server'
import { verifyCronRequest } from '@/lib/tokens'
import { dbAdmin } from '@/lib/db'
import { updateLastValue, triggerAlert } from '@/lib/alerts'
import type { Alert } from '@/types'

export const runtime = 'edge'
export const maxDuration = 300

export async function POST(request: NextRequest) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: alerts, error } = await dbAdmin
    .from('alerts')
    .select('*')
    .eq('status', 'confirmed')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let triggered = 0
  let checked = 0

  for (const alert of (alerts ?? []) as Alert[]) {
    // Get the latest rate for this alert's target
    let rateQuery = dbAdmin
      .from('rates')
      .select('value')
      .eq('watcher_type', alert.watcher_type)
      .eq('country', alert.country)
      .eq('subtype', alert.subtype)
      .order('fetched_at', { ascending: false })
      .limit(1)

    rateQuery = alert.region === null
      ? rateQuery.is('region', null)
      : rateQuery.eq('region', alert.region)

    const { data: rateRows } = await rateQuery
    if (!rateRows || rateRows.length === 0) continue

    const currentValue = Number(rateRows[0].value)
    checked++

    let shouldTrigger = false

    if (alert.operator === 'above') {
      shouldTrigger = currentValue > alert.threshold
    } else if (alert.operator === 'below') {
      shouldTrigger = currentValue < alert.threshold
    } else if (alert.operator === 'change_pct' && alert.last_value !== null) {
      const pct = Math.abs(currentValue - alert.last_value) / alert.last_value * 100
      shouldTrigger = pct > alert.threshold
    }

    await updateLastValue(alert.id, currentValue)

    if (shouldTrigger) {
      // TODO: Send notification (email or WhatsApp)
      // await sendTriggerNotification(alert, currentValue)
      await triggerAlert(alert.id)
      triggered++
    }
  }

  return NextResponse.json({ checked, triggered })
}
