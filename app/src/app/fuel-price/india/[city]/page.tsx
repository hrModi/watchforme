import { redirect } from 'next/navigation'

// next.config.ts handles this at the edge; this is a fallback.
export default async function Page({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params
  redirect(`/petrol-price/india/${city}`)
}
