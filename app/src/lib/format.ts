// Indian number format: 2,60,000 instead of 260,000
export function formatINR(value: number): string {
  const rounded = Math.round(value)
  const s = rounded.toString()
  if (s.length <= 3) return s
  const last3 = s.slice(-3)
  const rest = s.slice(0, -3)
  const groups: string[] = []
  for (let i = rest.length; i > 0; i -= 2) {
    groups.unshift(rest.slice(Math.max(0, i - 2), i))
  }
  return [...groups, last3].join(',')
}

// Use Indian format for large ₹ values; plain toFixed(2) otherwise
export function formatPrice(value: number, unit: string): string {
  if (unit.startsWith('₹') && value >= 1000) return formatINR(value)
  return value.toFixed(2)
}
