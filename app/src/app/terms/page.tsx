import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { absolute: 'Terms of Service | WatchForMe' },
  description: 'Simple terms for a simple service. WatchForMe is free, informational, and built to be fair.',
  alternates: { canonical: '/terms' },
}

const sections = [
  {
    id: 'acceptance',
    title: 'Acceptance',
    body: 'By using WatchForMe, you agree to these terms. They exist to set clear expectations, not to catch you out.',
  },
  {
    id: 'availability',
    title: 'Service availability',
    body: "We work hard to make alerts reliable and timely. That said, we can't guarantee uninterrupted service, real-time delivery, or the accuracy of third-party price data. If something's off, email us. We'll look into it.",
  },
  {
    id: 'fair-use',
    title: 'Fair use',
    body: "Please don't abuse the service, automate excessive requests, or try to disrupt things for other users. We're a small team and any bad-faith usage affects real people.",
  },
  {
    id: 'disclaimer',
    title: 'Disclaimer',
    body: 'WatchForMe provides informational alerts only. Nothing here is financial, investment, or legal advice. Prices shown are for reference. Always verify before making a decision.',
  },
  {
    id: 'changes',
    title: 'Changes',
    body: "We may update these terms or modify the service from time to time. When we do, we'll update the date at the top of this page. Continued use means you're okay with any changes.",
  },
]

export default function TermsPage() {
  return (
    <div>
      {/* Header */}
      <section style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16 sm:py-20">
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              marginBottom: 16,
            }}
          >
            Legal
          </p>
          <h1
            className="font-display"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
              color: 'var(--text)',
              marginBottom: 16,
            }}
          >
            Terms of Service
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-faint)' }}>Last Updated: August 2026</p>
          <p
            style={{
              fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)',
              color: 'var(--text-muted)',
              maxWidth: '58ch',
              marginTop: 20,
              lineHeight: 1.75,
            }}
          >
            Short and plain. WatchForMe is a free service built to help people. These
            terms reflect that.
          </p>
        </div>
      </section>

      {/* Two-column body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr)',
            gap: 48,
          }}
          className="lg:grid-two-col-sidebar"
        >
          {/* Sticky sidebar nav */}
          <aside
            className="hidden lg:block"
            style={{ gridColumn: 'span 1', position: 'sticky', top: 24, alignSelf: 'start' }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-faint)',
                marginBottom: 12,
              }}
            >
              On this page
            </p>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {sections.map(s => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="sidebar-link"
                >
                  {s.title}
                </a>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0 }}>
            {sections.map((s, i) => (
              <div
                key={s.id}
                id={s.id}
                style={{
                  padding: '32px 0',
                  borderBottom: i < sections.length - 1 ? '1px solid var(--border)' : 'none',
                  scrollMarginTop: 32,
                }}
              >
                <h2
                  className="font-display"
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: 'var(--text)',
                    marginBottom: 10,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {s.title}
                </h2>
                <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--text-muted)' }}>
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Page footer note */}
      <div
        style={{ borderTop: '1px solid var(--border)' }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10"
      >
        <p style={{ fontSize: 13, color: 'var(--text-faint)' }}>Built with ❤️ to save you time.</p>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .lg\\:grid-two-col-sidebar {
            grid-template-columns: 200px 1fr !important;
          }
        }
        .sidebar-link {
          font-size: 13px;
          color: var(--text-muted);
          text-decoration: none;
          padding: 5px 10px;
          border-radius: 6px;
          display: block;
          transition: color 0.15s;
        }
        .sidebar-link:hover { color: var(--accent); }
      `}</style>
    </div>
  )
}
