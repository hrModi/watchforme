import Link from 'next/link'
import type { WatcherDef } from '@/types'

interface WatcherCardProps {
  watcher: WatcherDef
  country?: string
}

export default function WatcherCard({ watcher, country = 'india' }: WatcherCardProps) {
  const isLive = watcher.status === 'live'

  return (
    <div
      className="rounded-xl border p-5 flex flex-col gap-3"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Header row: icon + badges */}
      <div className="flex items-start justify-between">
        <span className="text-2xl" aria-hidden="true">{watcher.icon}</span>
        <div className="flex gap-1.5">
          {isLive && (
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)' }}
            >
              Live
            </span>
          )}
          {!isLive && (
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-faint)', border: '1px solid var(--border)' }}
            >
              Coming Soon
            </span>
          )}
        </div>
      </div>

      {/* Name + description */}
      <div className="flex-1">
        <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
          {watcher.name}
        </h3>
        <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {watcher.description}
        </p>
      </div>

      {/* CTA */}
      {isLive ? (
        <Link
          href={`/${watcher.slug}/${country}`}
          className="mt-1 inline-flex items-center justify-center text-xs font-semibold px-4 py-2 rounded-lg transition-opacity hover:opacity-80"
          style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
        >
          Start Watching
        </Link>
      ) : (
        <Link
          href={`/${watcher.slug}`}
          className="mt-1 inline-flex items-center justify-center text-xs font-medium px-4 py-2 rounded-lg transition-opacity hover:opacity-80"
          style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
        >
          Join Waitlist
        </Link>
      )}
    </div>
  )
}
