import { NextRequest } from 'next/server'
import { expireAlert } from '@/lib/alerts'


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
  await expireAlert(token)

  const html = HTML('Unsubscribed', `
    <h1>You're unsubscribed</h1>
    <p>Your alert has been cancelled. You won't receive any more notifications for this condition.</p>
    <p style="margin-top: 16px;"><a href="/">← Back to watchforme.me</a></p>
  `)

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
