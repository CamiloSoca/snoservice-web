/**
 * Central-only registry of known installations.
 * This is navigation metadata, NOT a connection to tenant databases or an
 * authentication bridge. Each application keeps its own login and policies.
 *
 * For live metrics later, use explicitly authorized, scoped server-to-server
 * integrations rather than importing customer Supabase clients.
 */
export type RegisteredProject = {
  id: '13-cut' | 'distribuidora'
  name: string
  type: 'Cliente' | 'Proyecto propio'
  category: string
  summary: string
  domain: string
  websiteUrl: string
  adminUrl: string
  capabilities: readonly string[]
}

export const REGISTERED_PROJECTS: readonly RegisteredProject[] = [
  {
    id: '13-cut',
    name: '13 CUT',
    type: 'Cliente',
    category: 'Barbería',
    summary: 'Reservas, agenda y gestión de la barbería.',
    domain: '13-cut.snoservice.uy',
    websiteUrl: 'https://13-cut.snoservice.uy',
    adminUrl: 'https://13-cut.snoservice.uy/admin',
    capabilities: ['Turnos', 'Barberos', 'Caja'],
  },
  {
    id: 'distribuidora',
    name: 'Distribuidora',
    type: 'Proyecto propio',
    category: 'Ventas e inventario',
    summary: 'Control de stock, compras, ventas y caja.',
    domain: 'distribuidora.snoservice.uy',
    websiteUrl: 'https://distribuidora.snoservice.uy',
    adminUrl: 'https://distribuidora.snoservice.uy',
    capabilities: ['Stock', 'Ventas', 'Caja'],
  },
] as const
