import Link from 'next/link'
import type { WatcherDef } from '@/types'

interface WatcherCardProps {
  watcher: WatcherDef
  country?: string
}

export default function WatcherCard({ watcher, country = 'india' }: WatcherCardProps) {
  const isLive = watcher.status === 'live'

  const cardContent = (
    <div
      className="rounded-xl border p-5 h-full flex flex-col gap-3 transition-shadow"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="flex items-start justify-between">
        <span className="text-2xl" aria-hidden="true">{watcher.icon}</span>
        {isLive && (
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)' }}
          >
            Live
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
    </div>
  )

  if (!isLive) {
    return (
      <Link href={`/coming-soon/${watcher.slug}`} className="block h-full hover:no-underline">
        {cardContent}
      </Link>
    )
  }

  return (
    <Link href={`/${watcher.slug}/${country}`} className="block h-full hover:no-underline group">
      {cardContent}
    </Link>
  )
}
