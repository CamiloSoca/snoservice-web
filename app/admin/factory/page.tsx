export const instant = false

import { Activity, ArrowRight, ArrowUpRight, ChevronRight, CreditCard, LayoutGrid, LockKeyhole, Package, Scissors, ShieldCheck, Workflow } from 'lucide-react'
import { connection } from 'next/server'
import { redirect } from 'next/navigation'
import { requireCentralAdmin } from '../../../lib/central/auth'
import './factory.css'

const repo = 'CamiloSoca/Finanzas'
const prefix = '[AI Factory] '
const marker = 'SNOSERVICE_FACTORY_AUDIT_V1'
type Job = { number: number; title: string; body: string | null; state: string; state_reason: string | null; created_at: string; user?: { login: string }; pull_request?: unknown }

async function github(path: string, method = 'GET', body?: unknown) {
  const token = process.env.FACTORY_QUEUE_TOKEN
  if (!token) throw new Error('Queue not configured')
  const res = await fetch('https://api.github.com/repos/' + repo + path, {
    method, headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
    cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(10000),
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
  if (!res.ok) throw new Error('Queue unavailable')
  return res.json()
}

async function requirePrivateQueue() {
  const info = await github('')
  if (info.private !== true || info.has_issues !== true || String(info.full_name).toLowerCase() !== repo.toLowerCase()) throw new Error('Private queue unavailable')
}

function isJob(job: Job) {
  return !job.pull_request && job.user?.login?.toLowerCase() === 'camilosoca' && job.title.startsWith(prefix) && job.body?.startsWith(marker + '\n')
}

async function createJob(form: FormData) {
  'use server'
  await requireCentralAdmin()
  const request = form.get('request')
  if (form.get('project') !== 'finanzas') redirect('/admin/factory?result=invalid')
  if (typeof request !== 'string' || request.trim().length < 10 || request.trim().length > 2000) redirect('/admin/factory?result=invalid')
  try {
    await requirePrivateQueue()
    await github('/issues', 'POST', { title: prefix + 'Análisis de Finanzas', body: marker + '\n' + request.trim() })
  } catch {
    redirect('/admin/factory?result=unavailable')
  }
  redirect('/admin/factory?result=queued')
}

const projects = [
  {id:'finanzas',name:'Finanzas',description:'Finanzas personales',repository:'CamiloSoca/Finanzas',branch:'reconstruccion-node-supabase',Icon:CreditCard,tone:'mint',state:'pilot'},
  {id:'maracana',name:'Maracaná',description:'Gestión de distribuidora',repository:'CamiloSoca/distribuidora-admin',branch:'main',Icon:Package,tone:'amber',state:'pending'},
  {id:'central',name:'SNOSERVICE',description:'Panel central y sitio web',repository:'CamiloSoca/snoservice-web',branch:'main',Icon:LayoutGrid,tone:'blue',state:'pending'},
  {id:'13-cut',name:'13 CUT',description:'Sistema de barbería',repository:'CamiloSoca/snoservice',branch:'main',Icon:Scissors,tone:'violet',state:'protected'},
] as const

export default async function FactoryPage({searchParams}: {searchParams: Promise<{result?: string;project?: string;status?: string;report?: string}>}) {
  await connection()
  await requireCentralAdmin()
  const params = await searchParams
  const project = projects.find(p=>p.id===params.project) ?? projects[0]
  const isFinance = project.id === 'finanzas'
  const filter = ['open','completed','blocked'].includes(params.status ?? '') ? params.status : 'all'
  let jobs: Job[] = []
  let ready = false
  try {
    await requirePrivateQueue()
    const data = await github('/issues?state=all&per_page=100&sort=created&direction=desc')
    if (!Array.isArray(data)) throw new Error('Invalid response')
    jobs = data.filter(isJob)
    ready = true
  } catch { /* Never expose token or switch to public queue. */ }
  const reportJob = isFinance && ready && typeof params.report === 'string' && /^[1-9][0-9]{0,9}$/.test(params.report) ? jobs.find(j=>j.number===Number(params.report)) : undefined
  let report: {status:string;commit:string;text:string}|null=null
  if (reportJob) {
    try {
      const comments = await github('/issues/'+reportJob.number+'/comments?per_page=100&sort=created&direction=desc')
      if (Array.isArray(comments)) {
        for (const comment of comments) {
          if (String(comment.user?.login ?? '').toLowerCase()!=='camilosoca' || typeof comment.body!=='string' || comment.body.length>24500) continue
          const parts=comment.body.match(/^SNOSERVICE_FACTORY_REPORT_V1\nISSUE: ([0-9]+)\nCOMMIT: ([0-9a-f]{40,64})\nSTATUS: (ANALYZED|BLOCKED)\n\n([\s\S]*)$/)
          if(parts && Number(parts[1])===reportJob.number) {report={commit:parts[2],status:parts[3],text:parts[4]};break}
        }
      }
    } catch { /* Reports remain unavailable without verified private access. */ }
  }
  const completed=jobs.filter(j=>j.state==='closed'&&j.state_reason==='completed').length
  const pending=jobs.filter(j=>j.state==='open').length
  const blocked=jobs.length-completed-pending
  const visible = isFinance ? jobs.filter(j=>filter==='all'||(filter==='open'&&j.state==='open')||(filter==='completed'&&j.state==='closed'&&j.state_reason==='completed')||(filter==='blocked'&&j.state==='closed'&&j.state_reason!=='completed')) : []
  const canSubmit=isFinance&&ready
  const ProjectIcon=project.Icon
  return <main className="af-shell">
    <header className="af-top"><div className="af-top-inner">
      <a className="af-brand" href="/admin?section=automatizaciones"><span className="af-logo"><Workflow size={23}/></span><span><strong>AI Factory</strong><small>SNOSERVICE / WORKSPACE</small></span></a>
      <div className="af-top-right"><span className={'af-connection '+(ready?'af-live':'')}><i/>{ready?'Cola conectada':'Sin conexión'}</span><a className="af-back" href="/admin?section=automatizaciones">Central <ArrowUpRight size={14}/></a></div>
    </div></header>
    <div className="af-content">
      <a href="/admin/factory/v2" style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,padding:"13px 15px",border:"1px solid #42664d",borderRadius:10,background:"#1b2b21",color:"#b8e8c7",marginBottom:20,fontSize:13,fontWeight:650}}><span>Explorar Factory 2.0 · Prototipo interactivo</span><ArrowRight size={17}/></a>
      <div className="af-hero"><div><span className="af-kicker">01 / DEVELOPMENT WORKSPACE</span><h1>Tu centro de<br className="af-mobile-break"/> desarrollo<span>.</span></h1><p>Proyectos, tareas y agentes en un solo lugar.</p></div><a className="af-refresh" href={'/admin/factory?project='+project.id}><Activity size={16}/> Actualizar</a></div>
      <section className="af-metrics" aria-label="Resumen de la fábrica">
        <div><span>Proyectos</span><strong>{String(projects.length).padStart(2,'0')}</strong><small>Registrados</small></div>
        <div><span>Pendientes</span><strong>{ready?String(pending).padStart(2,'0'):'—'}</strong><small>Cola de Finanzas</small></div>
        <div><span>Terminadas</span><strong>{ready?String(completed).padStart(2,'0'):'—'}</strong><small>Análisis</small></div>
        <div><span>Bloqueadas</span><strong>{ready?String(blocked).padStart(2,'0'):'—'}</strong><small>Otras cerradas</small></div>
      </section>
      <div className="af-section-head"><div><span className="af-kicker">02 / REPOSITORIOS</span><h2>Mis proyectos</h2></div><span className="af-muted">4 registrados</span></div>
      <section className="af-projects" aria-label="Seleccionar proyecto">
        {projects.map(p=>{const Icon=p.Icon;return <a key={p.id} href={'/admin/factory?project='+p.id} aria-current={project.id===p.id?'page':undefined} className={'af-project '+(project.id===p.id?'af-selected':'')}>
          <div className="af-project-top"><span className={'af-project-icon af-'+p.tone}><Icon size={21}/></span><span className={'af-project-state '+(p.state==='pilot'&&ready?'af-green':'')}>{p.state==='pilot'?(ready?'Piloto activo':'Sin conexión'):p.state==='protected'?'Protegido':'Pendiente'}</span></div>
          <h3>{p.name}</h3><p>{p.description}</p><div className="af-project-bottom"><span title={p.branch}>{p.branch}</span><ChevronRight size={16}/></div>
        </a>})}
      </section>
      <div className="af-work-grid">
        <section className="af-panel" id="new-task"><div className="af-panel-head"><span className={'af-project-icon af-'+project.tone}><ProjectIcon size={20}/></span><div><span className="af-kicker">03 / NUEVA SOLICITUD</span><h2>{project.name}</h2></div></div>
          <div className="af-repo"><span>GitHub · {project.repository.split('/')[1]}</span><a href={'https://github.com/'+project.repository} target="_blank" rel="noopener noreferrer">Repositorio <ArrowUpRight size={13}/></a></div>
          {isFinance ? <><p className="af-muted">Modo análisis de deudas y cuotas. No escribe código ni despliega.</p>
            {params.result==='queued'&&<p className="af-feedback af-green" role="status">Solicitud creada. Pendiente del runner.</p>}
            {params.result==='invalid'&&<p className="af-feedback" role="alert">Revisá el proyecto y el texto (10 a 2000 caracteres).</p>}
            {params.result==='unavailable'&&<p className="af-feedback" role="alert">No se pudo crear la solicitud. Revisá la conexión.</p>}
            <form action={createJob} className="af-form">
              <input type="hidden" name="project" value="finanzas"/>
              <label htmlFor="factory-request">¿Qué querés analizar?</label>
              <textarea id="factory-request" name="request" rows={4} minLength={10} maxLength={2000} required disabled={!canSubmit} placeholder="Describí el problema o la mejora…"/>
              <div className="af-form-foot"><span>Sin secretos ni datos personales.</span><button type="submit" disabled={!canSubmit}>Enviar análisis <ArrowRight size={17}/></button></div>
            </form></> : <div className="af-not-ready"><LockKeyhole size={23}/><strong>{project.state==='protected'?'Proyecto protegido':'Runner pendiente de conectar'}</strong><p>{project.state==='protected'?'13 CUT requiere autorización específica antes de habilitar agentes. No se ejecutarán tareas ni cambios en el cliente.':'El proyecto ya está registrado. Todavía no tiene un runner habilitado; no se enviarán solicitudes a Finanzas por error.'}</p></div>}
        </section>
        <aside className="af-panel af-runtime"><span className="af-kicker">04 / EJECUCIÓN</span><h2>Motor de trabajo</h2><div className="af-runtime-row"><span className="af-runtime-icon"><Workflow size={19}/></span><div><strong>Codex local</strong><small>Autenticación desde tu PC</small></div></div><div className="af-runtime-row"><span className="af-runtime-icon"><Activity size={19}/></span><div><strong>Estado del runner</strong><small>No verificado en vivo · consulta cada 30 s con v0.3</small></div></div><div className="af-runtime-row"><span className="af-runtime-icon"><ShieldCheck size={19}/></span><div><strong>Solo lectura</strong><small>Sin despliegues automáticos</small></div></div><div className="af-runtime-note">Con Runner v0.3 activo, las tareas se procesan automáticamente y el informe se publica en la cola privada. Hasta 3 intentos diarios por instalación. La PC debe permanecer encendida.</div></aside>
      </div>
      {reportJob&&<section className="af-panel" id="report" style={{marginBottom:24}}><div className="af-section-head"><div><span className="af-kicker">INFORME / SOLICITUD #{reportJob.number}</span><h2>{report?.status==='ANALYZED'?'Análisis para revisar':report?.status==='BLOCKED'?'Ejecución bloqueada':'Informe'}</h2></div><a className="af-refresh" href="/admin/factory?project=finanzas">Cerrar</a></div>{report?<><p className="af-muted">Commit {report.commit.slice(0,12)} · {report.status==='ANALYZED'?'Requiere revisión humana. Las pruebas no se ejecutaron.':'Revisá el motivo antes de crear otra tarea.'}</p><div style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere',fontSize:13,lineHeight:1.7,color:'#c8d3cb'}}>{report.text}</div></>:<p className="af-muted">Todavía no hay un informe publicado. Los informes de las versiones anteriores permanecen en la PC.</p>}</section>}
      <section className="af-history"><div className="af-section-head"><div><span className="af-kicker">05 / ACTIVIDAD</span><h2>Solicitudes · {project.name}</h2></div><span className="af-muted">{isFinance&&ready?jobs.length+' registradas':'—'}</span></div>
        {isFinance&&ready&&<nav className="af-tabs" aria-label="Filtrar solicitudes">{[['all','Todas'],['open','Pendientes'],['completed','Terminadas'],['blocked','Bloqueadas']].map(([id,label])=><a key={id} aria-current={filter===id?'page':undefined} href={'/admin/factory?project=finanzas&status='+id}>{label}</a>)}</nav>}
        {!visible.length&&<div className="af-empty"><Activity size={23}/><span>{!isFinance?'No hay un historial conectado para este proyecto.':ready?'No hay solicitudes en esta vista.':'Historial no disponible.'}</span></div>}
        {visible.map(job=>{const status=job.state==='open'?'Pendiente':job.state_reason==='completed'?'Terminada':'Bloqueada / cerrada';return <details className="af-job" key={job.number}><summary><span className={'af-job-mark '+(status==='Terminada'?'af-green':'')}>#{job.number}</span><span className="af-job-title"><strong>{job.title.slice(prefix.length)}</strong><small>{new Date(job.created_at).toLocaleString('es-UY',{timeZone:'America/Montevideo'})}</small></span><span className={'af-job-state '+(status==='Terminada'?'af-green':'')}>{status}</span><ChevronRight className="af-job-chevron" size={16}/></summary><p>{job.body?.slice(marker.length+1)}</p><a href={'/admin/factory?project=finanzas&report='+job.number+'#report'}>Ver informe <ArrowRight size={14}/></a><a href={'https://github.com/'+repo+'/issues/'+job.number} target="_blank" rel="noopener noreferrer">Ver solicitud en GitHub <ArrowUpRight size={14}/></a></details>})}
        {isFinance&&<p className="af-history-note">Historial de la cola privada · hasta los últimos 100 issues.</p>}
      </section>
      <footer className="af-footer"><span>SNOSERVICE / AI FACTORY</span><span><ShieldCheck size={14}/> Acceso administrativo</span></footer>
    </div>
  </main>
}
