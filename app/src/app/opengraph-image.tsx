import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'WatchForMe — Never check prices again.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

async function loadFont(family: string, weight: number): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`,
      { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' } }
    ).then(r => r.text())
    const url = css.match(/src: url\(([^)]+)\) format\('woff2'\)/)?.[1]
    if (!url) return null
    return fetch(url).then(r => r.arrayBuffer())
  } catch {
    return null
  }
}

export default async function OGImage() {
  const [spaceGrotesk, inter] = await Promise.all([
    loadFont('Space Grotesk', 700),
    loadFont('Inter', 400),
  ])

  const fonts = [
    spaceGrotesk ? { name: 'Space Grotesk', data: spaceGrotesk, weight: 700 as const } : null,
    inter ? { name: 'Inter', data: inter, weight: 400 as const } : null,
  ].filter(Boolean) as { name: string; data: ArrayBuffer; weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 }[]

  // Brand colours (oklch values converted to hex for Satori compatibility)
  const INK = '#1a1d2b'       // oklch(20% 0.02 250)
  const PAPER = '#f5f4f8'     // oklch(98% 0.005 250)
  const BLUE = '#4264e6'      // oklch(58% 0.19 258)
  const MUTED = 'rgba(245,244,248,0.55)'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: INK,
          padding: '72px 80px',
          justifyContent: 'space-between',
          fontFamily: spaceGrotesk ? 'Space Grotesk' : 'system-ui, sans-serif',
        }}
      >
        {/* Logo lockup */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          {/* Viewfinder mark */}
          <svg width="48" height="48" viewBox="0 0 100 100" fill="none">
            <path
              d="M15,35 L15,15 L35,15 M65,15 L85,15 L85,35 M15,65 L15,85 L35,85 M85,65 L85,85 L65,85"
              stroke={PAPER}
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="50" cy="50" r="10" fill={BLUE} />
          </svg>
          <span style={{ fontSize: 28, fontWeight: 700, color: PAPER, letterSpacing: '-0.02em' }}>
            WatchForMe
          </span>
        </div>

        {/* Main headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 700,
              color: PAPER,
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
            }}
          >
            Never check prices again.
          </div>
          <div
            style={{
              fontSize: 26,
              color: MUTED,
              fontFamily: inter ? 'Inter' : 'system-ui, sans-serif',
              fontWeight: 400,
              letterSpacing: '-0.01em',
            }}
          >
            Free fuel price alerts for India and the US. No signup, no account.
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              backgroundColor: BLUE,
              color: '#fff',
              padding: '9px 18px',
              borderRadius: 6,
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: '-0.01em',
            }}
          >
            watchforme.me
          </div>
          <span style={{ color: MUTED, fontSize: 15 }}>
            Free forever · No signup required
          </span>
        </div>
      </div>
    ),
    { ...size, fonts }
  )
}
