'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  Activity, ArrowRight, ArrowUpRight, BarChart3, Building2, Check,
  ChevronRight, CircleHelp, CreditCard, Globe2, LayoutDashboard,
  LockKeyhole, LogOut, Menu, Plus, Settings2, ShieldCheck, Sparkles,
  UsersRound, Workflow, X,
} from 'lucide-react'
import { centralLogout } from './actions'

export type CentralSection = 'resumen' | 'sitios' | 'clientes' | 'estadisticas' | 'facturacion' | 'configuracion'

const primaryNav = [
  { id: 'resumen', label: 'Resumen', Icon: LayoutDashboard },
  { id: 'sitios', label: 'Sitios web', Icon: Globe2 },
  { id: 'clientes', label: 'Clientes', Icon: UsersRound },
  { id: 'estadisticas', label: 'Analítica', Icon: BarChart3 },
] as const

const secondaryNav = [
  { id: 'facturacion', label: 'Facturación', Icon: CreditCard },
  { id: 'configuracion', label: 'Configuración', Icon: Settings2 },
] as const

const sectionLabels: Record<CentralSection, string> = {
  resumen: 'Resumen', sitios: 'Sitios web', clientes: 'Clientes',
  estadisticas: 'Analítica', facturacion: 'Facturación', configuracion: 'Configuración',
}

const emptySections: Record<Exclude<CentralSection, 'resumen'>, {
  eyebrow: string; title: string; description: string; Icon: typeof Globe2; details: string[]
}> = {
  sitios: {
    eyebrow: 'PORTAFOLIO DE PROYECTOS', title: 'Cada negocio, en un solo lugar.',
    description: 'Vas a gestionar los sitios y aplicaciones de tus clientes desde acá. Las conexiones se agregarán individualmente, con permisos y aislamiento propios.',
    Icon: Globe2, details: ['Dominios y aplicaciones', 'Estado de integraciones', 'Configuración por cliente'],
  },
  clientes: {
    eyebrow: 'RELACIONES COMERCIALES', title: 'Tus clientes, organizados.',
    description: 'Un espacio para centralizar los negocios que confían en SNOOSERVICE. Todavía no hay información de clientes conectada.',
    Icon: UsersRound, details: ['Ficha de cada negocio', 'Servicios contratados', 'Historial de actividad'],
  },
  estadisticas: {
    eyebrow: 'INTELIGENCIA DE NEGOCIO', title: 'Datos que ayuden a decidir.',
    description: 'Las métricas aparecerán cuando incorporemos integraciones verificadas. No mostramos cifras ficticias ni consultamos datos de otras instalaciones.',
    Icon: BarChart3, details: ['Actividad por proyecto', 'Indicadores consolidados', 'Rendimiento y tendencias'],
  },
  facturacion: {
    eyebrow: 'GESTIÓN FINANCIERA', title: 'Control de ingresos y servicios.',
    description: 'La facturación de SNOOSERVICE tendrá su propio módulo, independiente de la contabilidad de los negocios de tus clientes.',
    Icon: CreditCard, details: ['Planes y suscripciones', 'Ingresos de SNOOSERVICE', 'Estado de cobros'],
  },
  configuracion: {
    eyebrow: 'CENTRO DE CONTROL', title: 'Tu espacio. Tus reglas.',
    description: 'La administración sensible se habilitará cuando estén implementados y auditados los permisos para cada operación.',
    Icon: Settings2, details: ['Seguridad y sesiones', 'Preferencias del panel', 'Integraciones autorizadas'],
  },
}

function Brand() {
  return <div className="sc-brand">
    <span className="sc-brand-mark"><Image src="/logo.png" alt="" width={39} height={39} priority /></span>
    <span className="sc-brand-word">SNO<span>SERVICE</span><small>CENTRAL WORKSPACE</small></span>
  </div>
}

function NavButton({ id, label, Icon, selected, navigate }: {
  id: CentralSection; label: string; Icon: typeof Globe2; selected: boolean; navigate: (id: CentralSection) => void
}) {
  return <button type="button" className={`sc-nav-item ${selected ? 'is-active' : ''}`}
    onClick={() => navigate(id)} aria-current={selected ? 'page' : undefined}>
    <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
    <span>{label}</span>
    {selected && <span className="sc-nav-marker" aria-hidden="true" />}
  </button>
}

