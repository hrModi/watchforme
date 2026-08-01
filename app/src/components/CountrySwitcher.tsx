'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const COUNTRIES = [
  { code: 'IN', label: 'India', flag: '🇮🇳', live: true },
  { code: 'US', label: 'United States', flag: '🇺🇸', live: true },
]

const STORAGE_KEY = 'watcher_country'

function getEquivalentPath(currentPath: string, targetCountry: string): string {
  // /fuel-price/india/mumbai → /fuel-price/us (no city-level match cross-country)
  // /fuel-price/india → /fuel-price/us
  // / → /
  const countrySlug = targetCountry === 'IN' ? 'india' : 'us'
  const match = currentPath.match(/^(\/[^/]+)\/[^/]+/)

  if (match) {
    // Has a watcher prefix — navigate to country root
    return `${match[1]}/${countrySlug}`
  }
  return currentPath
}

export default function CountrySwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState<string>('IN')

  useEffect(() => {
    // Sync switcher to whatever country the current page is actually showing
    if (/\/india(\/|$)/.test(pathname)) {
      setCurrent('IN')
      localStorage.setItem(STORAGE_KEY, 'IN')
    } else if (/\/us(\/|$)/.test(pathname)) {
      setCurrent('US')
      localStorage.setItem(STORAGE_KEY, 'US')
    } else {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setCurrent(stored)
    }
  }, [pathname])

  function handleSelect(code: string) {
    setOpen(false)
    if (code === current) return
    localStorage.setItem(STORAGE_KEY, code)
    setCurrent(code)
    router.push(getEquivalentPath(pathname, code))
  }

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
                onClick={() => handleSelect(country.code)}
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
                {!country.live && (
                  <span className="ml-auto text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-faint)' }}>
                    Soon
                  </span>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
