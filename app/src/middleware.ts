import { NextRequest, NextResponse } from 'next/server'

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon|icon|robots|sitemap).*)'],
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Always write the IP-detected country so the client can read it without
  // needing server-side headers. This never overrides the user's explicit preference.
  const cfCountry = request.headers.get('CF-IPCountry')
  response.cookies.set('country_auto', cfCountry === 'IN' ? 'IN' : 'US', {
    path: '/',
    maxAge: 60 * 60 * 24, // 24h — refreshed on every visit
    sameSite: 'lax',
    httpOnly: false,
  })

  return response
}