function WorkspaceEmpty({ section }: { section: Exclude<CentralSection, 'resumen'> }) {
  const content = emptySections[section]
  const Icon = content.Icon
  return <div className="sc-section-view">
    <div className="sc-page-heading">
      <div><span className="sc-eyebrow">{content.eyebrow}</span><h1>{sectionLabels[section]}</h1>
        <p>Administración de SNOOSERVICE Central</p></div>
      <span className="sc-outline-pill"><span className="sc-status-point" /> Sin integraciones</span>
    </div>
    <div className="sc-placeholder-panel">
      <div className="sc-placeholder-glow" aria-hidden="true" />
      <div className="sc-placeholder-icon"><Icon size={28} strokeWidth={1.65} /></div>
      <span className="sc-eyebrow sc-green">PRÓXIMAMENTE</span>
      <h2>{content.title}</h2>
      <p>{content.description}</p>
      <div className="sc-feature-pills">{content.details.map(item => <span key={item}><Check size={14} />{item}</span>)}</div>
      <button type="button" className="sc-btn sc-btn-disabled" disabled><Plus size={16} /> Módulo en preparación</button>
    </div>
    <div className="sc-helper-note"><ShieldCheck size={17} /> Esta sección todavía no realiza consultas a bases de datos de clientes.</div>
  </div>
}

function Overview({ navigate }: { navigate: (id: CentralSection) => void }) {
  return <div className="sc-overview">
    <div className="sc-page-heading">
      <div><span className="sc-eyebrow">TU ESPACIO DE TRABAJO</span><h1>Visión general<span className="sc-heading-period">.</span></h1>
        <p>Todos tus proyectos, clientes y operaciones desde un solo lugar.</p></div>
      <span className="sc-outline-pill"><span className="sc-status-point" /> Entorno protegido</span>
    </div>

    <section className="sc-hero" aria-labelledby="sc-hero-title">
      <div className="sc-hero-art" aria-hidden="true"><div className="sc-hero-ring sc-ring-one"/><div className="sc-hero-ring sc-ring-two"/><div className="sc-hero-orb"><Activity size={42} strokeWidth={1.4}/></div></div>
      <div className="sc-hero-content">
        <span className="sc-hero-tag"><Sparkles size={14}/> NUEVO CENTRO DE OPERACIONES</span>
        <h2 id="sc-hero-title">Tu negocio, <span>bajo control.</span></h2>
        <p>Una vista central para construir, organizar y hacer crecer cada solución que desarrollás.</p>
        <button type="button" className="sc-hero-link" onClick={() => navigate('sitios')}>Explorar proyectos <ArrowUpRight size={16}/></button>
      </div>
    </section>

    <div className="sc-section-heading"><div><h2>En números</h2><span>Panorama de tu operación</span></div><span className="sc-subtle-note"><Activity size={14}/> Estado actual</span></div>
    <section className="sc-metrics" aria-label="Indicadores de SNOOSERVICE Central">
      <div className="sc-metric"><div className="sc-metric-top"><span>Sitios integrados</span><span className="sc-metric-icon"><Globe2 size={19}/></span></div><strong>00</strong><small>Aún no hay conexiones activas</small><div className="sc-metric-bottom"><span className="sc-metric-dot"/> Sin integraciones</div></div>
      <div className="sc-metric"><div className="sc-metric-top"><span>Clientes registrados</span><span className="sc-metric-icon"><UsersRound size={19}/></span></div><strong>00</strong><small>El directorio está vacío</small><div className="sc-metric-bottom"><span className="sc-metric-dot"/> Sin registros</div></div>
      <div className="sc-metric"><div className="sc-metric-top"><span>Automatizaciones</span><span className="sc-metric-icon"><Workflow size={19}/></span></div><strong>00</strong><small>Sin flujos conectados</small><div className="sc-metric-bottom"><span className="sc-metric-dot"/> Sin actividad</div></div>
      <div className="sc-metric"><div className="sc-metric-top"><span>Ingresos registrados</span><span className="sc-metric-icon"><CreditCard size={19}/></span></div><strong className="sc-metric-dash">—</strong><small>Facturación no configurada</small><div className="sc-metric-bottom"><span className="sc-metric-dot"/> Datos no disponibles</div></div>
    </section>

    <div className="sc-workspace-grid">
      <section className="sc-content-card sc-projects">
        <div className="sc-card-header"><div><span className="sc-eyebrow">WORKSPACE</span><h2>Mis proyectos</h2></div><button type="button" className="sc-card-link" onClick={() => navigate('sitios')}>Ver todos <ArrowRight size={15}/></button></div>
        <div className="sc-project-empty"><div className="sc-project-icon"><Building2 size={27} strokeWidth={1.6}/></div><h3>Un espacio listo para crecer</h3><p>Cuando conectes tu primer sitio o aplicación, aparecerá acá con su estado e información.</p><button disabled type="button" className="sc-btn sc-btn-disabled"><Plus size={16}/> Agregar proyecto <span>Próximamente</span></button></div>
      </section>
      <section className="sc-content-card sc-next-steps">
        <div className="sc-card-header"><div><span className="sc-eyebrow">HOJA DE RUTA</span><h2>Próximos pasos</h2></div><span className="sc-roadmap-label">CONFIGURACIÓN</span></div>
        <div className="sc-roadmap-list">
          <div className="sc-roadmap-item"><span className="sc-roadmap-icon sc-done"><Check size={17}/></span><div><strong>Acceso seguro</strong><p>Inicio de sesión y segundo factor activos</p></div><span className="sc-roadmap-state sc-state-done">Listo</span></div>
          <div className="sc-roadmap-item"><span className="sc-roadmap-icon sc-done"><Check size={17}/></span><div><strong>Protección de dispositivos</strong><p>Cloudflare mTLS configurado</p></div><span className="sc-roadmap-state sc-state-done">Listo</span></div>
          <div className="sc-roadmap-item"><span className="sc-roadmap-icon"><Globe2 size={18}/></span><div><strong>Primera integración</strong><p>Conectar un sitio con permisos aislados</p></div><span className="sc-roadmap-state">Pendiente</span></div>
          <div className="sc-roadmap-item"><span className="sc-roadmap-icon"><BarChart3 size={18}/></span><div><strong>Indicadores reales</strong><p>Habilitar métricas verificadas</p></div><span className="sc-roadmap-state">Pendiente</span></div>
        </div>
        <div className="sc-roadmap-foot"><LockKeyhole size={15}/> Las integraciones requieren aprobación antes de activarse.</div>
      </section>
    </div>
  </div>
}

