import { connection } from 'next/server'
import Image from 'next/image'
import { centralLogout } from './actions'
import { requireCentralAdmin } from '../../lib/central/auth'


const navigation = [
  { id: 'sitios', name: 'Sitios', symbol: '⌂' },
  { id: 'usuarios', name: 'Usuarios', symbol: '♧' },
  { id: 'estadisticas', name: 'Estadísticas', symbol: '▥' },
  { id: 'facturacion', name: 'Facturación', symbol: '▤' },
  { id: 'configuracion', name: 'Configuración', symbol: '⚙' },
] as const

type Section = typeof navigation[number]['id']
function isSection(value: string): value is Section { return navigation.some(n => n.id === value) }

export default async function CentralDashboard({ searchParams }: { searchParams: Promise<{ section?: string }> }) {
  await connection() // Required with cacheComponents; never prerender private admin HTML.
  await requireCentralAdmin()
  const p = await searchParams
  const section: Section = p.section && isSection(p.section) ? p.section : 'sitios'
  const sectionName = navigation.find(n => n.id === section)?.name ?? 'Sitios'
  const entries = <>{navigation.map(item => <a key={item.id} className={`sno-nav-link ${section === item.id ? 'selected' : ''}`} href={`/admin?section=${item.id}`}><span aria-hidden>{item.symbol}</span>{item.name}</a>)}</>
  return <div className="sno-shell">
    <aside className="sno-sidebar"><a href="/admin" className="sno-brand"><Image className="sno-brand-logo" src="/logo.png" alt="" width={36} height={36} priority /><span>SNOOSERVICE <small>Panel Central</small></span></a><nav aria-label="Navegación principal">{entries}</nav><div className="sno-help"><strong>Centro de operaciones</strong><p>Administración privada. Integraciones deshabilitadas.</p></div></aside>
    <div className="sno-main">
      <header className="sno-header"><div className="sno-headleft"><details className="sno-mobile-nav"><summary aria-label="Abrir navegación">☰</summary><nav aria-label="Navegación móvil">{entries}</nav></details><span className="sno-head-brand">▤ &nbsp; SNOOSERVICE</span></div><div className="sno-profile"><span className="sno-admin-dot" aria-hidden="true">●</span><span>Superadministrador</span><form action={centralLogout}><button type="submit" className="sno-logout">Salir</button></form></div></header>
      <main className="sno-dashboard">
        <div className="sno-page-heading"><div><span className="sno-eyebrow">Panel Central</span><h1>Buenas, administrador</h1><p>Administrá tu plataforma desde un solo lugar.</p></div><button className="sno-button sno-primary" disabled title="Disponible cuando aprobemos el flujo de integración">＋ Agregar sitio</button></div>
        <section className="sno-statgrid" aria-label="Indicadores generales">
          <div className="sno-stat"><div className="sno-stat-icon">⌂</div><strong>0</strong><span>Sitios integrados</span><small>Sin conexiones activas</small></div>
          <div className="sno-stat"><div className="sno-stat-icon">♧</div><strong>—</strong><span>Barberos en total</span><small>Sin datos conectados</small></div>
          <div className="sno-stat"><div className="sno-stat-icon">▤</div><strong>—</strong><span>Turnos del mes</span><small>Sin datos conectados</small></div>
          <div className="sno-stat"><div className="sno-stat-icon">$</div><strong>—</strong><span>Facturación global</span><small>Sin datos conectados</small></div>
        </section>
        <section className="sno-sites"><div className="sno-sites-heading"><div className="sno-tabs"><a href="/admin?section=sitios" className="selected">{sectionName}</a></div><span className="sno-private-badge">🔒 Acceso verificado con MFA</span></div>
          {section === 'sitios' ? <div className="sno-empty"><span className="sno-empty-icon">＋</span><h2>Todavía no hay sitios integrados</h2><p>Las conexiones con barberías se incorporarán de manera individual y segura. El panel permanece aislado hasta entonces.</p><button className="sno-button sno-secondary" disabled>Agregar nuevo sitio · Próximamente</button></div> : <div className="sno-empty"><span className="sno-empty-icon">◌</span><h2>{sectionName} · Próximamente</h2><p>Esta sección se habilitará después de definir permisos, aislamiento de datos y pruebas de seguridad.</p></div>}
        </section>
        <div className="sno-dashboard-foot">Datos reales conectados: ninguno. No existen credenciales compartidas entre instalaciones.</div>
      </main>
    </div>
  </div>
}
