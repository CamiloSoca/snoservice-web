'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3, Check,
  CheckCheck, ChevronDown, ChevronRight, Command, Copy, CreditCard,
  ExternalLink, Fingerprint, Globe2, Keyboard, LayoutGrid, LockKeyhole,
  LogOut, Menu, PanelLeftClose, PanelLeftOpen, Search, Settings2,
  ShieldCheck, UsersRound, Workflow, X,
} from 'lucide-react'
import { centralLogout } from './actions'

export type CentralSection =
  'resumen' | 'sitios' | 'clientes' | 'estadisticas' |
  'facturacion' | 'automatizaciones' | 'configuracion'

type IconComponent = typeof Globe2
type NavEntry = { id: CentralSection; label: string; Icon: IconComponent; description: string }

const NAV: NavEntry[] = [
  { id: 'resumen', label: 'Vista general', Icon: LayoutGrid, description: 'Estado de tu operación' },
  { id: 'sitios', label: 'Sitios y apps', Icon: Globe2, description: 'Instalaciones e integraciones' },
  { id: 'clientes', label: 'Clientes', Icon: UsersRound, description: 'Cuentas y relaciones' },
  { id: 'estadisticas', label: 'Estadísticas', Icon: BarChart3, description: 'Datos e indicadores' },
  { id: 'facturacion', label: 'Facturación', Icon: CreditCard, description: 'Planes y cobros' },
  { id: 'automatizaciones', label: 'Automatizaciones', Icon: Workflow, description: 'Flujos y operaciones' },
  { id: 'configuracion', label: 'Configuración', Icon: Settings2, description: 'Preferencias y controles' },
]

const SECTIONS: Record<Exclude<CentralSection, 'resumen'>, {
  label: string; overline: string; title: string; description: string;
  upcoming: string[]; Icon: IconComponent; number: string
}> = {
  sitios: {
    label: 'Sitios y apps', overline: '01 / INSTALACIONES', title: 'Un sistema para cada negocio.',
    description: 'Una vista única para gestionar dominios, aplicaciones e integraciones. Los sitios se incorporarán de forma individual, sin compartir accesos ni credenciales entre clientes.',
    upcoming: ['Conexión aislada por proyecto', 'Estado y dominios de cada app', 'Acceso contextual a la instalación'], Icon: Globe2, number: '01',
  },
  clientes: {
    label: 'Clientes', overline: '02 / RELACIONES', title: 'Una ficha por cada cliente.',
    description: 'Contratos, servicios, contactos y aplicaciones vinculadas. Sin mezclar el negocio de SNOOSERVICE con los datos privados de sus clientes.',
    upcoming: ['Directorio de clientes', 'Servicios contratados', 'Historial comercial'], Icon: UsersRound, number: '02',
  },
  estadisticas: {
    label: 'Estadísticas', overline: '03 / INTELIGENCIA', title: 'Datos que sirvan para decidir.',
    description: 'Cuando existan conexiones aprobadas, vas a comparar actividad, uso y rendimiento real. No hay gráficos inventados ni información de clientes cargada todavía.',
    upcoming: ['Métricas verificables por instalación', 'Tendencias por período', 'Visibilidad por servicio'], Icon: BarChart3, number: '03',
  },
  facturacion: {
    label: 'Facturación', overline: '04 / NEGOCIO', title: 'Los números de SNOOSERVICE.',
    description: 'Planes, vencimientos e ingresos propios. Este espacio estará separado de las cajas y la contabilidad de cualquier negocio cliente.',
    upcoming: ['Planes y suscripciones', 'Cobros pendientes', 'Ingresos recurrentes'], Icon: CreditCard, number: '04',
  },
  automatizaciones: {
    label: 'Automatizaciones', overline: '05 / FLUJOS', title: 'Menos tareas repetidas.',
    description: 'Un mapa de procesos que conecte recordatorios, agendas y sistemas externos, con ejecución controlada y trazabilidad de cada integración.',
    upcoming: ['Flujos por cliente', 'Ejecuciones y errores', 'Control de activación'], Icon: Workflow, number: '05',
  },
  configuracion: {
    label: 'Configuración', overline: '06 / GOBIERNO', title: 'Control sin complicaciones.',
    description: 'Este espacio reunirá permisos, políticas y opciones de administración cuando estén implementados sus controles y auditoría del lado del servidor.',
    upcoming: ['Seguridad y sesiones', 'Permisos y perfiles', 'Integraciones autorizadas'], Icon: Settings2, number: '06',
  },
}

