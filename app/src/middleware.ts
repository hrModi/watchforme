import { NextRequest, NextResponse } from 'next/server'

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon|icon|robots|sitemap).*)'],
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Only set the country cookie if the user hasn't explicitly chosen one
  if (!request.cookies.get('watcher_country')) {
    const cfCountry = request.headers.get('CF-IPCountry')
    const country = cfCountry === 'IN' ? 'IN' : 'US'
    response.cookies.set('watcher_country', country, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
    })
  }

  return response
}
