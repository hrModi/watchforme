import { formatPrice } from '@/lib/format'

interface DataPoint {
  value: number
  fetched_at: string
}

interface PriceHistoryTableProps {
  history: DataPoint[]
  unit: string
  label: string
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getUTCDate()} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getUTCMonth()]}`
}

export default function PriceHistoryTable({ history, unit, label }: PriceHistoryTableProps) {
  if (history.length === 0) return null

  const sym = unit.startsWith('₹') ? '₹' : '$'
  // Show most recent first, max 30 rows
  const rows = [...history].reverse().slice(0, 30)

  return (
    <section aria-labelledby="history-heading">
      <h2 id="history-heading" className="text-base font-semibold mb-3" style={{ color: 'var(--text)' }}>
        {label} Price History (Last 30 Days)
      </h2>
      <div className="overflow-x-auto rounded-lg border" style={{ borderColor: 'var(--border)' }}>
        <table className="w-full text-sm" aria-label={`${label} price history`}>
          <thead>
            <tr style={{ backgroundColor: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
              <th className="text-left px-4 py-2.5 text-xs font-semibold tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
                Date
              </th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold tracking-wider uppercase tabular" style={{ color: 'var(--text-muted)' }}>
                Price ({unit})
              </th>
              <th className="text-right px-4 py-2.5 text-xs font-semibold tracking-wider uppercase tabular" style={{ color: 'var(--text-muted)' }}>
                Change
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const prev = rows[i + 1]
              const delta = prev ? row.value - prev.value : null
              const isUp = delta !== null && delta > 0.001
              const isDown = delta !== null && delta < -0.001

              return (
                <tr
                  key={row.fetched_at}
                  style={{
                    backgroundColor: i % 2 === 1 ? 'var(--surface-2)' : 'var(--surface)',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <td className="px-4 py-2.5" style={{ color: 'var(--text-muted)' }}>
                    {formatDate(row.fetched_at)}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular font-medium" style={{ color: 'var(--text)' }}>
                    {sym}{formatPrice(row.value, unit)}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular text-xs font-medium"
                    style={{ color: isUp ? '#dc2626' : isDown ? '#16a34a' : 'var(--text-faint)' }}
                  >
                    {delta === null ? '—' : isUp ? `↑ ${formatPrice(delta, unit)}` : isDown ? `↓ ${formatPrice(Math.abs(delta), unit)}` : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
