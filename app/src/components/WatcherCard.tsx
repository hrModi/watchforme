import Link from 'next/link'
import type { WatcherDef } from '@/types'
import type { RateWithTrend } from '@/types'

interface WatcherCardProps {
  watcher: WatcherDef
  liveRate?: RateWithTrend | null
  country?: string
}

export default function WatcherCard({ watcher, liveRate, country = 'india' }: WatcherCardProps) {
  const isLive = watcher.status === 'live'

  const cardContent = (
    <div
      className="rounded-xl border p-5 h-full flex flex-col gap-3 transition-shadow"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        opacity: isLive ? 1 : 0.55,
        boxShadow: isLive ? 'var(--shadow-sm)' : 'none',
      }}
    >
      <div className="flex items-start justify-between">
        <span className="text-2xl" aria-hidden="true">{watcher.icon}</span>
        {isLive ? (
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)' }}
          >
            Live
          </span>
        ) : (
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-faint)' }}
          >
            Coming soon
          </span>
        )}
      </div>

      <div>
        <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
          {watcher.name}
        </h3>
        <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {watcher.description}
        </p>
      </div>

      {isLive && liveRate && (
        <div
          className="mt-auto pt-3 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {country === 'india' ? 'India avg. petrol' : 'US avg. gasoline'}
          </p>
          <p className="text-xl font-bold tabular mt-0.5" style={{ color: 'var(--text)' }}>
            {liveRate.unit.startsWith('₹') ? '₹' : '$'}{liveRate.value.toFixed(2)}
            <span className="text-sm font-normal ml-1" style={{ color: 'var(--text-muted)' }}>{liveRate.unit}</span>
          </p>
        </div>
      )}

      {isLive && !liveRate && (
        <div className="mt-auto pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>View all prices →</p>
        </div>
      )}
    </div>
  )

  if (!isLive) {
    return <div>{cardContent}</div>
  }

  return (
    <Link href={`/${watcher.slug}/${country}`} className="block h-full hover:no-underline group">
      {cardContent}
    </Link>
  )
}
