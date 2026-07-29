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
          <span className="text-base">⛽</span>
          <span>watchforme.me</span>
        </Link>

        <CountrySwitcher />
      </div>
    </header>
  )
}
