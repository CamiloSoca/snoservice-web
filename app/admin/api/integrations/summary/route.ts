import { NextResponse } from 'next/server'
import { currentSession } from '../../../../../lib/central/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type LinkState = 'connected' | 'unavailable' | 'pending'
type Integration = {
  id: '13-cut' | 'distribuidora'
  status: LinkState
  metrics: Record<string, number> | null
  asOf: string | null
}

const headers = {
  'Cache-Control': 'private, no-store, max-age=0',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noindex',
}

function validMetrics(value: unknown): value is Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  return Object.values(value).every(v => typeof v === 'number' && Number.isFinite(v) && v >= 0)
}

/** Cross-project edge endpoint; only verified Central AAL2 access tokens may invoke it.
 *  No database keys or tenant secrets are held by Central.
 */
async function readDistributor(token: string): Promise<Integration> {
  const offline: Integration = { id: 'distribuidora', status: 'unavailable', metrics: null, asOf: null }
  try {
    const response = await fetch('https://ktpitewtycdwuyymyhcp.supabase.co/functions/v1/central-readonly-summary', {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + token },
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(12000),
    })
    if (!response.ok) return offline
    const data: unknown = await response.json()
    if (!data || typeof data !== 'object' || Array.isArray(data)) return offline
    const record = data as Record<string, unknown>
    if (record.id !== 'distribuidora' || !validMetrics(record.metrics) ||
      typeof record.asOf !== 'string' || Number.isNaN(Date.parse(record.asOf))) return offline
    const metrics = record.metrics
    for (const field of ['sales', 'revenueCents', 'products', 'stockUnits', 'purchases']) {
      if (typeof metrics[field] !== 'number') return offline
    }
    return { id: 'distribuidora', status: 'connected', metrics: Object.fromEntries(
      ['sales', 'revenueCents', 'products', 'stockUnits', 'purchases'].map(field => [field, metrics[field]])
    ), asOf: record.asOf }
  } catch {
    // Never reveal external endpoint details or private error messages to a browser.
    return offline
  }
}

export async function GET() {
  const session = await currentSession()
  if (session.state !== 'authenticated') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401, headers })
  }
  if (session.aal !== 'aal2') {
    return NextResponse.json({ error: 'MFA requerido' }, { status: 403, headers })
  }
  const distributor = await readDistributor(session.accessToken)
  const integrations: Integration[] = [
    { id: '13-cut', status: 'pending', metrics: null, asOf: null },
    distributor,
  ]
  return NextResponse.json({
    connectedSites: integrations.filter(x => x.status === 'connected').length,
    registeredSites: 2,
    integrations,
  }, { headers })
}
