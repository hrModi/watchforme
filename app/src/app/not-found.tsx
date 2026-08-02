import Link from 'next/link'

export const runtime = 'edge'

export default function NotFound() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24 text-center">
      <p className="text-5xl font-bold mb-4" style={{ color: 'var(--text)' }}>404</p>
      <p className="text-base mb-8" style={{ color: 'var(--text-muted)' }}>
        This page doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="text-sm font-semibold px-5 py-2.5 rounded-lg"
        style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
      >
        Back to home
      </Link>
    </div>
  )
}
