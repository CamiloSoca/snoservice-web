import { randomBytes } from 'node:crypto'
import { NextResponse, type NextRequest } from 'next/server'

/** Per-request nonce. Authentication/authorization is enforced again at the data boundary. */
export function proxy(request: NextRequest) {
  // Cloudflare mTLS is enforced at the canonical public hostname.
  // Block direct alias/apex access to /admin so a different Host cannot
  // bypass the Cloudflare device certificate gate. The server auth checks
  // below remain mandatory on every protected route and action.
  const canonical = process.env.CENTRAL_CANONICAL_ORIGIN
  if (process.env.NODE_ENV === 'production') {
    let expectedHost: string
    try {
      if (!canonical) throw new Error('Admin canonical hostname unavailable')
      const url = new URL(canonical)
      if (url.protocol !== 'https:' || url.pathname !== '/' || url.search || url.hash ||
        url.username || url.password) throw new Error('Invalid canonical origin')
      expectedHost = url.host.toLowerCase()
    } catch {
      return new NextResponse('Not found', { status: 404, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } })
    }
    if ((request.headers.get('host') || '').toLowerCase() !== expectedHost) {
      return new NextResponse('Not found', { status: 404, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } })
    }
  }
  const nonce = randomBytes(16).toString('base64')
  const csp = [
    "default-src 'none'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "img-src 'self' data:",
    "connect-src 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "base-uri 'none'",
    "object-src 'none'",
    ...(process.env.NODE_ENV === 'production' ? ["upgrade-insecure-requests"] : []),
  ].join('; ')
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', csp)
  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('Referrer-Policy', 'no-referrer')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('Cache-Control', 'private, no-store, max-age=0')
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
  return response
}

export const config = { matcher: ['/admin/:path*'] }