const PAGES = NAV.reduce((acc, item) => {
  acc[item.id] = item.label
  return acc
}, {} as Record<CentralSection, string>)

function Brand() {
  return <div className="sc-brand" aria-label="SNOOSERVICE Central">
    <span className="sc-brand-symbol"><Image src="/logo.png" alt="" width={33} height={33} priority /></span>
    <span className="sc-brand-text">SNO<span>SERVICE</span><small>C E N T R A L</small></span>
  </div>
}

function NavButton({ item, selected, navigate }: {
  item: NavEntry; selected: boolean; navigate: (id: CentralSection) => void
}) {
  const Icon = item.Icon
  return <button type="button" className={'sc-nav-link' + (selected ? ' is-current' : '')}
    aria-current={selected ? 'page' : undefined} onClick={() => navigate(item.id)}>
    <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
    <span>{item.label}</span>
    {selected ? <span className="sc-nav-line" aria-hidden="true" /> : null}
  </button>
}

function Metric({ label, value, detail, Icon, tone }: {
  label: string; value: string; detail: string; Icon: IconComponent; tone?: string
}) {
  return <article className="sc-metric">
    <div className="sc-metric-head"><span>{label}</span><Icon size={18} strokeWidth={1.65} aria-hidden="true" /></div>
    <div className="sc-metric-number">{value}</div>
    <div className={'sc-metric-detail ' + (tone ?? '')}>{detail}</div>
  </article>
}