export default function CentralDashboardClient({ initialSection, adminEmail }: {
  initialSection: CentralSection; adminEmail: string
}) {
  const [section, setSection] = useState<CentralSection>(initialSection)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onPopState = () => {
      const id = new URLSearchParams(window.location.search).get('section')
      const valid = id && Object.prototype.hasOwnProperty.call(sectionLabels, id)
      setSection(valid ? id as CentralSection : 'resumen')
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  function navigate(id: CentralSection) {
    setSection(id)
    setMobileOpen(false)
    const url = id === 'resumen' ? '/admin' : `/admin?section=${encodeURIComponent(id)}`
    if (window.location.pathname + window.location.search !== url) window.history.pushState(null, '', url)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const initial = adminEmail.trim().charAt(0).toUpperCase() || 'A'

  return <div className="sc-shell">
    {mobileOpen && <button className="sc-mobile-backdrop" type="button" onClick={() => setMobileOpen(false)} aria-label="Cerrar menú" />}
    <aside className={`sc-sidebar ${mobileOpen ? 'sc-sidebar-open' : ''}`}>
      <div className="sc-sidebar-top"><Brand/><button type="button" className="sc-mobile-close" onClick={() => setMobileOpen(false)} aria-label="Cerrar navegación"><X size={21}/></button></div>
      <div className="sc-workspace-switch"><span className="sc-workspace-avatar">S</span><span><strong>Mi workspace</strong><small>SNOOSERVICE Central</small></span><ChevronRight size={15}/></div>
      <nav aria-label="Menú principal" className="sc-nav"><span className="sc-nav-label">GENERAL</span>
        {primaryNav.map(item => <NavButton key={item.id} {...item} selected={section === item.id} navigate={navigate}/>)}
        <span className="sc-nav-label sc-nav-label-spaced">ADMINISTRACIÓN</span>
        {secondaryNav.map(item => <NavButton key={item.id} {...item} selected={section === item.id} navigate={navigate}/>)}
      </nav>
      <div className="sc-sidebar-bottom"><div className="sc-security-card"><div className="sc-security-icon"><ShieldCheck size={18}/></div><strong>Seguridad activa</strong><p>Sesión protegida con autenticación multifactor.</p><span><span className="sc-status-point"/> Acceso verificado</span></div>
        <a className="sc-sidebar-help" href="https://www.snoservice.uy/" target="_blank" rel="noopener noreferrer"><CircleHelp size={17}/> Ir al sitio público <ArrowUpRight size={14}/></a>
      </div>
    </aside>
    <div className="sc-main">
      <header className="sc-topbar">
        <div className="sc-topbar-left"><button className="sc-hamburger" type="button" onClick={() => setMobileOpen(true)} aria-label="Abrir menú"><Menu size={21}/></button>
          <span className="sc-breadcrumb-home">Workspace</span><ChevronRight size={15} className="sc-breadcrumb-arrow"/><strong>{sectionLabels[section]}</strong></div>
        <div className="sc-topbar-right"><span className="sc-topbar-secure"><ShieldCheck size={15}/> Sesión segura</span><div className="sc-topbar-divider"/>
          <div className="sc-account"><span className="sc-account-avatar">{initial}</span><span className="sc-account-meta"><strong>Administrador</strong><small title={adminEmail}>{adminEmail}</small></span></div>
          <form action={centralLogout}><button type="submit" className="sc-logout" aria-label="Cerrar sesión" title="Cerrar sesión"><LogOut size={18}/></button></form>
        </div>
      </header>
      <main className="sc-content" id="sc-main-content">{section === 'resumen' ? <Overview navigate={navigate}/> : <WorkspaceEmpty section={section}/>}</main>
      <footer className="sc-footer"><span>© SNOOSERVICE · Central</span><span><span className="sc-status-point"/> Entorno administrativo privado</span></footer>
    </div>
  </div>
}
