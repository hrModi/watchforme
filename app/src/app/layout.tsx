import type { Metadata } from 'next'
import { Space_Grotesk, Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import GoogleAnalytics from '@/components/GoogleAnalytics'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'WatchForMe.me | Free Price & Rate Watchers',
    template: '%s | WatchForMe.me',
  },
  description: 'Free fuel price alerts for India and the US. No signup, no account. Just enter your email or WhatsApp and get notified when prices move.',
  keywords: ['fuel price', 'petrol price', 'diesel price', 'gas price', 'price alert', 'India fuel price', 'US gas price'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://watchforme.me'),
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'watchforme.me',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const year = new Date().getFullYear()

  return (
    <html lang="en" className={`h-full ${spaceGrotesk.variable} ${inter.variable}`}>
      <body className="bg-page min-h-full flex flex-col antialiased">
        <GoogleAnalytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'WatchForMe',
              url: 'https://watchforme.me',
              logo: 'https://watchforme.me/icon.svg',
              description: 'Free price alert service for fuel, gold, currency, and more. No signup required.',
              email: 'support@watchforme.me',
              foundingDate: '2024',
            }),
          }}
        />
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <footer
          className="border-t py-6 text-xs"
          style={{ borderColor: 'var(--border)', color: 'var(--text-faint)' }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-wrap items-center gap-x-3 gap-y-1 justify-between">
            <span>
              <span className="font-display" style={{ fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-muted)' }}>
                WatchForMe<span style={{ color: 'var(--signal-blue)', fontWeight: 500 }}>.me</span>
              </span>
              <span style={{ margin: '0 6px', opacity: 0.35 }}>·</span>
              <span>&copy; {year} watchforme.me</span>
              <span style={{ margin: '0 6px', opacity: 0.35 }}>·</span>
              <span>Free forever · No signup required</span>
            </span>
            <nav className="flex items-center gap-4">
              {(['About', 'Privacy', 'Terms', 'Contact'] as const).map(label => (
                <a
                  key={label}
                  href={`/${label.toLowerCase()}`}
                  style={{ color: 'var(--text-muted)' }}
                  className="hover:underline"
                >
                  {label}
                </a>
              ))}
            </nav>
          </div>
        </footer>
      </body>
    </html>
  )
}
