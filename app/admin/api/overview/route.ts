import { NextResponse } from 'next/server'
import { currentSession } from '../../../../lib/central/auth'


export async function GET() {
  const auth = await currentSession()
  if (auth.state !== 'authenticated') return NextResponse.json({ error: 'No autorizado' }, { status: 401, headers: { 'Cache-Control': 'no-store' } })
  if (auth.aal !== 'aal2') return NextResponse.json({ error: 'MFA requerido' }, { status: 403, headers: { 'Cache-Control': 'no-store' } })
  // No tenants are connected. Never return fictional metrics or tenant data.
  return NextResponse.json({ sites: 0, users: null, appointments: null, revenue: null, integrations: [] }, {
    headers: { 'Cache-Control': 'private, no-store, max-age=0', 'X-Content-Type-Options': 'nosniff' },
  })
}
