interface DataPoint {
  value: number
  fetched_at: string
}

interface MarketInsightProps {
  history: DataPoint[]    // single fuel's history
  unit: string
  label: string
}

function fmt(value: number, unit: string) {
  const sym = unit.startsWith('₹') ? '₹' : '$'
  return `${sym}${value.toFixed(2)}`
}

function getPreviousPrice(history: DataPoint[]): number | null {
  if (history.length < 2) return null
  const latestDay = history[history.length - 1].fetched_at.slice(0, 10)
  for (let i = history.length - 2; i >= 0; i--) {
    if (history[i].fetched_at.slice(0, 10) !== latestDay) return history[i].value
  }
  return null
}

export default function MarketInsight({ history, unit, label }: MarketInsightProps) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <p className="text-xs font-semibold tracking-wider uppercase mb-3" style={{ color: 'var(--text-muted)' }}>
        {label} Market Data
      </p>

      {history.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Data unavailable.</p>
      ) : history.length === 1 ? (
        <>
          <div>
            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>Today</p>
            <p className="font-display text-2xl font-bold tabular" style={{ color: 'var(--text)' }}>
              {fmt(history[0].value, unit)}
            </p>
          </div>
          <p className="text-xs mt-3" style={{ color: 'var(--text-faint)' }}>
            Historical high/low will appear as prices are tracked daily.
          </p>
        </>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <Stat label="Today" value={fmt(history[history.length - 1].value, unit)} />
          {getPreviousPrice(history) !== null && (
            <Stat label="Previous" value={fmt(getPreviousPrice(history)!, unit)} />
          )}
          <Stat label="30-Day High" value={fmt(Math.max(...history.map(d => d.value)), unit)} highlight />
          <Stat label="30-Day Low" value={fmt(Math.min(...history.map(d => d.value)), unit)} highlight />
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{label}</p>
      <p className="font-display text-base font-bold tabular" style={{ color: highlight ? 'var(--accent)' : 'var(--text)' }}>
        {value}
      </p>
    </div>
  )
}
