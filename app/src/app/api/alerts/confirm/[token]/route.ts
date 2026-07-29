import { NextRequest } from 'next/server'
import { confirmAlert } from '@/lib/alerts'

export const runtime = 'edge'

const HTML = (title: string, body: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} | watchforme.me</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 480px; margin: 80px auto; padding: 0 20px; color: #111826; }
    h1 { font-size: 1.25rem; font-weight: 700; margin-bottom: 8px; }
    p { color: #5C6478; line-height: 1.6; }
    a { color: #1B59D8; }
  </style>
</head>
<body>${body}</body>
</html>`

interface Props {
  params: Promise<{ token: string }>
}

export async function GET(_request: NextRequest, { params }: Props) {
  const { token } = await params

  const alert = await confirmAlert(token)

  if (!alert) {
    const html = HTML('Already confirmed', `
      <h1>Already confirmed</h1>
      <p>This alert is already active. You'll be notified when the price condition is met.</p>
      <p><a href="/">← Back to watchforme.me</a></p>
    `)
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  const html = HTML('Alert confirmed', `
    <h1>Alert confirmed ✓</h1>
    <p>Your alert is now active. We'll notify you via ${alert.channel} when the condition is met.</p>
    <p style="margin-top: 16px;"><a href="/">← Back to watchforme.me</a></p>
  `)

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
