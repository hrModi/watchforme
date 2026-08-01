import Link from 'next/link'
import CountrySwitcher from './CountrySwitcher'

export default function Header() {
  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5" aria-label="watchforme.me home">
          {/* Icon badge */}
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
            <rect width="28" height="28" rx="7" fill="#1B59D8"/>
            {/* Eye white */}
            <path d="M5 14c2.4-3.8 5.2-5.8 9-5.8s6.6 2 9 5.8c-2.4 3.8-5.2 5.8-9 5.8S7.4 17.8 5 14z" fill="white"/>
            {/* Iris */}
            <circle cx="14" cy="14" r="3.2" fill="#1B59D8"/>
            {/* Pupil shine */}
            <circle cx="14" cy="14" r="1.4" fill="white"/>
          </svg>

          {/* Wordmark */}
          <span
            className="text-base leading-none"
            style={{ fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.03em' }}
          >
            watchforme
            <span style={{ fontWeight: 500, color: 'var(--accent)', letterSpacing: '-0.01em' }}>.me</span>
          </span>
        </Link>

        <CountrySwitcher />
      </div>
    </header>
  )
}
