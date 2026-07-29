import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: {
    default: 'WatcherFor.me — Free Price & Rate Watchers',
    template: '%s | WatcherFor.me',
  },
  description: 'Free fuel price alerts for India and the US. No signup, no account — just enter your email or WhatsApp and get notified when prices move.',
  keywords: ['fuel price', 'petrol price', 'diesel price', 'gas price', 'price alert', 'India fuel price', 'US gas price'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://watcherforme.example.com'),
  openGraph: {
    type: 'website',
    siteName: 'WatcherFor.me',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="bg-page min-h-full flex flex-col antialiased">
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <footer
          className="border-t mt-16 py-8 text-center text-xs"
          style={{ borderColor: 'var(--border)', color: 'var(--text-faint)' }}
        >
          <p>WatcherFor.me — Free forever · No signup · <a href="/privacy" style={{ color: 'var(--text-muted)' }}>Privacy</a></p>
        </footer>
      </body>
    </html>
  )
}
