import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { absolute: 'Contact | WatchForMe' },
  description: "Have feedback, found a bug, or have an idea for a new watcher? We'd love to hear from you.",
  alternates: { canonical: '/contact' },
}

export default function ContactPage() {
  return (
    <div>
      {/* Hero */}
      <section style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16 sm:py-24">
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
            Contact
          </p>
          <h1
            className="font-display"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 700,
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
              color: 'var(--text)',
              marginBottom: 20,
            }}
          >
            We'd love to hear from you.
          </h1>
          <p
            style={{
              fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)',
              color: 'var(--text-muted)',
              maxWidth: '52ch',
              lineHeight: 1.75,
              marginBottom: 32,
            }}
          >
            Whether you've found a bug, have an idea for a new watcher, or just want to say hi,
            drop us an email. We're a small team and we read everything.
          </p>
          <a
            href="mailto:support@watchforme.me"
            className="email-cta"
          >
            support@watchforme.me
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M2.5 7h9M7.5 3l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </section>

      {/* Cards */}
      <section style={{ borderBottom: '1px solid var(--border)' }}>
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1px',
            backgroundColor: 'var(--border)',
            border: '1px solid var(--border)',
          }}
        >
          {[
            {
              icon: (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <path d="M9 2v7l4 2" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="9" cy="9" r="7" stroke="var(--accent)" strokeWidth="1.5" />
                </svg>
              ),
              title: 'Feature Requests',
              body: "Tell us what you'd like to monitor and why it would be useful. The best watchers we've built came directly from user suggestions.",
            },
            {
              icon: (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  <circle cx="9" cy="9" r="7" stroke="var(--accent)" strokeWidth="1.5" />
                  <path d="M9 6v4M9 12.5v.5" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ),
              title: 'Bug Reports',
              body: 'Please include your device, browser, steps to reproduce, and screenshots if possible. The more detail, the faster we can fix it.',
            },
          ].map(({ icon, title, body }) => (
            <div key={title} style={{ backgroundColor: 'var(--bg)', padding: '32px 28px' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  backgroundColor: 'var(--accent-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                }}
              >
                {icon}
              </div>
              <h2
                className="font-display"
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  color: 'var(--text)',
                  marginBottom: 10,
                  letterSpacing: '-0.01em',
                }}
              >
                {title}
              </h2>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-muted)' }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Closing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12">
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.75,
            color: 'var(--text-muted)',
            maxWidth: '60ch',
            marginBottom: 24,
          }}
        >
          WatchForMe is independently built and maintained. Every piece of feedback helps us
          make it better for everyone.
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-faint)' }}>Built with ❤️ to save you time.</p>
      </div>

      <style>{`
        .email-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background-color: var(--accent);
          color: #fff;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          letter-spacing: -0.01em;
          transition: opacity 0.15s;
        }
        .email-cta:hover { opacity: 0.85; }
      `}</style>
    </div>
  )
}
