export const instant = false

import { connection } from 'next/server'
import { requireCentralAdmin } from '../../lib/central/auth'
import CentralDashboardClient, { type CentralSection } from './dashboard-client'

const sections = new Set<CentralSection>(['resumen', 'sitios', 'clientes', 'estadisticas', 'facturacion', 'configuracion'])

export default async function CentralDashboard({ searchParams }: {
  searchParams: Promise<{ section?: string }>
}) {
  await connection()
  // This is the actual security boundary. Client navigation below is only presentation.
  // Every future API or privileged server action must independently call requireCentralAdmin().
  const user = await requireCentralAdmin()
  const params = await searchParams
  const requested = params.section
  const initialSection: CentralSection = requested && sections.has(requested as CentralSection)
    ? requested as CentralSection : 'resumen'
  return <CentralDashboardClient initialSection={initialSection} adminEmail={user.email} />
}
