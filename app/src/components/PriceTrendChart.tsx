'use client'

interface DataPoint {
  value: number
  fetched_at: string
}

interface PriceTrendChartProps {
  history: DataPoint[]    // single fuel's history
  unit: string
  label: string
}

const W = 600
const H = 180
const PAD = { top: 16, right: 16, bottom: 40, left: 56 }
const innerW = W - PAD.left - PAD.right
const innerH = H - PAD.top - PAD.bottom

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export default function PriceTrendChart({ history, unit, label }: PriceTrendChartProps) {
  if (history.length < 2) {
    return (
      <section>
        <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>
          30-Day Price Trend
        </h2>
        <div
          className="rounded-xl border px-6 py-10 text-center text-sm"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)', color: 'var(--text-muted)' }}
        >
          {history.length === 1 ? (
            <>
              <p className="font-medium" style={{ color: 'var(--text)' }}>
                {unit.startsWith('₹') ? '₹' : '$'}{history[0].value.toFixed(2)} today
              </p>
              <p className="mt-1 text-xs">Trend chart will appear as data accumulates daily.</p>
            </>
          ) : (
            <p>Trend chart will appear as data accumulates over the coming days.</p>
          )}
        </div>
      </section>
    )
  }

  const dates = Array.from(new Set(history.map(d => d.fetched_at.slice(0, 10)))).sort()
  const values = history.map(d => d.value)
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)
  const valRange = maxVal - minVal || 1
  const yMin = minVal - valRange * 0.15
  const yMax = maxVal + valRange * 0.15

  function xAt(dateStr: string) {
    const idx = dates.indexOf(dateStr.slice(0, 10))
    if (dates.length === 1) return PAD.left + innerW / 2
    return PAD.left + (idx / (dates.length - 1)) * innerW
  }

  function yAt(value: number) {
    return PAD.top + innerH - ((value - yMin) / (yMax - yMin)) * innerH
  }

  const yTicks = Array.from({ length: 4 }, (_, i) => yMin + (valRange / 3) * i + valRange * 0.15)

  const maxXLabels = Math.min(6, dates.length)
  const xLabelIdxs = Array.from(new Set(
    Array.from({ length: maxXLabels }, (_, i) =>
      maxXLabels === 1 ? 0 : Math.round(i * (dates.length - 1) / (maxXLabels - 1))
    )
  ))

  const sym = unit.startsWith('₹') ? '₹' : '$'
  const polylinePoints = history.map(d => `${xAt(d.fetched_at).toFixed(1)},${yAt(d.value).toFixed(1)}`).join(' ')
  const areaPoints = [
    ...history.map(d => `${xAt(d.fetched_at).toFixed(1)},${yAt(d.value).toFixed(1)}`),
    `${xAt(history[history.length - 1].fetched_at).toFixed(1)},${(PAD.top + innerH).toFixed(1)}`,
    `${xAt(history[0].fetched_at).toFixed(1)},${(PAD.top + innerH).toFixed(1)}`,
  ].join(' ')

  const last = history[history.length - 1]

  return (
    <section>
      <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>
        {label} 30-Day Trend
      </h2>

      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}
      >
        <div style={{ overflowX: 'auto' }}>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            style={{ minWidth: '280px', display: 'block' }}
            aria-label={`${label} price trend chart`}
          >
            {/* Grid lines + Y labels */}
            {yTicks.map((tick, i) => {
              const y = yAt(tick)
              return (
                <g key={i}>
                  <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="var(--border)" strokeWidth="0.5" />
                  <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="10" fill="var(--text-faint)">
                    {sym}{tick.toFixed(0)}
                  </text>
                </g>
              )
            })}

            {/* X-axis labels */}
            {xLabelIdxs.map(idx => {
              const dateStr = dates[idx]
              return (
                <text key={dateStr} x={xAt(dateStr)} y={H - PAD.bottom + 14} textAnchor="middle" fontSize="10" fill="var(--text-faint)">
                  {shortDate(dateStr)}
                </text>
              )
            })}

            {/* Area fill */}
            <polygon points={areaPoints} fill="var(--accent)" fillOpacity="0.08" />

            {/* Line */}
            <polyline points={polylinePoints} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" />

            {/* Latest dot */}
            <circle cx={xAt(last.fetched_at)} cy={yAt(last.value)} r="3.5" fill="var(--accent)" />
          </svg>
        </div>
      </div>
    </section>
  )
}
