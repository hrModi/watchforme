import Link from 'next/link'
import { headers } from 'next/headers'
import CountrySwitcher from './CountrySwitcher'

function detectCountry(cfCountry: string | null): 'IN' | 'US' {
  return cfCountry === 'IN' ? 'IN' : 'US'
}

export default async function Header() {
  const headersList = await headers()
  const initialCountry = detectCountry(headersList.get('CF-IPCountry'))
  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5" aria-label="WatchForMe home">
          {/* Brand mark: viewfinder reticle — 4 L-shaped corner brackets + signal dot */}
          <svg
            width="30"
            height="30"
            viewBox="0 0 100 100"
            fill="none"
            aria-hidden="true"
            style={{ flexShrink: 0, color: 'var(--text)' }}
          >
            <path
              d="M15,35 L15,15 L35,15 M65,15 L85,15 L85,35 M15,65 L15,85 L35,85 M85,65 L85,85 L65,85"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="50" cy="50" r="10" fill="var(--signal-blue)" />
          </svg>

          {/* Wordmark */}
          <span
            className="font-display text-base leading-none"
            style={{ fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}
          >
            WatchForMe
            <span style={{ fontWeight: 500, color: 'var(--signal-blue)', letterSpacing: '-0.01em' }}>.me</span>
          </span>
        </Link>

        <CountrySwitcher initialCountry={initialCountry} />
      </div>
    </header>
  )
}
