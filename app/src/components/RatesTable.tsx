import Link from 'next/link'
import type { RegionRate } from '@/types'

interface RatesTableProps {
  regions: RegionRate[]
  basePath: string           // e.g. '/fuel-price/india'
  primarySubtype: string     // 'petrol' | 'gasoline'
  secondarySubtype: string   // 'diesel'
  regionLabel: string        // 'City' | 'State'
}

function formatValue(value: number, unit: string) {
  const symbol = unit.startsWith('₹') ? '₹' : '$'
  return `${symbol}${value.toFixed(2)}`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export default function RatesTable({
  regions,
  basePath,
  primarySubtype,
  secondarySubtype,
  regionLabel,
}: RatesTableProps) {
  if (regions.length === 0) {
    return (
      <div
        className="text-center py-12 text-sm rounded-lg border"
        style={{ color: 'var(--text-faint)', borderColor: 'var(--border)' }}
      >
        No regional data available yet.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border" style={{ borderColor: 'var(--border)' }}>
      <table className="w-full text-sm" aria-label="Fuel prices by region">
        <thead>
          <tr style={{ backgroundColor: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
            <th className="text-left px-4 py-3 text-xs font-semibold tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
              {regionLabel}
            </th>
            <th className="text-right px-4 py-3 text-xs font-semibold tracking-wider uppercase tabular" style={{ color: 'var(--text-muted)' }}>
              {primarySubtype.charAt(0).toUpperCase() + primarySubtype.slice(1)}
            </th>
            <th className="text-right px-4 py-3 text-xs font-semibold tracking-wider uppercase tabular" style={{ color: 'var(--text-muted)' }}>
              Diesel
            </th>
            <th className="text-right px-4 py-3 text-xs font-semibold tracking-wider uppercase hidden sm:table-cell" style={{ color: 'var(--text-muted)' }}>
              Updated
            </th>
          </tr>
        </thead>
        <tbody>
          {regions.map((region, i) => {
            const primary = region.rates.find(r => r.subtype === primarySubtype)
            const secondary = region.rates.find(r => r.subtype === secondarySubtype)
            const updatedAt = primary?.fetched_at ?? secondary?.fetched_at

            return (
              <tr
                key={region.region}
                style={{
                  backgroundColor: i % 2 === 1 ? 'var(--surface-2)' : 'var(--surface)',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <td className="px-4 py-3">
                  <Link
                    href={`${basePath}/${region.region}`}
                    className="font-medium hover:underline"
                    style={{ color: 'var(--accent)' }}
                  >
                    {region.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-right tabular" style={{ color: 'var(--text)' }}>
                  {primary ? formatValue(primary.value, primary.unit) : '-'}
                </td>
                <td className="px-4 py-3 text-right tabular" style={{ color: 'var(--text)' }}>
                  {secondary ? formatValue(secondary.value, secondary.unit) : '-'}
                </td>
                <td className="px-4 py-3 text-right hidden sm:table-cell" style={{ color: 'var(--text-muted)' }}>
                  {updatedAt ? formatDate(updatedAt) : '-'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
