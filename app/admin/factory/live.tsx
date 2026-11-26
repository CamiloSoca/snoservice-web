import { Activity, ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronRight, Circle, Clock, CreditCard, GitBranch, GitPullRequest, Home, LayoutGrid, LockKeyhole, Monitor, Package, Plus, Scissors, ShieldCheck, Workflow } from 'lucide-react'
import { redirect } from 'next/navigation'
import { requireCentralAdmin } from '../../../lib/central/auth'
import './workspace.css'

const QUEUE='CamiloSoca/Finanzas'
const MARK='SNOSERVICE_FACTORY_BUILD_V1\n'
const EVENT='SNOSERVICE_FACTORY_EVENT_V1\n'
const projects=[
{id:'finanzas',name:'Finanzas',repo:'Finanzas',base:'reconstruccion-node-supabase',icon:CreditCard,tone:'mint'},
{id:'maracana',name:'Maracaná',repo:'distribuidora-admin',base:'main',icon:Package,tone:'gold'},
{id:'central',name:'SNOSERVICE',repo:'snoservice-web',base:'main',icon:LayoutGrid,tone:'blue'},
{id:'cut',name:'13 CUT',repo:'snoservice',base:'main',icon:Scissors,tone:'violet'}] as const
type Project=typeof projects[number]
type Request={project:string;title:string;description:string;priority:string}
type Job={number:number;state:string;state_reason?:string;created_at:string;body:string;request:Request;project:Project}
type Entry={stage:string;message:string;pr?:string;commit?:string;created:string}
const stages=['Análisis','Desarrollo','Validación','Entrega']
type QueueFailureCode='missing'|'unauthorized'|'forbidden'|'rate'|'not-found'|'repository'|'network'|'response'|'http'
class QueueFailure extends Error {
 constructor(public readonly code:QueueFailureCode,public readonly operation:string,public readonly status?:number){super('Factory queue: '+code)}
}
const queueMessages:Record<QueueFailureCode,string>={
 missing:'Falta FACTORY_QUEUE_TOKEN en Vercel.',
 unauthorized:'GitHub rechazó el token (401). Puede haber vencido o haber sido revocado. Actualizá FACTORY_QUEUE_TOKEN en Vercel.',
 forbidden:'GitHub rechazó el acceso (403). Verificá los permisos del token en Finanzas y las restricciones de GitHub.',
 rate:'GitHub alcanzó un límite de solicitudes (403/429). Reintentá más tarde.',
 'not-found':'GitHub no encuentra el recurso o el token no tiene acceso a Finanzas (404).',
 repository:'La cola no cumple los requisitos de repositorio privado con Issues habilitados.',
 network:'No se pudo conectar con GitHub. Reintentá actualizando la página.',
 response:'GitHub devolvió una respuesta inesperada.',
 http:'GitHub devolvió un error HTTP.'
}
function diagnose(err:unknown,phase:string){
 const failure=err instanceof QueueFailure?err:new QueueFailure('response',phase)
 console.warn('[factory-queue]',{phase,code:failure.code,operation:failure.operation,status:failure.status})
 return queueMessages[failure.code]+(failure.code==='http'&&failure.status?' ('+failure.status+')':'')+' Paso: '+failure.operation+'.'
}
async function api(path:string,method='GET',body?:unknown){
 const operation=path===''?'Verificar repositorio':path.startsWith('/issues/')?'Consultar actividad':method==='POST'?'Crear solicitud':'Leer solicitudes'
 const token=process.env.FACTORY_QUEUE_TOKEN?.trim()
 if(!token)throw new QueueFailure('missing',operation)
 let response:Response
 try{
  response=await fetch('https://api.github.com/repos/'+QUEUE+path,{method,headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','Content-Type':'application/json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'SNOSERVICE-Factory'},cache:'no-store',redirect:'error',signal:AbortSignal.timeout(10000),...(body===undefined?{}:{body:JSON.stringify(body)})})
 }catch{throw new QueueFailure('network',operation)}
 if(!response.ok){
  const status=response.status
  const code=status===401?'unauthorized':status===404?'not-found':status===429||(status===403&&(response.headers.get('x-ratelimit-remaining')==='0'||response.headers.has('retry-after')))?'rate':status===403?'forbidden':'http'
  throw new QueueFailure(code,operation,status)
 }
 try{return await response.json()}catch{throw new QueueFailure('response',operation)}
}
async function privateQueue(){const r=await api('');if(r.private!==true||r.has_issues!==true||String(r.full_name).toLowerCase()!==QUEUE.toLowerCase())throw new QueueFailure('repository','Verificar repositorio')}
function parseJob(x:any):Job|null{
 if(x.pull_request||String(x.user?.login).toLowerCase()!=='camilosoca'||typeof x.body!=='string'||!x.body.startsWith(MARK)||!String(x.title).startsWith('[Factory BUILD] ')||!Number.isSafeInteger(x.number)||x.number<1)return null
 try{const request=JSON.parse(x.body.slice(MARK.length)) as Request;const project=projects.find(p=>p.id===request.project&&p.id!=='cut');if(!project||typeof request.title!=='string'||request.title.length>100||typeof request.description!=='string'||request.description.length>2000||!['Alta','Normal','Baja'].includes(request.priority))return null;return {...x,request,project}}catch{return null}
}
async function create(form:FormData){
 'use server'
 await requireCentralAdmin()
 const project=projects.find(p=>p.id===form.get('project')&&p.id!=='cut')
 const title=String(form.get('title')??'').trim(),description=String(form.get('description')??'').trim(),priority=String(form.get('priority')??'')
 if(!project||title.length<3||title.length>100||description.length<10||description.length>2000||!['Alta','Normal','Baja'].includes(priority))redirect('/admin/factory?result=invalid')
 let id=0
 try{await privateQueue();const r=await api('/issues','POST',{title:'[Factory BUILD] '+project.name+' · '+title,body:MARK+JSON.stringify({project:project.id,title,description,priority})});id=r.number;if(!Number.isSafeInteger(id)||id<1)throw Error('Invalid issue')}catch(err){diagnose(err,'create');redirect('/admin/factory?result=error')}
 redirect('/admin/factory?job='+id+'&result=created#detail')
}
function Icon({p}:{p:Project}){return <span className={'f2-project-icon '+p.tone}><p.icon size={19}/></span>}
export default async function LiveWorkspace({params}:{params:{project?:string;job?:string;result?:string;view?:string}}){
 let jobs:Job[]=[],ready=false,queueError=''
 try{await privateQueue();const items=await api('/issues?state=all&per_page=100&sort=created&direction=desc');if(!Array.isArray(items))throw Error();jobs=items.map(parseJob).filter((j):j is Job=>j!==null);ready=true}catch(err){queueError=diagnose(err,'read')}
 const p=projects.find(x=>x.id===params.project)
 const visible=jobs.filter(j=>!p||j.project.id===p.id)
 const selected=visible.find(j=>String(j.number)===params.job)??visible[0]
 let entries:Entry[]=[]
 if(selected&&ready){try{const comments=await api('/issues/'+selected.number+'/comments?per_page=100&sort=created&direction=asc');if(Array.isArray(comments))for(const c of comments){if(String(c.user?.login).toLowerCase()!=='camilosoca'||typeof c.body!=='string'||!c.body.startsWith(EVENT)||c.body.length>16000)continue;try{const e=JSON.parse(c.body.slice(EVENT.length));if(e.issue!==selected.number||!['analyze','develop','validate','review','blocked'].includes(e.stage)||typeof e.message!=='string')continue;const urlPrefix='https://github.com/CamiloSoca/'+selected.project.repo+'/pull/';const pr=typeof e.pr==='string'&&e.pr.startsWith(urlPrefix)&&/^[0-9]+$/.test(e.pr.slice(urlPrefix.length))?e.pr:undefined;entries.push({stage:e.stage,message:e.message.slice(0,5000),pr,commit:typeof e.commit==='string'&&/^[a-f0-9]{40}$/.test(e.commit)?e.commit:undefined,created:c.created_at})}catch{}}}catch{}}
 const last=entries.at(-1)
 const stage=last?.stage==='review'?4:last?.stage==='validate'?2:last?.stage==='develop'?1:last?.stage==='analyze'?0:-1
 const label=last?.stage==='review'&&last.pr?'PR preparada':last?.stage==='blocked'?'Bloqueada':selected?.state==='closed'?'Cerrada':last?'En ejecución (último evento)':'En cola / sin confirmación'
 const view=params.view==='new'?'new':'work'
 const href=(id?:string,job?:number)=>'/admin/factory'+(id||job?'?'+[id?'project='+id:'',job?'job='+job:''].filter(Boolean).join('&'):'')
 return <div className="f2"><aside className="f2-sidebar"><a className="f2-brand" href="/admin/factory"><img src="/logo.png" alt="SNOSERVICE"/><span><strong>SNOSERVICE</strong><small>FACTORY</small></span></a><span className="f2-nav-label">WORKSPACE</span><nav><a className="f2-secondary" href="/admin/factory"><Home size={17}/> Centro de operaciones</a><a className="f2-secondary" href="/admin/factory?view=new"><Plus size={17}/> Nueva tarea</a></nav><span className="f2-nav-label">PROYECTOS</span><div className="f2-side-projects">{projects.map(x=><a className="f2-secondary" key={x.id} href={href(x.id)}><x.icon size={16}/>{x.name}{x.id==='cut'&&<LockKeyhole size={13}/>}</a>)}</div><div className="f2-sidebar-foot"><a href="/admin?section=automatizaciones"><ArrowLeft size={15}/> Volver a Central</a></div></aside>
 <main className="f2-main"><header className="f2-header"><div className="f2-breadcrumb"><span>Workspace</span><ChevronRight size={13}/><strong>Factory</strong></div><div className="f2-header-actions"><a className="f2-pilot" href="/admin?section=automatizaciones">Central <ArrowUpRight size={13}/></a><a className="f2-primary" href={'/admin/factory?view=new'+(p&&p.id!=='cut'?'&project='+p.id:'')}><Plus size={17}/> Nueva tarea</a></div></header>
 <div className="f2-content"><div className="f2-demo-banner"><span>{ready?'● Cola privada conectada':'○ Cola no disponible'}</span><small>Motor local: conexión no verificada · Runner v0.4.1</small></div>{queueError&&<div role="alert" className="f2-note" style={{padding:'12px 14px',border:'1px solid #765f3b',borderRadius:8,background:'#2c251a',color:'#ecd1a0',marginTop:12}}><strong>Diagnóstico de la cola</strong><p style={{margin:'5px 0'}}>{queueError}</p><a href="https://vercel.com/snoservice/snoservice-web/settings/environment-variables" target="_blank" rel="noreferrer" style={{textDecoration:'underline'}}>Configuración de variables en Vercel</a></div>}<div className="f2-heading"><div><span className="f2-kicker">SNOSERVICE / DEVELOPMENT</span><h1>Centro de operaciones<span>.</span></h1><p>Desarrollo real en ramas aisladas. Entregas mediante pull request.</p></div><a className="f2-secondary" href={href(p?.id,selected?.number)}><Activity size={15}/> Actualizar</a></div>
 <div className="f2-project-strip">{projects.map(x=><a className="f2-secondary" key={x.id} href={href(x.id)}><Icon p={x}/><span>{x.name}<small>{x.id==='cut'?'Protegido':x.base}</small></span></a>)}</div>
 <div className="f2-metrics"><div><LayoutGrid size={19}/><span><strong>3</strong><small>Proyectos habilitados</small></span></div><div><Clock size={19}/><span><strong>{ready?jobs.filter(j=>j.state==='open').length:'—'}</strong><small>Abiertas</small></span></div><div><GitPullRequest size={19}/><span><strong>{ready?jobs.filter(j=>j.state==='closed'&&j.state_reason==='completed').length:'—'}</strong><small>Cerradas como completadas</small></span></div><div><ShieldCheck size={19}/><span><strong>{ready?jobs.filter(j=>j.state==='closed'&&j.state_reason!=='completed').length:'—'}</strong><small>Otras cerradas</small></span></div></div>
 {params.result&&<p className="f2-protected" role="status">{params.result==='created'?'Tarea real guardada. El runner v0.4 la recogerá cuando esté activo.':params.result==='invalid'?'Revisá los campos.':'No se pudo crear la tarea.'}</p>}
 {view==='new'?<section className="f2-detail"><h2>Nueva tarea de desarrollo</h2><form action={create} className="f2-modal" style={{width:'100%',maxWidth:650,boxShadow:'none'}}><label>Proyecto<select name="project" defaultValue={p?.id==='cut'?'finanzas':p?.id??'finanzas'}>{projects.map(x=><option key={x.id} value={x.id} disabled={x.id==='cut'}>{x.name}{x.id==='cut'?' · protegido':''}</option>)}</select></label><label>Título<input name="title" required minLength={3} maxLength={100}/></label><label>Descripción<textarea name="description" required minLength={10} maxLength={2000} placeholder="Qué cambiar y cómo verificar el resultado…"/></label><label>Prioridad<select name="priority" defaultValue="Normal"><option>Alta</option><option>Normal</option><option>Baja</option></select></label><p className="f2-note">No incluyas secretos ni datos de clientes. El motor modificará una copia del código y preparará una PR sin fusionarla. SNOSERVICE tiene un repositorio público: los cambios de su rama y PR serán públicos.</p><button className="f2-primary" disabled={!ready}>Enviar a desarrollo <ArrowRight size={17}/></button></form></section>:<div className="f2-work show-detail" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,340px),1fr))'}}><section className="f2-queue"><div className="f2-panel-title"><h2>{p?.name??'Cola de trabajo'}</h2><a href="/admin/factory">Todas</a></div>{!visible.length&&<div className="f2-empty">{p?.id==='cut'?'13 CUT no está habilitado para desarrollo automático.':ready?'Todavía no hay tareas reales. Creá la primera.':'Historial no disponible.'}</div>}{visible.map(j=><a className={'f2-task '+(j.number===selected?.number?'selected':'')} key={j.number} href={href(p?.id,j.number)+'#detail'}><Icon p={j.project}/><span className="f2-task-copy"><small>{j.project.name} · FAC-{j.number}</small><strong>{j.request.title}</strong><span>Prioridad {j.request.priority.toLowerCase()}</span></span><span className="f2-state">{j.state==='open'?'Abierta':j.state_reason==='completed'?'Completada':'Cerrada'}</span><ChevronRight size={15}/></a>)}</section><section className="f2-detail" id="detail">{selected?<><div className="f2-detail-meta"><Icon p={selected.project}/><span>{selected.project.name} · FAC-{selected.number}</span><span className="f2-tag">{label}</span></div><h2>{selected.request.title}</h2><p className="f2-desc" style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{selected.request.description}</p><div className="f2-pipeline" style={{gridTemplateColumns:'repeat(4,minmax(0,1fr))'}}>{stages.map((s,i)=><div key={s} className={stage>i?'done':stage===i?'running':''}><span>{stage>i?<Check size={16}/>:stage===i?<Activity size={15}/>:<Circle size={12}/>}</span><small>{s}</small></div>)}</div><div className="f2-branch"><GitBranch size={15}/><span>Base: {selected.project.base}</span></div><div className="f2-tab-body"><div className="f2-subheading"><Activity size={17}/><strong>Actividad registrada</strong></div><div className="f2-events">{entries.length?entries.map((e,i)=><div key={i}><span className="f2-event-dot"/><div><strong>{e.stage}</strong><p style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{e.message}</p><small>{new Date(e.created).toLocaleString('es-UY',{timeZone:'America/Montevideo'})}</small>{e.pr&&<p><a href={e.pr} target="_blank" rel="noreferrer" className="f2-primary">Revisar pull request <ArrowUpRight size={15}/></a></p>}</div></div>):<p className="f2-note">Todavía no se recibió actividad del runner.</p>}</div></div><a className="f2-secondary" href={'https://github.com/'+QUEUE+'/issues/'+selected.number} target="_blank" rel="noreferrer">Ver solicitud privada <ArrowUpRight size={14}/></a></>:<div className="f2-empty">Elegí una tarea para consultar su actividad y entrega.</div>}<div className="f2-protected"><ShieldCheck size={19}/><div><strong>Sin merge automático</strong><small>Revisá el diff y las pruebas en GitHub antes de publicar.</small></div></div></section></div>}
 <footer className="f2-footer"><span><Monitor size={16}/> Runner v0.4 requerido</span><span><ShieldCheck size={16}/> Sin acceso a 13 CUT</span><a href="https://github.com/CamiloSoca/Finanzas/issues?q=is%3Aissue+%22AI+Factory%22" target="_blank" rel="noreferrer">Historial de análisis anteriores <ArrowUpRight size={13}/></a></footer></div></main></div>
}
