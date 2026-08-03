'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const COUNTRIES = [
  { code: 'IN', label: 'India', flag: '🇮🇳', live: true },
  { code: 'US', label: 'United States', flag: '🇺🇸', live: true },
]

function readCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? match[1] : undefined
}

function getEquivalentPath(currentPath: string, targetCountry: string): string {
  const countrySlug = targetCountry === 'IN' ? 'india' : 'us'
  const match = currentPath.match(/^(\/[^/]+)\/[^/]+/)
  if (match) return `${match[1]}/${countrySlug}`
  return currentPath
}

export default function CountrySwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState<'IN' | 'US' | null>(null)

  useEffect(() => {
    // Sub-pages: always reflect the country the page belongs to — no saving
    if (/\/india(\/|$)/.test(pathname)) {
      setCurrent('IN')
      return
    }
    if (/\/us(\/|$)/.test(pathname)) {
      setCurrent('US')
      return
    }

    // Homepage / neutral pages: explicit user preference → IP-detected → default US
    const pref = readCookie('country_pref')
    const auto = readCookie('country_auto')
    const detected = pref || auto
    setCurrent(detected === 'IN' ? 'IN' : 'US')
  }, [pathname])

  function handleSelect(code: 'IN' | 'US') {
    setOpen(false)
    if (code === current) return
    // Save as explicit user preference — persists across visits
    document.cookie = `country_pref=${code}; path=/; max-age=31536000; SameSite=Lax`
    setCurrent(code)
    router.push(getEquivalentPath(pathname, code))
  }

  // Render nothing until cookie is read to avoid flicker between default and actual country
  if (current === null) return <div className="w-[88px] h-[34px]" />

  const active = COUNTRIES.find(c => c.code === current) ?? COUNTRIES[0]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md border transition-colors"
        style={{
          borderColor: 'var(--border)',
          color: 'var(--text-muted)',
          backgroundColor: 'var(--surface-2)',
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{active.flag}</span>
        <span className="hidden sm:inline">{active.label}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden="true" />
          <ul
            role="listbox"
            className="absolute right-0 mt-1 z-20 min-w-[180px] rounded-md border shadow-lg overflow-hidden"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            {COUNTRIES.map(country => (
              <li
                key={country.code}
                role="option"
                aria-selected={country.code === current}
                onClick={() => handleSelect(country.code as 'IN' | 'US')}
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm cursor-pointer transition-colors"
                style={{
                  backgroundColor: country.code === current ? 'var(--accent-subtle)' : undefined,
                  color: country.code === current ? 'var(--accent)' : 'var(--text)',
                }}
                onMouseEnter={e => {
                  if (country.code !== current) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-2)'
                }}
                onMouseLeave={e => {
                  if (country.code !== current) (e.currentTarget as HTMLElement).style.backgroundColor = ''
                }}
              >
                <span>{country.flag}</span>
                <span>{country.label}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
