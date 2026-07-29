import Link from 'next/link'
import CountrySwitcher from './CountrySwitcher'

export default function Header() {
  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight"
          style={{ color: 'var(--text)' }}
        >
          <svg width="20" height="14" viewBox="0 0 20 14" fill="none" aria-hidden="true" style={{ color: 'var(--accent)' }}>
            <path d="M1 7C3.5 3 6.5 1 10 1s6.5 2 9 6c-2.5 4-5.5 6-9 6S3.5 11 1 7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <circle cx="10" cy="7" r="2.5" fill="currentColor"/>
          </svg>
          <span>watchforme.me</span>
        </Link>

        <CountrySwitcher />
      </div>
    </header>
  )
}
