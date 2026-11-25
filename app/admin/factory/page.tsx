import { connection } from 'next/server'
import { redirect } from 'next/navigation'
import { requireCentralAdmin } from '../../../lib/central/auth'

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
  if (typeof request !== 'string' || request.trim().length < 10 || request.trim().length > 2000) redirect('/admin/factory?result=invalid')
  try {
    await requirePrivateQueue()
    await github('/issues', 'POST', { title: prefix + 'Análisis de Finanzas', body: marker + '\n' + request.trim() })
  } catch {
    redirect('/admin/factory?result=unavailable')
  }
  redirect('/admin/factory?result=queued')
}

export default async function FactoryPage({searchParams}: {searchParams: Promise<{result?: string}>}) {
  await connection()
  await requireCentralAdmin()
  const params = await searchParams
  let jobs: Job[] = []
  let ready = false
  try {
    await requirePrivateQueue()
    const data = await github('/issues?state=all&per_page=100&sort=created&direction=desc')
    if (!Array.isArray(data)) throw new Error('Invalid response')
    jobs = data.filter(isJob)
    ready = true
  } catch { /* Fail closed; never use a public queue or expose credentials. */ }

  return <main style={{maxWidth:960, margin:'0 auto', padding:'32px 20px', color:'#f5f7f5', minHeight:'100dvh', background:'#121212'}}>
    <a href="/admin?section=automatizaciones" style={{color:'#a9b4ae'}}>← Volver a Central</a>
    <p style={{color:'#1ECB62', letterSpacing:2, fontSize:12, marginTop:28}}>SNOSERVICE / AI FACTORY</p>
    <h1 style={{fontSize:'clamp(30px, 6vw, 48px)', margin:'8px 0'}}>Centro de desarrollo.</h1>
    <p style={{color:'#a9b4ae'}}>Piloto de análisis de código de Finanzas. El runner local trabaja con una copia del repositorio, sin cambios ni despliegues.</p>
    <section style={{border:'1px solid #303634', padding:20, borderRadius:14, marginTop:24, background:'#202326'}}>
      <strong style={{color:ready?'#1ECB62':'#e8b36b'}}>{ready?'Cola privada conectada':'Cola no configurada o no disponible'}</strong>
      <p style={{fontSize:13, color:'#a9b4ae'}}>La conexión de la cola no indica que tu PC esté encendida. Los informes se conservan localmente durante el piloto.</p>
      {params.result === 'queued' && <p role="status">Solicitud creada. Pendiente del runner.</p>}
      {params.result === 'invalid' && <p role="alert">Ingresá entre 10 y 2000 caracteres.</p>}
      {params.result === 'unavailable' && <p role="alert">No se pudo crear la solicitud. Revisá la configuración antes de reintentar.</p>}
      <form action={createJob} style={{display:'grid', gap:12, marginTop:18}}>
        <label htmlFor="factory-request">¿Qué querés que analicemos en Finanzas?</label>
        <textarea id="factory-request" name="request" minLength={10} maxLength={2000} required rows={5} disabled={!ready} placeholder="Describí el problema o la mejora, sin incluir contraseñas ni datos de usuarios." style={{background:'#121212', color:'#f5f7f5', border:'1px solid #414744', padding:12, borderRadius:8, width:'100%'}}/>
        <button disabled={!ready} type="submit" style={{background:ready?'#1ECB62':'#4a514e', color:'#101510', fontWeight:700, border:0, padding:14, borderRadius:8}}>Enviar análisis</button>
      </form>
    </section>
    <section style={{marginTop:32}}>
      <h2 style={{fontSize:24}}>Solicitudes recientes</h2>
      <a href="/admin/factory" style={{color:'#1ECB62'}}>Actualizar estado</a>
      {!jobs.length && <p style={{color:'#a9b4ae'}}>{ready?'Todavía no hay solicitudes.':'Historial no disponible.'}</p>}
      {jobs.map(job=><article key={job.number} style={{background:'#202326', borderRadius:12, padding:16, marginTop:12, overflowWrap:'anywhere'}}>
        <strong>#{job.number} · {job.state==='open'?'Pendiente o en ejecución':job.state_reason==='completed'?'Análisis terminado':'Bloqueada o cerrada'}</strong>
        <p style={{whiteSpace:'pre-wrap', color:'#d9dedb'}}>{job.body?.slice(marker.length+1)}</p>
        <small style={{color:'#a9b4ae'}}>{new Date(job.created_at).toLocaleString('es-UY',{timeZone:'America/Montevideo'})}</small>
      </article>)}
      <p style={{fontSize:12,color:'#a9b4ae'}}>Se muestran solicitudes de AI Factory entre los últimos 100 issues del repositorio privado.</p>
    </section>
  </main>
}
