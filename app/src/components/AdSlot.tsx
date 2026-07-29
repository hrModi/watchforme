'use client'

// Google Ad Manager slot. GAM collapses the div automatically when no ad fills.
// Replace the data-ad-slot value with your actual GAM slot ID per slot.
// Include the GPT script in layout.tsx once GAM account is set up.

interface AdSlotProps {
  slot: 'A' | 'B' | 'C'
  className?: string
}

// GAM ad unit paths — update with your network ID and ad unit names
const AD_UNITS: Record<string, string> = {
  A: '/your-network-id/watchforme-leaderboard',
  B: '/your-network-id/watchforme-incontent',
  C: '/your-network-id/watchforme-footer',
}

const DIV_IDS: Record<string, string> = {
  A: 'div-gpt-ad-slot-a',
  B: 'div-gpt-ad-slot-b',
  C: 'div-gpt-ad-slot-c',
}

export default function AdSlot({ slot, className = '' }: AdSlotProps) {
  // The div renders but takes zero space until GAM fills it.
  // GAM's collapseEmptyDivs() handles collapsing when no ad is served.
  return (
    <div className={className} aria-hidden="true">
      <div
        id={DIV_IDS[slot]}
        data-ad-unit={AD_UNITS[slot]}
        style={{ minWidth: 0, minHeight: 0 }}
      />
    </div>
  )
}
