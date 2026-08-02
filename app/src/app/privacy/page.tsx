import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { absolute: 'Privacy Policy | WatchForMe' },
  description: 'WatchForMe is built with privacy in mind. We collect only what we need to send your alert. Nothing more.',
  alternates: { canonical: '/privacy' },
}

const sections = [
  {
    id: 'collect',
    title: 'What we collect',
    body: "Depending on the watcher you set up, we may collect your email address, an optional WhatsApp number, and your alert preferences. That's it. No account creation required.",
  },
  {
    id: 'dont-collect',
    title: "What we don't collect",
    body: "We don't collect passwords, payment information, government IDs, or anything we don't need. If a piece of data doesn't help us send your alert, we don't ask for it.",
  },
  {
    id: 'use',
    title: 'How we use your data',
    body: "Only to send you the alert you asked for. We don't send newsletters, promotional emails, or anything you didn't explicitly sign up for.",
  },
  {
    id: 'cookies',
    title: 'Cookies',
    body: 'We use cookies for analytics (Google Analytics), website performance, and advertising (Google Ad Manager). Third-party providers such as Google may also set cookies. We use a session cookie to remember your country preference.',
  },
  {
    id: 'retention',
    title: 'Data retention',
    body: 'Alert data is kept only as long as needed to deliver your notifications. Once you cancel an alert, we remove the associated data.',
  },
  {
    id: 'sharing',
    title: 'Who we share with',
    body: "Nobody. Your data isn't sold, rented, or shared with third parties beyond what's needed to operate the service (hosting infrastructure).",
  },
  {
    id: 'deletion',
    title: 'Deleting your data',
    body: "Email us at support@watchforme.me and we'll remove your data within 48 hours, no questions asked.",
  },
  {
    id: 'contact',
    title: 'Questions',
    body: "Reach us any time at support@watchforme.me. We're a small team and we actually read every email.",
  },
]

export default function PrivacyPage() {
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
            Privacy Policy
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
            We built WatchForMe to be genuinely useful, not to harvest your data. Here's
            exactly what we collect, why, and how we use it.
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
          {/* Sticky sidebar nav - hidden on small screens */}
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
