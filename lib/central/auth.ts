/** Server-only adapter to Supabase Auth's documented HTTP API.
 * No client-side session tokens, no service-role key and no shared tenant credentials.
 */
import 'server-only'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export type Assurance = 'aal1' | 'aal2'
export type VerifiedSession = { state: 'authenticated'; userId: string; email: string; aal: Assurance; accessToken: string }
export type SessionResult = VerifiedSession | { state: 'refresh' | 'denied' | 'unavailable' }
type TokenPair = { access_token: string; refresh_token: string; expires_in: number }

const PREFIX = process.env.NODE_ENV === 'production' ? '__Secure-sno_central_' : 'sno_central_dev_'
export const ACCESS_COOKIE = `${PREFIX}access`
export const REFRESH_COOKIE = `${PREFIX}refresh`

function settings() {
  const rawUrl = process.env.CENTRAL_SUPABASE_URL
  const key = process.env.CENTRAL_SUPABASE_PUBLISHABLE_KEY
  const admins = process.env.CENTRAL_ADMIN_USER_IDS
  if (!rawUrl || !key || !admins || !process.env.CENTRAL_CANONICAL_ORIGIN || !key.startsWith('sb_publishable_')) return null
  try {
    const url = new URL(rawUrl)
    if (url.username || url.password || url.search || url.hash || url.pathname !== '/' ||
      (url.protocol !== 'https:' && process.env.NODE_ENV === 'production')) return null
    if (!['https:', 'http:'].includes(url.protocol)) return null
    if (url.protocol === 'http:' && !['localhost', '127.0.0.1'].includes(url.hostname)) return null
    const ids = new Set(admins.split(',').map(id => id.trim().toLowerCase()).filter(id => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)))
    if (ids.size === 0) return null
    return { base: `${url.origin}/auth/v1`, key, ids }
  } catch { return null }
}

export function isCentralConfigured() { return settings() !== null }
export function isAdminId(id: string) { return settings()?.ids.has(id.toLowerCase()) === true }

export async function authApi(path: string, method: 'GET' | 'POST', token?: string, body?: unknown): Promise<{ ok: boolean; data: any }> {
  const config = settings()
  if (!config || !path.startsWith('/') || path.includes('://') || /[\r\n]/.test(path)) return { ok: false, data: null }
  try {
    const response = await fetch(`${config.base}${path}`, {
      method,
      headers: {
        apikey: config.key,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(8000),
    })
    const data = await response.json().catch(() => null)
    return { ok: response.ok, data }
  } catch { return { ok: false, data: null } }
}

export function validTokens(value: unknown): value is TokenPair {
  if (!value || typeof value !== 'object') return false
  const t = value as Record<string, unknown>
  return typeof t.access_token === 'string' && t.access_token.length > 20 && t.access_token.length < 12000 &&
    typeof t.refresh_token === 'string' && t.refresh_token.length > 10 && t.refresh_token.length < 12000 &&
    typeof t.expires_in === 'number' && Number.isFinite(t.expires_in) && t.expires_in >= 30 && t.expires_in <= 604800
}

export async function storeTokens(tokens: TokenPair) {
  if (!validTokens(tokens)) throw new Error('Invalid auth response')
  const jar = await cookies()
  const opts = { httpOnly: true as const, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const, path: '/admin', priority: 'high' as const }
  jar.set(ACCESS_COOKIE, tokens.access_token, { ...opts, maxAge: Math.min(tokens.expires_in, 900) })
  jar.set(REFRESH_COOKIE, tokens.refresh_token, { ...opts, maxAge: 30 * 60 })
}

export async function clearTokens() {
  const jar = await cookies()
  jar.delete({ name: ACCESS_COOKIE, path: '/admin' })
  jar.delete({ name: REFRESH_COOKIE, path: '/admin' })
}

/** Decode only after remote /user verification. Never use unverified JWT data to grant access. */
function assuranceFromVerifiedJwt(jwt: string, userId: string): Assurance | null {
  try {
    const part = jwt.split('.')[1]
    if (!part || part.length > 5000) return null
    const value = JSON.parse(Buffer.from(part, 'base64url').toString('utf8'))
    if (value.sub !== userId || !Number.isFinite(value.exp) || value.exp * 1000 <= Date.now()) return null
    return value.aal === 'aal2' ? 'aal2' : 'aal1'
  } catch { return null }
}

export async function verifyAccessToken(token: string): Promise<VerifiedSession | null> {
  if (!settings() || !token || token.length > 12000) return null
  const result = await authApi('/user', 'GET', token)
  const user = result.data
  if (!result.ok || typeof user?.id !== 'string' || !isAdminId(user.id)) return null
  const aal = assuranceFromVerifiedJwt(token, user.id)
  if (!aal) return null
  return { state: 'authenticated', userId: user.id, email: typeof user.email === 'string' ? user.email : '', aal, accessToken: token }
}

export async function currentSession(): Promise<SessionResult> {
  if (!settings()) return { state: 'unavailable' }
  const jar = await cookies()
  const access = jar.get(ACCESS_COOKIE)?.value
  if (access) {
    const session = await verifyAccessToken(access)
    if (session) return session
  }
  return { state: jar.has(REFRESH_COOKIE) ? 'refresh' : 'denied' }
}

export async function requireCentralAdmin(): Promise<VerifiedSession> {
  const result = await currentSession()
  if (result.state === 'refresh') redirect('/admin/refresh')
  if (result.state !== 'authenticated') redirect('/admin/login')
  if (result.aal !== 'aal2') redirect('/admin/mfa')
  return result
}

export async function requireCentralPendingMfa(): Promise<VerifiedSession> {
  const result = await currentSession()
  if (result.state === 'refresh') redirect('/admin/refresh')
  if (result.state !== 'authenticated') redirect('/admin/login')
  return result
}

export async function listTotpFactors(token: string) {
  // Supabase Auth exposes a user's factors via GET /user; GET /factors is not a supported endpoint.
  const res = await authApi('/user', 'GET', token)
  if (!res.ok) return null
  const raw = res.data?.factors
  if (!Array.isArray(raw)) return null
  return raw.filter((factor: any) => typeof factor?.id === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(factor.id) && factor.factor_type === 'totp') as Array<{ id: string; status: string; factor_type: 'totp' }>
}
