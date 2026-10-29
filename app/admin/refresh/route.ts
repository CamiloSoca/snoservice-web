import { NextRequest, NextResponse } from 'next/server'
import { ACCESS_COOKIE, REFRESH_COOKIE, authApi, sessionFromAuthResponse, validTokens, verifyAccessToken } from '../../../lib/central/auth'
import { auditSecurity } from '../../../lib/central/guard'


function clearOnResponse(response: NextResponse) {
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE]) {
    response.cookies.set(name, '', { path: '/admin', maxAge: 0, httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' })
  }
  return response
}

export async function GET(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value
  const login = new URL('/admin/login', request.url)
  const deny = () => clearOnResponse(NextResponse.redirect(login, { status: 303 }))
  if (!refreshToken || refreshToken.length > 12000) return deny()
  const result = await authApi('/token?grant_type=refresh_token', 'POST', undefined, { refresh_token: refreshToken })
  if (!result.ok || !validTokens(result.data)) return deny()
  const verified = sessionFromAuthResponse(result.data) ?? await verifyAccessToken(result.data.access_token)
  if (!verified) {
    auditSecurity('refresh_denied')
    return deny()
  }
  const response = NextResponse.redirect(new URL(verified.aal === 'aal2' ? '/admin' : '/admin/mfa', request.url), { status: 303 })
  const opts = { path: '/admin', httpOnly: true as const, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const, priority: 'high' as const }
  response.cookies.set(ACCESS_COOKIE, result.data.access_token, { ...opts, maxAge: Math.min(result.data.expires_in, 900) })
  response.cookies.set(REFRESH_COOKIE, result.data.refresh_token, { ...opts, maxAge: 30 * 60 })
  return response
}