function Overview({ navigate }: { navigate: (id: CentralSection) => void }) {
  return <div className="sc-overview">
    <div className="sc-page-heading">
      <div>
        <p className="sc-eyebrow">SNOOSERVICE / COMMAND CENTER</p>
        <h1>Todo en su lugar<span className="sc-period">.</span></h1>
        <p className="sc-lead">Una vista clara de tu operación. Sin ruido, sin datos de relleno.</p>
      </div>
      <span className="sc-heading-aside"><span className="sc-small-dot"/> Workspace operativo</span>
    </div>

    <section className="sc-feature">
      <div className="sc-feature-main">
        <div className="sc-feature-topline"><span>EL SIGUIENTE PASO</span><span>01 / 03</span></div>
        <div className="sc-feature-body">
          <span className="sc-feature-index">01</span>
          <h2>De una idea a una<br/>plataforma conectada.</h2>
          <p>La base administrativa está lista. El próximo hito es incorporar la primera instalación con permisos propios y datos aislados.</p>
          <button className="sc-feature-action" type="button" onClick={() => navigate('sitios')}>Explorar sitios <ArrowUpRight size={17}/></button>
        </div>
        <div className="sc-feature-bottom"><span>ESTADO ACTUAL</span><strong>Sin sitios conectados</strong></div>
      </div>
      <div className="sc-feature-side">
        <div className="sc-feature-side-header"><span>PLATAFORMA CENTRAL</span><Fingerprint size={21} strokeWidth={1.2}/></div>
        <div className="sc-feature-side-visual" aria-hidden="true"><span className="sc-ring ring-outer"/><span className="sc-ring ring-middle"/><span className="sc-ring ring-inner"/><span className="sc-orbit-mark">S</span></div>
        <div className="sc-feature-side-footer"><span className="sc-small-dot"/> Sesión administrativa autenticada <ChevronRight size={17}/></div>
      </div>
    </section>

    <div className="sc-section-title"><div><span className="sc-kicker">01 / PANORAMA</span><h2>En números</h2></div><p>Datos del espacio central, sin integraciones externas.</p></div>
    <section className="sc-metrics" aria-label="Resumen de operación">
      <Metric label="Sitios conectados" value="00" detail="Ninguna integración" Icon={Globe2}/>
      <Metric label="Clientes vinculados" value="00" detail="Sin registros conectados" Icon={UsersRound}/>
      <Metric label="Flujos activos" value="00" detail="Sin automatizaciones" Icon={Workflow}/>
      <Metric label="Facturación" value="—" detail="Aún sin configurar" Icon={CreditCard}/>
    </section>

    <div className="sc-lower-grid">
      <section className="sc-panel sc-next">
        <div className="sc-panel-heading"><span className="sc-kicker">02 / PRÓXIMAS ACCIONES</span><h2>Empezar bien.</h2><p>Tres módulos para construir el sistema desde una base ordenada.</p></div>
        <div className="sc-next-list">
          <button type="button" onClick={() => navigate('sitios')}><span className="sc-next-icon"><Globe2 size={20}/></span><span><strong>Preparar el primer sitio</strong><small>Integración por proyecto, con permisos independientes</small></span><ArrowUpRight size={18}/></button>
          <button type="button" onClick={() => navigate('clientes')}><span className="sc-next-icon"><UsersRound size={20}/></span><span><strong>Organizar clientes</strong><small>Relaciones comerciales separadas de las instalaciones</small></span><ArrowUpRight size={18}/></button>
          <button type="button" onClick={() => navigate('automatizaciones')}><span className="sc-next-icon"><Workflow size={20}/></span><span><strong>Diseñar automatizaciones</strong><small>Flujos trazables y controlados desde Central</small></span><ArrowUpRight size={18}/></button>
        </div>
      </section>
      <section className="sc-panel sc-readiness">
        <div className="sc-panel-heading"><span className="sc-kicker">03 / PREPARACIÓN</span><h2>Estado del workspace</h2><p>Qué tenemos realmente habilitado.</p></div>
        <div className="sc-readiness-list">
          <div><span className="sc-state-mark is-ready"><Check size={15}/></span><span><strong>Acceso de administrador</strong><small>Sesión validada</small></span><span className="sc-state-word">Activo</span></div>
          <div><span className="sc-state-mark is-ready"><Check size={15}/></span><span><strong>Segundo factor</strong><small>Verificación MFA completada</small></span><span className="sc-state-word">Activo</span></div>
          <div><span className="sc-state-mark"><span/></span><span><strong>Primer sitio</strong><small>Sin instalaciones incorporadas</small></span><span className="sc-state-word is-pending">Pendiente</span></div>
          <div><span className="sc-state-mark"><span/></span><span><strong>Datos operativos</strong><small>Sin fuentes conectadas</small></span><span className="sc-state-word is-pending">Pendiente</span></div>
        </div>
        <div className="sc-readiness-foot"><LockKeyhole size={15}/> Cada integración necesitará sus propios controles de acceso.</div>
      </section>
      <section className="sc-panel sc-activity">
        <div className="sc-panel-heading"><span className="sc-kicker">04 / ACTIVIDAD</span><h2>Un registro, no un adorno.</h2></div>
        <div className="sc-activity-empty"><Activity size={23} strokeWidth={1.4}/><div><strong>Historial todavía no disponible</strong><p>Cuando implementemos la auditoría persistente, acá aparecerán eventos auténticos de sesiones, sitios e integraciones.</p></div></div>
      </section>
      <section className="sc-panel sc-shortcuts">
        <div className="sc-panel-heading"><span className="sc-kicker">05 / ATAJOS</span><h2>Movete a tu ritmo.</h2></div>
        <div className="sc-shortcut-row"><span>Buscar una sección o acción</span><kbd>Ctrl</kbd><kbd>K</kbd></div>
        <div className="sc-shortcut-row"><span>Entrar o salir del modo enfoque</span><kbd>Alt</kbd><kbd>F</kbd></div>
        <div className="sc-shortcut-row"><span>Abrir búsqueda rápida</span><kbd>/</kbd></div>
      </section>
    </div>
  </div>
}

function SectionView({ section, navigate }: { section: Exclude<CentralSection,'resumen'>; navigate: (id: CentralSection) => void }) {
  const item = SECTIONS[section]
  const Icon = item.Icon
  return <div className="sc-section-view">
    <div className="sc-page-heading sc-section-heading"><div><span className="sc-eyebrow">{item.overline}</span><h1>{item.label}<span className="sc-period">.</span></h1><p className="sc-lead">{item.description}</p></div><span className="sc-heading-aside"><span className="sc-muted-dot"/> En preparación</span></div>
    <div className="sc-section-grid">
      <section className="sc-section-primary">
        <div className="sc-section-watermark">{item.number}</div>
        <span className="sc-section-emblem"><Icon size={27} strokeWidth={1.35}/></span>
        <div className="sc-section-copy"><span className="sc-kicker">CAPACIDAD EN DESARROLLO</span><h2>{item.title}</h2><p>{item.description}</p></div>
        <div className="sc-module-footer"><span><span className="sc-muted-dot"/> Sin datos conectados</span><button type="button" onClick={() => navigate('resumen')}>Volver al resumen <ArrowRight size={16}/></button></div>
      </section>
      <aside className="sc-section-aside"><span className="sc-kicker">ESTRUCTURA PREVISTA</span><h3>Lo esencial, primero.</h3><div className="sc-capability-list">{item.upcoming.map((cap,i)=><div key={cap}><span>{String(i+1).padStart(2,'0')}</span><strong>{cap}</strong><ArrowDownRight size={17}/></div>)}</div><p>Vamos a activar estas funciones cuando existan datos, autorizaciones y pruebas que las respalden.</p></aside>
    </div>
  </div>
}

