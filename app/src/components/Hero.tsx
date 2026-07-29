import type { RateWithTrend } from '@/types'

interface HeroProps {
  primaryRate: RateWithTrend | null
  secondaryRate: RateWithTrend | null
  locationName: string
  country: string
}

function formatValue(value: number, unit: string): string {
  return `${unit.startsWith('₹') ? '₹' : '$'}${value.toFixed(2)}`
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function TrendArrow({ trend, delta, unit }: { trend: string; delta: number; unit: string }) {
  const symbol = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'
  const label = trend === 'flat' ? 'No change' : `${symbol} ${Math.abs(delta).toFixed(2)} ${unit}`
  return (
    <span className={`text-sm font-medium trend-${trend}`} aria-label={label}>
      {symbol} {trend !== 'flat' && Math.abs(delta).toFixed(2)}
    </span>
  )
}

export default function Hero({ primaryRate, secondaryRate, locationName, country: _country }: HeroProps) {
  if (!primaryRate) {
    return (
      <div className="py-10 px-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <p className="text-secondary text-sm">Data temporarily unavailable.</p>
      </div>
    )
  }

  const primaryLabel = primaryRate.subtype.charAt(0).toUpperCase() + primaryRate.subtype.slice(1)
  const secondaryLabel = secondaryRate
    ? secondaryRate.subtype.charAt(0).toUpperCase() + secondaryRate.subtype.slice(1)
    : null

  return (
    <div
      className="px-4 sm:px-6 py-8"
      style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}
    >
      <div className="max-w-6xl mx-auto">
        <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--text-muted)' }}>
          {locationName}
        </p>

        <div className="flex flex-wrap items-end gap-6">
          {/* Primary rate */}
          <div>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-bold tabular tracking-tight" style={{ color: 'var(--text)' }}>
                {formatValue(primaryRate.value, primaryRate.unit)}
              </span>
              <span className="text-base" style={{ color: 'var(--text-muted)' }}>{primaryRate.unit}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{primaryLabel}</span>
              <TrendArrow trend={primaryRate.trend} delta={primaryRate.delta} unit={primaryRate.unit} />
            </div>
          </div>

          {/* Secondary rate (diesel) */}
          {secondaryRate && (
            <div className="border-l pl-6" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-semibold tabular" style={{ color: 'var(--text)' }}>
                  {formatValue(secondaryRate.value, secondaryRate.unit)}
                </span>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{secondaryRate.unit}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{secondaryLabel}</span>
                <TrendArrow trend={secondaryRate.trend} delta={secondaryRate.delta} unit={secondaryRate.unit} />
              </div>
            </div>
          )}
        </div>

        <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
          Last updated: {formatTimestamp(primaryRate.fetched_at)}
        </p>
      </div>
    </div>
  )
}
