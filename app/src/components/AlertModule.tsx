'use client'

import { useState, type FormEvent } from 'react'
import type { AlertOperator, Country, WatcherType } from '@/types'

interface AlertModuleProps {
  watcher_type: WatcherType
  country: Country
  region?: string
  subtype: string
  unit: string              // '₹/L' | '$/gal'
  currentValue?: number
}

type Channel = 'email' | 'whatsapp'

const OPERATORS: { value: AlertOperator; label: string }[] = [
  { value: 'above',       label: 'Price goes above' },
  { value: 'below',       label: 'Price drops below' },
  { value: 'change_pct',  label: 'Price changes by more than' },
]

type FormState = 'idle' | 'loading' | 'success' | 'duplicate' | 'error'

export default function AlertModule({
  watcher_type,
  country,
  region,
  subtype,
  unit,
  currentValue,
}: AlertModuleProps) {
  const [operator, setOperator] = useState<AlertOperator>('below')
  const [threshold, setThreshold] = useState(currentValue ? String((currentValue * 0.97).toFixed(2)) : '')
  const [channel, setChannel] = useState<Channel>('email')
  const [contact, setContact] = useState('')
  const [state, setState] = useState<FormState>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const thresholdUnit = operator === 'change_pct' ? '%' : unit

  function validate(): boolean {
    const errs: Record<string, string> = {}
    const thresh = parseFloat(threshold)

    if (!threshold || isNaN(thresh) || thresh <= 0) {
      errs.threshold = 'Enter a valid positive number'
    }

    if (channel === 'email') {
      if (!contact || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) {
        errs.contact = 'Enter a valid email address'
      }
    } else {
      if (!contact || !/^\+?[\d\s\-().]{7,}$/.test(contact)) {
        errs.contact = 'Enter a valid phone number (include country code, e.g. +91...)'
      }
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setState('loading')

    try {
      const body: Record<string, unknown> = {
        watcher_type, country, region, subtype,
        operator, threshold: parseFloat(threshold),
        channel,
        ...(channel === 'email' ? { email: contact } : { phone: contact }),
      }

      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.status === 409) {
        setState('duplicate')
      } else if (res.ok) {
        setState('success')
      } else {
        setState('error')
      }
    } catch {
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div
        className="rounded-lg border p-4 text-sm"
        style={{ backgroundColor: 'var(--accent-subtle)', borderColor: 'var(--accent-dim)', color: 'var(--accent)' }}
        role="status"
      >
        <p className="font-semibold">Check your {channel === 'email' ? 'inbox' : 'WhatsApp'}.</p>
        <p className="mt-0.5" style={{ color: 'var(--text-muted)' }}>
          A confirmation {channel === 'email' ? 'email' : 'message'} is on its way to {contact}. Click the link to activate your alert.
        </p>
      </div>
    )
  }

  if (state === 'duplicate') {
    return (
      <div
        className="rounded-lg border p-4 text-sm"
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
      className="rounded-lg border p-4"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      aria-label="Set a price alert"
      noValidate
    >
      <p className="text-xs font-semibold tracking-wider uppercase mb-3" style={{ color: 'var(--text-faint)' }}>
        Set Alert — Free, no account needed
      </p>

      <div className="flex flex-wrap gap-2 items-start">
        {/* Condition */}
        <div className="flex flex-col gap-1">
          <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Condition</label>
          <select
            value={operator}
            onChange={e => setOperator(e.target.value as AlertOperator)}
            className="text-sm rounded-md border px-3 py-2"
            style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            {OPERATORS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Threshold */}
        <div className="flex flex-col gap-1">
          <label className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {operator === 'change_pct' ? 'Percent (%)' : `Value (${unit})`}
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0"
              value={threshold}
              onChange={e => { setThreshold(e.target.value); setErrors(err => ({ ...err, threshold: '' })) }}
              placeholder={operator === 'change_pct' ? 'e.g. 5' : 'e.g. 92.00'}
              className="text-sm rounded-md border px-3 py-2 w-32 tabular"
              style={{ backgroundColor: 'var(--surface-2)', borderColor: errors.threshold ? '#B91C1C' : 'var(--border)', color: 'var(--text)' }}
              aria-describedby={errors.threshold ? 'threshold-error' : undefined}
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: 'var(--text-faint)' }}>
              {thresholdUnit}
            </span>
          </div>
          {errors.threshold && <p id="threshold-error" className="text-xs" style={{ color: '#B91C1C' }}>{errors.threshold}</p>}
        </div>

        {/* Channel */}
        <div className="flex flex-col gap-1">
          <label className="text-xs" style={{ color: 'var(--text-muted)' }}>Notify via</label>
          <div className="flex rounded-md border overflow-hidden text-sm" style={{ borderColor: 'var(--border)' }}>
            {(['email', 'whatsapp'] as Channel[]).map(c => (
              <button
                key={c}
                type="button"
                onClick={() => { setChannel(c); setContact(''); setErrors({}) }}
                className="px-3 py-2 capitalize transition-colors"
                style={{
                  backgroundColor: channel === c ? 'var(--accent)' : 'var(--surface-2)',
                  color: channel === c ? '#fff' : 'var(--text-muted)',
                  borderRight: c === 'email' ? `1px solid var(--border)` : undefined,
                }}
              >
                {c === 'email' ? 'Email' : 'WhatsApp'}
              </button>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <label className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {channel === 'email' ? 'Email address' : 'Phone (with country code)'}
          </label>
          <input
            type={channel === 'email' ? 'email' : 'tel'}
            value={contact}
            onChange={e => { setContact(e.target.value); setErrors(err => ({ ...err, contact: '' })) }}
            placeholder={channel === 'email' ? 'you@example.com' : '+91 98765 43210'}
            className="text-sm rounded-md border px-3 py-2"
            style={{ backgroundColor: 'var(--surface-2)', borderColor: errors.contact ? '#B91C1C' : 'var(--border)', color: 'var(--text)' }}
            aria-describedby={errors.contact ? 'contact-error' : undefined}
            autoComplete={channel === 'email' ? 'email' : 'tel'}
          />
          {errors.contact && <p id="contact-error" className="text-xs" style={{ color: '#B91C1C' }}>{errors.contact}</p>}
        </div>

        {/* Submit */}
        <div className="flex flex-col gap-1">
          <label className="text-xs invisible" aria-hidden>Submit</label>
          <button
            type="submit"
            disabled={state === 'loading'}
            className="text-sm font-semibold px-4 py-2 rounded-md transition-opacity disabled:opacity-60"
            style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
          >
            {state === 'loading' ? 'Sending…' : 'Notify me'}
          </button>
        </div>
      </div>

      {state === 'error' && (
        <p className="text-xs mt-3" style={{ color: '#B91C1C' }} role="alert">
          Something went wrong. Please try again.
        </p>
      )}

      <p className="text-xs mt-3" style={{ color: 'var(--text-faint)' }}>
        Free forever · No account · Unsubscribe any time
      </p>
    </form>
  )
}
