'use client'

import Link from 'next/link'

interface Rate {
  value: number
  unit: string
  fetched_at: string
}

interface PriceCardProps {
  name: string
  state?: string
  slug: string
  basePath: string
  primaryRate?: Rate
  primaryLabel: string
  secondaryRate?: Rate
  secondaryLabel: string
}

function fmt(value: number, unit: string) {
  const sym = unit.startsWith('₹') ? '₹' : '$'
  return `${sym}${value.toFixed(2)}`
}

function relativeDate(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const daysDiff = Math.floor((now.getTime() - d.getTime()) / 86_400_000)
  if (daysDiff === 0) return 'Today'
  if (daysDiff === 1) return 'Yesterday'
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export default function PriceCard({
  name,
  state,
  slug,
  basePath,
  primaryRate,
  primaryLabel,
  secondaryRate,
  secondaryLabel,
}: PriceCardProps) {
  const updatedAt = primaryRate?.fetched_at ?? secondaryRate?.fetched_at

  return (
    <Link
      href={`${basePath}/${slug}`}
      className="block rounded-xl p-4 transition-colors"
      style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
      }}
      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-dim)')}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border)')}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{name}</p>
          {state && (
            <p className="text-xs font-medium tracking-wider uppercase mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {state}
            </p>
          )}
        </div>
      </div>

      {primaryRate ? (
        <p className="font-display text-2xl font-bold tabular tracking-tight" style={{ color: 'var(--text)' }}>
          {fmt(primaryRate.value, primaryRate.unit)}
          <span className="text-sm font-normal ml-1" style={{ color: 'var(--text-muted)' }}>
            /{primaryRate.unit.includes('gal') ? 'gal' : 'L'}
          </span>
        </p>
      ) : (
        <p className="text-2xl font-bold" style={{ color: 'var(--text-muted)' }}>-</p>
      )}

      {secondaryRate && (
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          {secondaryLabel}: {fmt(secondaryRate.value, secondaryRate.unit)}
        </p>
      )}

      {updatedAt && (
        <p className="text-xs mt-2 font-medium tracking-wider uppercase" style={{ color: 'var(--text-faint)' }}>
          {relativeDate(updatedAt)}
        </p>
      )}
    </Link>
  )
}
