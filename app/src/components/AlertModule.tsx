'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { formatPrice } from '@/lib/format'
import type { AlertOperator, Country, WatcherType } from '@/types'

interface AlertModuleProps {
  watcher_type: WatcherType
  country: Country
  region?: string
  subtype: string       // active fuel type; changes when parent switches tabs
  unit: string
  currentValue?: number
}

type Channel = 'email' | 'whatsapp'

const OPERATORS: { value: AlertOperator; label: string }[] = [
  { value: 'below',      label: 'Price drops below' },
  { value: 'above',      label: 'Price goes above' },
  { value: 'change_pct', label: 'Changes by more than' },
]

type FormState = 'idle' | 'loading' | 'success' | 'duplicate' | 'error'

function defaultThreshold(value?: number) {
  if (!value) return ''
  const raw = value * 0.97
  return value >= 100 ? String(Math.round(raw)) : raw.toFixed(2)
}

const SUBTYPE_LABELS: Record<string, string> = {
  gold_24k: '24K Gold', gold_22k: '22K Gold', gold: 'Gold', silver: 'Silver',
  petrol: 'Petrol', diesel: 'Diesel', cng: 'CNG', gasoline: 'Gasoline',
}

function fuelLabel(subtype: string) {
  return SUBTYPE_LABELS[subtype] ?? subtype.charAt(0).toUpperCase() + subtype.slice(1)
}

