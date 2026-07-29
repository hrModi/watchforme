import { dbAdmin } from './db'
import { generateToken } from './tokens'
import type { Alert, AlertChannel, AlertOperator, Country, WatcherType } from '@/types'

export interface CreateAlertInput {
  channel: AlertChannel
  email?: string
  phone?: string
  watcher_type: WatcherType
  country: Country
  region?: string
  subtype: string
  operator: AlertOperator
  threshold: number
}

export async function createAlert(input: CreateAlertInput): Promise<{ alert: Alert; isNew: boolean }> {
  const contact = input.channel === 'email'
    ? { email: input.email, phone: null }
    : { email: null, phone: input.phone }

  // Check for existing active alert on the same condition
  let existingQuery = dbAdmin
    .from('alerts')
    .select('*')
    .eq('channel', input.channel)
    .eq('watcher_type', input.watcher_type)
    .eq('country', input.country)
    .eq('subtype', input.subtype)
    .eq('operator', input.operator)
    .eq('threshold', input.threshold)
    .in('status', ['pending', 'confirmed'])

  if (input.channel === 'email') {
    existingQuery = existingQuery.eq('email', input.email)
  } else {
    existingQuery = existingQuery.eq('phone', input.phone)
  }

  if (input.region) {
    existingQuery = existingQuery.eq('region', input.region)
  } else {
    existingQuery = existingQuery.is('region', null)
  }

  const { data: existing } = await existingQuery.single()
  if (existing) return { alert: existing as Alert, isNew: false }

  const token = generateToken()

  const { data, error } = await dbAdmin
    .from('alerts')
    .insert({
      ...contact,
      channel: input.channel,
      watcher_type: input.watcher_type,
      country: input.country,
      region: input.region ?? null,
      subtype: input.subtype,
      operator: input.operator,
      threshold: input.threshold,
      token,
    })
    .select()
    .single()

  if (error || !data) throw new Error(`Failed to create alert: ${error?.message}`)
  return { alert: data as Alert, isNew: true }
}

export async function confirmAlert(token: string): Promise<Alert | null> {
  const { data, error } = await dbAdmin
    .from('alerts')
    .update({ status: 'confirmed' })
    .eq('token', token)
    .eq('status', 'pending')
    .select()
    .single()

  if (error) return null
  return data as Alert
}

export async function expireAlert(token: string): Promise<boolean> {
  const { error } = await dbAdmin
    .from('alerts')
    .update({ status: 'expired' })
    .eq('token', token)
    .in('status', ['pending', 'confirmed'])

  return !error
}

export async function getConfirmedAlerts(
  watcher_type: WatcherType,
  country: Country,
  region: string | null,
  subtype: string,
): Promise<Alert[]> {
  let query = dbAdmin
    .from('alerts')
    .select('*')
    .eq('watcher_type', watcher_type)
    .eq('country', country)
    .eq('subtype', subtype)
    .eq('status', 'confirmed')

  query = region === null ? query.is('region', null) : query.eq('region', region)

  const { data } = await query
  return (data ?? []) as Alert[]
}

export async function updateLastValue(alertId: string, lastValue: number): Promise<void> {
  await dbAdmin
    .from('alerts')
    .update({ last_value: lastValue })
    .eq('id', alertId)
}

export async function triggerAlert(alertId: string): Promise<void> {
  await dbAdmin
    .from('alerts')
    .update({ status: 'triggered', triggered_at: new Date().toISOString() })
    .eq('id', alertId)
}
