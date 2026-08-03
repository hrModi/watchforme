import { redirect } from 'next/navigation'

// next.config.ts handles this at the edge; this is a fallback.
export default async function Page({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params
  redirect(`/gasoline-price/us/${state}`)
}
