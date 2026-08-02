'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export interface SearchItem {
  name: string
  slug: string
  state?: string
}

interface FuelSearchProps {
  items: SearchItem[]
  basePath: string
  fuelTypes: string[]
  popularItems: Array<{ name: string; slug: string }>
}

export default function FuelSearch({ items, basePath, fuelTypes, popularItems }: FuelSearchProps) {
  const router = useRouter()
  const hasStates = items.some(i => i.state !== undefined)

  const allStates = useMemo(() => {
    if (!hasStates) return []
    const seen = new Set<string>()
    const states: string[] = []
    for (const item of items) {
      if (item.state && !seen.has(item.state)) {
        seen.add(item.state)
        states.push(item.state)
      }
    }
    return states.sort()
  }, [items, hasStates])

  const [selectedState, setSelectedState] = useState('')
  const [query, setQuery] = useState('')
  const [selectedSlug, setSelectedSlug] = useState('')
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const suggestions = useMemo(() => {
    if (!query) return []
    let list = items
    if (selectedState) list = list.filter(i => i.state === selectedState)
    return list
      .filter(i => i.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 8)
  }, [items, selectedState, query])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function selectItem(item: SearchItem) {
    setQuery(item.name)
    setSelectedSlug(item.slug)
    setOpen(false)
  }

  function handleCheckPrice() {
    if (selectedSlug) router.push(`${basePath}/${selectedSlug}`)
  }

  const inputBorder = { border: '1px solid var(--border)' }

  return (
    <div>
      <div
        className="flex flex-wrap gap-3 items-end rounded-xl p-3 sm:p-4"
        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {/* State filter (India only) */}
        {hasStates && (
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <label className="text-xs font-semibold tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
              State
            </label>
            <select
              value={selectedState}
              onChange={e => { setSelectedState(e.target.value); setQuery(''); setSelectedSlug('') }}
              className="text-sm rounded-lg px-3 py-2.5 w-full sm:min-w-[160px] sm:w-auto"
              style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text)', ...inputBorder }}
            >
              <option value="">All states</option>
              {allStates.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}

        {/* City / state text input */}
        <div className="flex flex-col gap-1 flex-1 min-w-[160px] w-full sm:w-auto" ref={wrapperRef} style={{ position: 'relative' }}>
          <label className="text-xs font-semibold tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
            {hasStates ? 'City' : 'State'}
          </label>
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedSlug(''); setOpen(true) }}
            onFocus={() => query && setOpen(true)}
            placeholder={hasStates ? 'e.g. Mumbai' : 'e.g. California'}
            className="text-sm rounded-lg px-3 py-2.5"
            style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text)', ...inputBorder }}
            autoComplete="off"
          />
          {open && suggestions.length > 0 && (
            <ul
              role="listbox"
              style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                right: 0,
                zIndex: 50,
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                maxHeight: '200px',
                overflowY: 'auto',
              }}
            >
              {suggestions.map(item => (
                <li key={item.slug}>
                  <button
                    type="button"
                    onClick={() => selectItem(item)}
                    className="w-full text-left text-sm px-3 py-2.5"
                    style={{ color: 'var(--text)' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-2)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {item.name}
                    {item.state && (
                      <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>{item.state}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Check Price button */}
        <button
          type="button"
          onClick={handleCheckPrice}
          disabled={!selectedSlug}
          className="text-sm font-semibold px-5 py-2.5 rounded-lg transition-opacity disabled:opacity-40 w-full sm:w-auto"
          style={{ backgroundColor: 'var(--accent)', color: '#fff', whiteSpace: 'nowrap' }}
        >
          Check Price →
        </button>
      </div>

      {/* Popular quick links */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3">
        <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
          Popular:
        </span>
        {popularItems.map(p => (
          <Link
            key={p.slug}
            href={`${basePath}/${p.slug}`}
            className="text-sm font-medium hover:underline"
            style={{ color: 'var(--accent)' }}
          >
            {p.name}
          </Link>
        ))}
      </div>
    </div>
  )
}