export default function AlertModule({
  watcher_type,
  country,
  region,
  subtype,
  unit,
  currentValue,
}: AlertModuleProps) {
  const [operator, setOperator] = useState<AlertOperator>('below')
  const [threshold, setThreshold] = useState(defaultThreshold(currentValue))
  const [channel, setChannel] = useState<Channel>('email')
  const [contact, setContact] = useState('')
  const [formState, setFormState] = useState<FormState>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset threshold when active fuel changes
  useEffect(() => {
    setThreshold(defaultThreshold(currentValue))
    setErrors({})
    setFormState('idle')
  }, [subtype, currentValue])

  const thresholdUnit = operator === 'change_pct' ? '%' : unit
  const sym = unit.startsWith('₹') ? '₹' : '$'
  const denom = unit.replace(/^[₹$]/, '')

  function validate(): boolean {
    const errs: Record<string, string> = {}
    const thresh = parseFloat(threshold)
    if (!threshold || isNaN(thresh) || thresh <= 0) errs.threshold = 'Enter a valid positive number'
    if (channel === 'email') {
      if (!contact || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) errs.contact = 'Enter a valid email address'
    } else {
      if (!contact || !/^\+?[\d\s\-().]{7,}$/.test(contact)) errs.contact = 'Enter a valid phone number (include country code)'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setFormState('loading')
    try {
      const body: Record<string, unknown> = {
        watcher_type, country, region, subtype,
        operator, threshold: parseFloat(threshold),
        channel, unit,
        ...(channel === 'email' ? { email: contact } : { phone: contact }),
      }
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.status === 409) setFormState('duplicate')
      else if (res.ok) setFormState('success')
      else setFormState('error')
    } catch {
      setFormState('error')
    }
  }

  if (formState === 'success') {
    return (
      <div
        className="rounded-xl border p-4 text-sm"
        style={{ backgroundColor: 'var(--accent-subtle)', borderColor: 'var(--accent-dim)', color: 'var(--accent)' }}
        role="status"
      >
        <p className="font-semibold">Check your {channel === 'email' ? 'inbox' : 'WhatsApp'}.</p>
        <p className="mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Confirmation {channel === 'email' ? 'email' : 'message'} sent to {contact}. Click the link to activate.
        </p>
      </div>
    )
  }

  if (formState === 'duplicate') {
    return (
      <div
        className="rounded-xl border p-4 text-sm"
        style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        role="status"
      >
        You already have an active alert for this condition.
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      aria-label="Set a price alert"
      noValidate
    >
      {/* Header */}
      <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <p className="text-xs font-semibold tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
          Set a {fuelLabel(subtype)} price alert
        </p>
        {currentValue && (
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>
            Current price: <span className="font-semibold tabular" style={{ color: 'var(--text)' }}>{sym}{formatPrice(currentValue, unit)}{denom}</span>
          </p>
        )}
      </div>

      {/* Form body */}
      <div className="px-4 py-4">
        <div className="flex flex-wrap gap-3 items-start">
          {/* Condition */}
          <div className="flex flex-col gap-1">
            <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Condition</label>
            <select
              value={operator}
              onChange={e => setOperator(e.target.value as AlertOperator)}
              className="text-sm rounded-lg border px-3 py-2"
              style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
            >
              {OPERATORS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Threshold */}
          <div className="flex flex-col gap-1">
            <label className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {operator === 'change_pct' ? 'Percent' : `Value (${unit})`}
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0"
                value={threshold}
                onChange={e => { setThreshold(e.target.value); setErrors(err => ({ ...err, threshold: '' })) }}
                placeholder={operator === 'change_pct' ? 'e.g. 5' : currentValue ? String(Math.round(currentValue * 0.97)) : 'e.g. 92'}
                className="text-sm rounded-lg border px-3 py-2 w-36 tabular"
                style={{ backgroundColor: 'var(--surface-2)', borderColor: errors.threshold ? '#B91C1C' : 'var(--border)', color: 'var(--text)' }}
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: 'var(--text-faint)' }}>
                {thresholdUnit}
              </span>
            </div>
            {errors.threshold && <p className="text-xs" style={{ color: '#B91C1C' }}>{errors.threshold}</p>}
          </div>

          {/* Channel */}
          <div className="flex flex-col gap-1">
            <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Notify via</label>
            <div className="flex rounded-lg border overflow-hidden text-sm" style={{ borderColor: 'var(--border)' }}>
              <button
                type="button"
                onClick={() => { setChannel('email'); setContact(''); setErrors({}) }}
                className="px-3 py-2 transition-colors"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: '#fff',
                  borderRight: '1px solid var(--border)',
                }}
              >
                Email
              </button>
              <span title="WhatsApp alerts coming soon" style={{ cursor: 'not-allowed' }}>
                <button
                  type="button"
                  disabled
                  className="px-3 py-2 select-none pointer-events-none"
                  style={{
                    backgroundColor: 'var(--surface-2)',
                    color: 'var(--text-faint)',
                    opacity: 0.5,
                  }}
                >
                  WhatsApp
                </button>
              </span>
            </div>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-1 flex-1 min-w-[160px] w-full">
            <label className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {channel === 'email' ? 'Email address' : 'Phone (with country code)'}
            </label>
            <input
              type={channel === 'email' ? 'email' : 'tel'}
              value={contact}
              onChange={e => { setContact(e.target.value); setErrors(err => ({ ...err, contact: '' })) }}
              placeholder={channel === 'email' ? 'you@example.com' : '+91 98765 43210'}
              className="text-sm rounded-lg border px-3 py-2"
              style={{ backgroundColor: 'var(--surface-2)', borderColor: errors.contact ? '#B91C1C' : 'var(--border)', color: 'var(--text)' }}
              autoComplete={channel === 'email' ? 'email' : 'tel'}
            />
            {errors.contact && <p className="text-xs" style={{ color: '#B91C1C' }}>{errors.contact}</p>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4">
          <button
            type="submit"
            disabled={formState === 'loading'}
            className="text-sm font-semibold px-5 py-2 rounded-lg transition-opacity disabled:opacity-60"
            style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
          >
            {formState === 'loading' ? 'Sending…' : 'Notify me'}
          </button>
          <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
            No account needed · Unsubscribe any time
          </p>
        </div>

        {formState === 'error' && (
          <p className="text-xs mt-2" style={{ color: '#B91C1C' }} role="alert">
            Something went wrong. Please try again.
          </p>
        )}
      </div>
    </form>
  )
}
