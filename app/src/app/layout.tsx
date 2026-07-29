import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'

export const metadata: Metadata = {
  title: {
    default: 'watchforme.me | Free Price & Rate Watchers',
    template: '%s | watchforme.me',
  },
  description: 'Free fuel price alerts for India and the US. No signup, no account. Just enter your email or WhatsApp and get notified when prices move.',
  keywords: ['fuel price', 'petrol price', 'diesel price', 'gas price', 'price alert', 'India fuel price', 'US gas price'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://watchforme.me'),
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
  return (
    <html lang="en" className="h-full">
      <body className="bg-page min-h-full flex flex-col antialiased">
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <footer
          className="border-t py-6 text-xs"
          style={{ borderColor: 'var(--border)', color: 'var(--text-faint)' }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
            <span>watchforme.me · Free forever · No signup</span>
            <a href="/privacy" style={{ color: 'var(--text-muted)' }}>Privacy</a>
          </div>
        </footer>
      </body>
    </html>
  )
}
