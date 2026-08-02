import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { absolute: 'About | WatchForMe' },
  description: 'WatchForMe watches prices so you never have to. Free, no signup, built for India and the US.',
}

const features = [
  {
    label: 'Free Forever',
    desc: 'No subscriptions, no paywalls, no catch. WatchForMe is free to use.',
  },
  {
    label: 'No Signup Required',
    desc: 'Just an email address. No account, no password, no friction.',
  },
  {
    label: 'Privacy Friendly',
    desc: 'We collect only what we need to send your alert. Nothing more.',
  },
  {
    label: 'Email & WhatsApp',
    desc: 'Get notified the way you actually check things.',
  },
  {
    label: 'Built for India & the US',
    desc: 'Prices, units, and coverage tailored to where you are.',
  },
]

const coming = [
  'Gold & Silver Rates',
  'Stock Price Alerts',
  'Currency Exchange',
  'Train PNR Status',
  'Flight Prices',
  'Fixed Deposit Rates',
  'Loan Rates',
]

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-20 sm:py-28">
          <p
            className="font-display"
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              marginBottom: 20,
            }}
          >
            About WatchForMe
          </p>
          <h1
            className="font-display"
            style={{
              fontSize: 'clamp(2.75rem, 7vw, 5.5rem)',
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              color: 'var(--text)',
              maxWidth: '18ch',
            }}
          >
            Never check prices again.
          </h1>
          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: 'var(--text-muted)',
              maxWidth: '54ch',
              marginTop: 24,
              lineHeight: 1.75,
            }}
          >
            WatchForMe helps you track things that matter: fuel prices, gold rates, stock
            prices, train waitlists. No refreshing required.
          </p>
        </div>
      </section>

      {/* Mission + Vision */}
      <section style={{ borderBottom: '1px solid var(--border)' }}>
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1px',
          }}
        >
          {[
            {
              eyebrow: 'Our Mission',
              body: "Simply set an alert and we'll notify you when your condition is met. No apps to install, no dashboards to check. We do the watching. You get the result.",
            },
            {
              eyebrow: 'Our Vision',
              body: 'Save your time by watching things for you. Instead of checking websites every day, let WatchForMe do it. Spend that time on things that actually need your attention.',
            },
          ].map(({ eyebrow, body }) => (
            <div
              key={eyebrow}
              style={{
                padding: '40px 0',
                paddingRight: 32,
              }}
            >
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
                {eyebrow}
              </p>
              <p
                style={{
                  fontSize: 'clamp(1rem, 1.5vw, 1.125rem)',
                  lineHeight: 1.75,
                  color: 'var(--text-muted)',
                }}
              >
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* What makes us different */}
      <section style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16">
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              marginBottom: 32,
            }}
          >
            What Makes Us Different
          </p>
          {/* Border-grid: 1px gaps via background color trick */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1px',
              backgroundColor: 'var(--border)',
              border: '1px solid var(--border)',
            }}
          >
            {features.map(({ label, desc }) => (
              <div
                key={label}
                style={{
                  backgroundColor: 'var(--bg)',
                  padding: '28px 24px',
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    backgroundColor: 'var(--accent-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                    <path
                      d="M2 6.5L5.2 10L11 3"
                      stroke="var(--accent)"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p
                  className="font-display"
                  style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}
                >
                  {label}
                </p>
                <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--text-muted)' }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's coming next */}
      <section style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16">
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
            What's Coming Next
          </p>
          <p
            style={{
              fontSize: 'clamp(1rem, 1.5vw, 1.125rem)',
              color: 'var(--text-muted)',
              maxWidth: '56ch',
              lineHeight: 1.75,
              marginBottom: 28,
            }}
          >
            We're continuously adding new watchers. Here's what's on the roadmap.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {coming.map(label => (
              <span
                key={label}
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  padding: '6px 14px',
                  border: '1px solid var(--border)',
                  borderRadius: 100,
                  color: 'var(--text-muted)',
                  backgroundColor: 'var(--surface)',
                }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Page footer note */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-10">
        <p style={{ fontSize: 13, color: 'var(--text-faint)' }}>Built with ❤️ to save you time.</p>
      </div>
    </div>
  )
}
