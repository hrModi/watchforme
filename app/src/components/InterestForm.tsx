'use client'

import { useEffect, useState } from 'react'

interface InterestFormProps {
  watcherType: string
}

type SubmitState = 'idle' | 'loading' | 'success' | 'error'

export default function InterestForm({ watcherType }: InterestFormProps) {
  const [email, setEmail] = useState('')
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    fetch(`/api/interest?type=${encodeURIComponent(watcherType)}`)
      .then(r => r.json())
      .then(data => setCount(data.count ?? 0))
      .catch(() => {})
  }, [watcherType])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitState('loading')

    try {
      const res = await fetch('/api/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, watcher_type: watcherType }),
      })
      if (res.ok) {
        setSubmitState('success')
        setCount(c => (c ?? 0) + 1)
      } else {
        setSubmitState('error')
      }
    } catch {
      setSubmitState('error')
    }
  }

  if (submitState === 'success') {
    return (
      <div
        className="rounded-xl border p-5"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
      >
        <p className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
          You&apos;re on the list!
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          We&apos;ll email you as soon as this is ready to use.
        </p>
        {count !== null && count > 1 && (
          <p className="text-xs mt-2" style={{ color: 'var(--text-faint)' }}>
            {count} people are waiting.
          </p>
        )}
      </div>
    )
  }

  return (
    <div
      className="rounded-xl border p-5 space-y-4"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
    >
      {count !== null && count > 0 && (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="font-semibold" style={{ color: 'var(--text)' }}>{count}</span>{' '}
          {count === 1 ? 'person is' : 'people are'} waiting for this.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
          Get notified when it launches
        </p>
        <div className="flex gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            disabled={submitState === 'loading'}
            className="flex-1 text-sm rounded-lg px-3 outline-none border"
            style={{
              backgroundColor: 'var(--surface-2)',
              borderColor: 'var(--border)',
              color: 'var(--text)',
              height: '42px',
            }}
          />
          <button
            type="submit"
            disabled={submitState === 'loading'}
            className="text-sm font-semibold px-4 rounded-lg transition-opacity disabled:opacity-40 shrink-0"
            style={{ backgroundColor: 'var(--accent)', color: '#fff', height: '42px' }}
          >
            {submitState === 'loading' ? 'Saving…' : 'Notify me'}
          </button>
        </div>
        {submitState === 'error' && (
          <p className="text-xs" style={{ color: '#ef4444' }}>
            Something went wrong. Please try again.
          </p>
        )}
      </form>
    </div>
  )
}
