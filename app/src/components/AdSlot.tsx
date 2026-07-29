'use client'

// Placeholder ad slot component.
// Replace the inner content with your Google AdSense code once approved.
// AdSense policy requires "Advertisement" label and visual separation from content.

interface AdSlotProps {
  slot: 'A' | 'B' | 'C'
  className?: string
}

export default function AdSlot({ slot: _slot, className = '' }: AdSlotProps) {
  // Production: replace this div with <ins class="adsbygoogle" ... /> block
  // and load adsbygoogle.js in layout.tsx once AdSense is approved.
  if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_ADSENSE_CLIENT) {
    return null
  }

  return (
    <div className={`my-4 ${className}`}>
      <p
        className="text-center text-xs mb-1 tracking-wider uppercase"
        style={{ color: 'var(--text-faint)' }}
      >
        Advertisement
      </p>
      <div
        className="w-full flex items-center justify-center rounded border text-xs"
        style={{
          minHeight: 90,
          backgroundColor: 'var(--surface-2)',
          borderColor: 'var(--border)',
          color: 'var(--text-faint)',
        }}
      >
        Ad slot (AdSense unit goes here)
      </div>
    </div>
  )
}