const isEditable = (target: EventTarget | null) => target instanceof HTMLElement &&
  (target.isContentEditable || ['INPUT','TEXTAREA','SELECT'].includes(target.tagName))

export default function CentralDashboardClient({ initialSection, adminEmail }: { initialSection: CentralSection; adminEmail: string }) {
  const [section, setSection] = useState<CentralSection>(initialSection)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(0)
  const [copied, setCopied] = useState(false)
  const searchInput = useRef<HTMLInputElement>(null)
  const searchTrigger = useRef<HTMLButtonElement>(null)

  const navigate = useCallback((next: CentralSection) => {
    setSection(next)
    setPaletteOpen(false)
    setMobileOpen(false)
    setQuery('')
    const path = next === 'resumen' ? '/admin' : '/admin?section=' + encodeURIComponent(next)
    if (window.location.pathname + window.location.search !== path) window.history.pushState({ snoSection: next }, '', path)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  useEffect(() => {
    const pop = () => {
      const requested = new URLSearchParams(window.location.search).get('section')
      const entry = NAV.find((item) => item.id === requested)
      setSection(entry?.id ?? 'resumen')
    }
    window.addEventListener('popstate', pop)
    return () => window.removeEventListener('popstate', pop)
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPaletteOpen((previous) => !previous)
      } else if (event.altKey && event.key.toLowerCase() === 'f') {
        event.preventDefault()
        setFocusMode((previous) => !previous)
      } else if (event.key === '/' && !isEditable(event.target) && !event.ctrlKey && !event.metaKey) {
        event.preventDefault()
        setPaletteOpen(true)
      } else if (event.key === 'Escape') {
        setPaletteOpen(false)
        setMobileOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (paletteOpen) {
      setHighlight(0)
      searchInput.current?.focus()
    } else {
      searchTrigger.current?.focus()
    }
  }, [paletteOpen])

  const results = useMemo(() => {
    const needle = query.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    if (!needle) return NAV
    return NAV.filter((item) => (item.label + ' ' + item.description)
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(needle))
  }, [query])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  const initial = adminEmail.trim().charAt(0).toUpperCase() || 'A'
  const firstGroup = NAV.slice(0,4)
  const secondGroup = NAV.slice(4)

  return <div className={'sc-shell' + (focusMode ? ' is-focus' : '')}>
    {mobileOpen && <button type="button" className="sc-backdrop" aria-label="Cerrar menú" onClick={() => setMobileOpen(false)}/>}
    <aside className={'sc-sidebar' + (mobileOpen ? ' is-mobile-open' : '')}>
      <div className="sc-sidebar-head"><Brand/><button className="sc-mobile-close" type="button" aria-label="Cerrar navegación" onClick={() => setMobileOpen(false)}><X size={20}/></button></div>
      <div className="sc-workspace"><span className="sc-workspace-avatar">S</span><span><strong>Espacio principal</strong><small>Administración general</small></span><ChevronDown size={15}/></div>
      <nav className="sc-nav" aria-label="Navegación de Central">
        <div className="sc-nav-group"><span className="sc-nav-heading">PLATAFORMA</span>{firstGroup.map(item=><NavButton key={item.id} item={item} selected={section===item.id} navigate={navigate}/>)}</div>
        <div className="sc-nav-group"><span className="sc-nav-heading">ADMINISTRACIÓN</span>{secondGroup.map(item=><NavButton key={item.id} item={item} selected={section===item.id} navigate={navigate}/>)}</div>
      </nav>
      <div className="sc-sidebar-bottom"><div className="sc-sidebar-note"><span className="sc-small-dot"/><div><strong>Central está operativo</strong><small>Sin integraciones conectadas</small></div></div><a href="/" className="sc-public-link" aria-label="Ir al sitio público de SNOOSERVICE"><ExternalLink size={15}/> Sitio público <ArrowUpRight size={14}/></a></div>
    </aside>
    <div className="sc-main">
      <header className="sc-header">
        <div className="sc-header-start">
          <button type="button" className="sc-icon-button sc-mobile-toggle" onClick={() => setMobileOpen(true)} aria-label="Abrir menú"><Menu size={19}/></button>
          <span className="sc-breadcrumb-muted">Central</span><ChevronRight className="sc-crumb-arrow" size={15}/><span className="sc-breadcrumb-active">{PAGES[section]}</span>
        </div>
        <div className="sc-header-actions">
          <button ref={searchTrigger} type="button" className="sc-search-trigger" onClick={() => setPaletteOpen(true)}><Search size={16}/><span>Buscar en Central</span><kbd>⌘ K</kbd></button>
          <button className="sc-icon-button sc-desktop-action" type="button" onClick={() => setFocusMode(v=>!v)} title={focusMode?'Salir de enfoque':'Modo enfoque'} aria-label={focusMode?'Salir de enfoque':'Modo enfoque'}>{focusMode ? <PanelLeftOpen size={18}/> : <PanelLeftClose size={18}/>}</button>
          <span className="sc-header-divider"/>
          <span className="sc-account-avatar" title={adminEmail}>{initial}</span>
          <form action={centralLogout}><button type="submit" className="sc-icon-button" aria-label="Cerrar sesión" title="Cerrar sesión"><LogOut size={18}/></button></form>
        </div>
      </header>

      <main className="sc-content" id="central-content">
        <div className="sc-content-tools"><span><ShieldCheck size={14}/> Sesión protegida con MFA</span><button type="button" onClick={copyLink}>{copied?<CheckCheck size={14}/>:<Copy size={14}/>} {copied?'Enlace copiado':'Copiar enlace'}</button></div>
        {section === 'resumen' ? <Overview navigate={navigate}/> : <SectionView section={section} navigate={navigate}/>}
      </main>
      <footer className="sc-footer"><span>SNOSERVICE · CENTRAL</span><span>Herramientas diseñadas para trabajar, no para decorar.</span></footer>
    </div>

    {paletteOpen && <div className="sc-palette-layer" role="presentation" onMouseDown={(e)=>{if(e.target===e.currentTarget)setPaletteOpen(false)}}>
      <div className="sc-palette" role="dialog" aria-modal="true" aria-labelledby="sc-command-title" onKeyDown={(event)=>{
        if(event.key==='ArrowDown'){event.preventDefault();setHighlight(i=>Math.min(i+1,results.length-1))}
        if(event.key==='ArrowUp'){event.preventDefault();setHighlight(i=>Math.max(i-1,0))}
        if(event.key==='Enter'&&results[highlight]){event.preventDefault();navigate(results[highlight].id)}
      }}>
        <div className="sc-palette-search"><Search size={20}/><label id="sc-command-title" className="sc-visually-hidden" htmlFor="sc-command-input">Buscar secciones</label><input id="sc-command-input" ref={searchInput} type="search" autoComplete="off" placeholder="¿A dónde querés ir?" value={query} onChange={e=>{setQuery(e.target.value);setHighlight(0)}}/><button type="button" onClick={()=>setPaletteOpen(false)} aria-label="Cerrar búsqueda"><X size={18}/></button></div>
        <div className="sc-palette-list">{results.length===0?<p className="sc-palette-empty">No encontramos esa sección.</p>:<><span className="sc-palette-label">IR A UNA SECCIÓN</span>{results.map((item,i)=>{const Icon=item.Icon;return <button type="button" key={item.id} onMouseEnter={()=>setHighlight(i)} onClick={()=>navigate(item.id)} className={'sc-palette-item'+(i===highlight?' is-highlighted':'')}><span className="sc-palette-icon"><Icon size={18}/></span><span><strong>{item.label}</strong><small>{item.description}</small></span><ArrowRight size={16}/></button>})}</>}</div>
        <div className="sc-palette-foot"><span><Keyboard size={15}/> ↑↓ navegar</span><span><kbd>↵</kbd> abrir</span><span><kbd>esc</kbd> cerrar</span></div>
      </div>
    </div>}
  </div>
}
