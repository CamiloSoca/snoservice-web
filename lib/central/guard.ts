import 'server-only'
import { headers } from 'next/headers'

/** Fail closed for browser POSTs without a verified same-origin Origin header. */
export async function assertSameOrigin(): Promise<boolean> {
  const canonical = process.env.CENTRAL_CANONICAL_ORIGIN
  if (!canonical) return false
  try {
    const expected = new URL(canonical)
    if (expected.origin !== canonical || expected.username || expected.password || expected.pathname !== '/' ||
      (process.env.NODE_ENV === 'production' && expected.protocol !== 'https:')) return false
    const incoming = (await headers()).get('origin')
    return incoming === expected.origin
  } catch { return false }
}

export function validTotp(code: unknown): code is string {
  return typeof code === 'string' && /^\d{6}$/.test(code)
}

export function validEmail(email: unknown): email is string {
  return typeof email === 'string' && email.length >= 3 && email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function auditSecurity(event: string, userId?: string) {
  const safeEvent = event.replace(/[^a-z0-9_.-]/gi, '_').slice(0, 50)
  // Never log passwords, OTPs, JWTs, refresh tokens, email addresses or request bodies.
  console.info(JSON.stringify({ scope: 'snoservice-central', event: safeEvent, userId: userId || null, time: new Date().toISOString() }))
}
