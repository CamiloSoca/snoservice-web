import { NextResponse } from 'next/server'
import { currentSession } from '../../../../lib/central/auth'
import { REGISTERED_PROJECTS } from '../../../../lib/central/registered-projects'


export async function GET() {
  const auth = await currentSession()
  if (auth.state !== 'authenticated') return NextResponse.json({ error: 'No autorizado' }, { status: 401, headers: { 'Cache-Control': 'no-store' } })
  if (auth.aal !== 'aal2') return NextResponse.json({ error: 'MFA requerido' }, { status: 403, headers: { 'Cache-Control': 'no-store' } })
  // Registered installations are real metadata; no customer data is queried.
  // The explicit connectedSites and empty integrations distinguish a link
  // from an authorized live database/API connection.
  return NextResponse.json({
    sites: REGISTERED_PROJECTS.length,
    registeredSites: REGISTERED_PROJECTS.length,
    connectedSites: 0,
    projects: REGISTERED_PROJECTS.map(({ id, name, category, domain, websiteUrl }) => ({
      id, name, category, domain, websiteUrl,
    })),
    users: null, appointments: null, revenue: null, integrations: [],
  }, {
    headers: { 'Cache-Control': 'private, no-store, max-age=0', 'X-Content-Type-Options': 'nosniff' },
  })
}
