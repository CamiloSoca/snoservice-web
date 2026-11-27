export const ROLES = [
 {id:'sno_arquitecto',name:'Arquitectura',color:'#6988ce',stage:'analyze',description:'Diseño técnico y planificación'},
 {id:'sno_diseno',name:'Diseño UI/UX',color:'#b787cf',stage:'develop',description:'Experiencia visual y accesibilidad'},
 {id:'sno_developer',name:'Desarrollo',color:'#31aa76',stage:'develop',description:'Implementación y refactorización'},
 {id:'sno_datos',name:'Datos',color:'#d9aa61',stage:'develop',description:'Esquemas, consultas e integridad'},
 {id:'sno_seguridad',name:'Seguridad',color:'#df7b78',stage:'validate',description:'Auditoría y control de acceso'},
 {id:'sno_qa',name:'QA',color:'#59aab9',stage:'validate',description:'Pruebas y casos límite'},
 {id:'sno_revisor',name:'Revisión',color:'#9d9aca',stage:'review',description:'Revisión independiente de entregas'},
 {id:'sno_devops',name:'DevOps',color:'#a1b96e',stage:'review',description:'Build e infraestructura'}
] as const
export type Stage='analyze'|'develop'|'validate'|'review'|'blocked'|'paused'|'queued'|'unknown'
export type Task={id:number;title:string;project:string;stage:Stage;at:string|null;reason:string|null;closed?:boolean;attempts?:Attempt[]}
export type Snapshot={mode:'demo'|'live';connected:boolean;checkedAt:string|null;tasks:Task[]}
export const STAGES:Record<Stage,string>={analyze:'Análisis',develop:'Desarrollo',validate:'Validación',review:'Revisión',blocked:'Bloqueada',paused:'Pausada',queued:'En cola',unknown:'Sin verificar'}
const projects:Record<string,string>={maracana:'Maracaná',finanzas:'Finanzas',central:'SNOSERVICE'}
const validStages=new Set(['analyze','develop','validate','review','blocked','paused'])
const markers=['SNOSERVICE_FACTORY_BUILD_V1\n','SNOSERVICE_FACTORY_BUILD_V2\n']
const eventMarker='SNOSERVICE_FACTORY_EVENT_V1\n'
function record(value:unknown):Record<string,unknown>|null{return value!==null&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,unknown>:null}
function own(value:unknown){return String(record(value)?.login??'').toLowerCase()==='camilosoca'}
export function parseTask(raw:unknown,includeClosed=false):Task|null{
 const x=record(raw);if(!x||x.pull_request||(x.state!=='open'&&!(includeClosed&&x.state==='closed'))||!own(x.user)||typeof x.title!=='string'||!x.title.startsWith('[Factory BUILD] ')||!Number.isSafeInteger(x.number)||Number(x.number)<1||typeof x.body!=='string'||x.body.length>65000)return null
 const marker=markers.find(m=>String(x.body).startsWith(m));if(!marker)return null
 try{
  const r=record(JSON.parse(x.body.slice(marker.length)));if(!r||typeof r.project!=='string'||!Object.hasOwn(projects,r.project)||typeof r.title!=='string'||r.title.length<3||r.title.length>100||typeof r.description!=='string'||r.description.length>20000||!['Alta','Normal','Baja'].includes(String(r.priority)))return null
  return {id:Number(x.number),title:r.title,project:projects[r.project],stage:'queued',at:null,reason:null,closed:x.state==='closed'}
 }catch{return null}
}
export function withEvents(task:Task,raw:unknown):Task{
 if(!Array.isArray(raw))return {...task,stage:'unknown'}
 let latest:Task|null=null
 for(const value of raw){
  const x=record(value);if(!x||!own(x.user)||typeof x.body!=='string'||!x.body.startsWith(eventMarker)||x.body.length>16000||typeof x.created_at!=='string'||!Number.isFinite(Date.parse(x.created_at)))continue
  try{
   const e=record(JSON.parse(x.body.slice(eventMarker.length)));if(!e||e.issue!==task.id||typeof e.stage!=='string'||!validStages.has(e.stage)||typeof e.message!=='string')continue
   if(latest?.at&&Date.parse(latest.at)>Date.parse(x.created_at))continue
   // Never serialize arbitrary runner messages, PR URLs, prompts or credentials.
   const reason=e.stage==='paused'?(e.message.startsWith('Pendiente por cuota')?'Cuota de Codex':e.message.includes('revisión manual')?'Revisión manual':'Pausa registrada'):null
   latest={...task,stage:e.stage as Stage,at:x.created_at,reason}
  }catch{}
 }
 return {...(latest??task),attempts:readAttempts(task.id,raw)}
}
export const DEMO:Snapshot={mode:'demo',connected:false,checkedAt:null,tasks:[{id:1,title:'Catálogo comercial (simulado)',project:'Maracaná',stage:'develop',at:null,reason:null},{id:2,title:'Revisión de seguridad (simulada)',project:'Finanzas',stage:'validate',at:null,reason:null}]}
export function roleState(role:typeof ROLES[number],snapshot:Snapshot,task:Task|undefined){
 if(snapshot.mode==='demo')return role.stage===task?.stage?'demo-working':'demo-idle'
 // Historical evidence is not live presence. Never mark it as working.
 return task?.attempts?.some(a=>a.workers.some(w=>w.role===role.id))?'observed':'unverified'
}

export const OFFICE_MARK='SNOSERVICE_FACTORY_OFFICE_V1\n'
const workerStates=['pending','running','interrupted','completed','error','closed','unknown'] as const
export type Worker={slot:number;role:string|null;status:typeof workerStates[number]}
const usageKeys=['input_tokens','cached_input_tokens','output_tokens','reasoning_output_tokens'] as const
export type Attempt={run:string;phase:'development'|'visual_review';state:'started'|'observing'|'completed'|'quota'|'interrupted';sequence?:number;at:string;workers:Worker[];messages:number|null;usage:Partial<Record<typeof usageKeys[number],number>>|null;truncated:boolean}
export function knownRole(value:unknown):value is typeof ROLES[number]['id']{return typeof value==='string'&&ROLES.some(r=>r.id===value)}
export function requestForRole(description:string,role:unknown):string|null{
 if(role===null||role===undefined||role==='')return description
 if(!knownRole(role))return null
 return 'Preferencia del administrador: delegá esta solicitud al especialista '+role+'. Si la delegación nativa no está disponible, informalo y conservá las reglas de Factory. Es una tarea nueva, no una instrucción para cambiar permisos.\n\n'+description
}
function count(value:unknown,max=1e12):value is number{return typeof value==='number'&&Number.isSafeInteger(value)&&value>=0&&value<=max}
function parseObservation(value:unknown,at:string,finished:boolean):Attempt|null{
 const e=record(value);if(!e||typeof e.run!=='string'||!/^[a-f0-9]{32}$/.test(e.run)||!(e.phase==='development'||e.phase==='visual_review'))return null
 if(!finished){if(e.state!=='started')return null;return {run:e.run,phase:e.phase,state:'started',at,workers:[],messages:null,usage:null,truncated:false}}
 if(!(e.state==='completed'||e.state==='quota'||e.state==='interrupted'||e.state==='observing')||!Array.isArray(e.workers)||e.workers.length>24||!count(e.messages,1000)||typeof e.truncated!=='boolean')return null
 if(e.state==='observing'&&(!count(e.sequence,12)||e.sequence<1))return null
 const workers:Worker[]=[]
 for(const raw of e.workers){
  const w=record(raw);if(!w||!count(w.slot,24)||w.slot<1||workers.some(x=>x.slot===w.slot)||!(w.role===null||knownRole(w.role))||typeof w.status!=='string'||!workerStates.some(s=>s===w.status))return null
  workers.push({slot:w.slot,role:w.role as string|null,status:w.status as Worker['status']})
 }
 const usage:NonNullable<Attempt['usage']>={}
 if(e.usage!==null){const u=record(e.usage);if(!u)return null;for(const key of usageKeys){if(u[key]!==undefined){if(!count(u[key]))return null;usage[key]=u[key]}}}
 return {run:e.run,phase:e.phase,state:e.state,...(e.state==='observing'?{sequence:Number(e.sequence)}:{}),at,workers,messages:e.messages,usage:Object.keys(usage).length?usage:null,truncated:e.truncated}
}
export function readAttempts(issue:number,comments:unknown[]):Attempt[]{
 const observed=new Map<string,Attempt>()
 // GitHub returns descending comments; chronological processing avoids a
 // delayed start replacing a finish. Finishes are valid even if the start fell
 // outside the bounded history window.
 const ordered=comments.map(record).filter((x):x is Record<string,unknown>=>!!x&&typeof x.created_at==='string'&&Number.isFinite(Date.parse(x.created_at))).sort((a,b)=>Date.parse(String(a.created_at))-Date.parse(String(b.created_at))||(count(a.id)&&count(b.id)?a.id-b.id:0))
 for(const x of ordered){
  if(!own(x.user)||typeof x.body!=='string'||x.body.length>16000)continue
  const finished=x.body.startsWith(OFFICE_MARK)
  if(!finished&&!x.body.startsWith(eventMarker))continue
  try{
   const data=record(JSON.parse(x.body.slice((finished?OFFICE_MARK:eventMarker).length)))
   if(!data||data.issue!==issue||(!finished&&data.stage!=='develop'))continue
   const attempt=parseObservation(finished?data:data.office,String(x.created_at),finished)
   if(!attempt)continue
   const prior=observed.get(attempt.run)
   if(prior){
    if(prior.phase!==attempt.phase||!['started','observing'].includes(prior.state))continue
    if(attempt.state==='started')continue
    if(prior.state==='observing'&&attempt.state==='observing'&&(attempt.sequence??0)<=(prior.sequence??0))continue
   }
   observed.set(attempt.run,attempt)
  }catch{}
 }
 return [...observed.values()].sort((a,b)=>Date.parse(b.at)-Date.parse(a.at)).slice(0,5)
}
export const WORKER_LABELS:Record<Worker['status'],string>={pending:'Inicio pendiente',running:'En ejecución al observar',interrupted:'Interrumpido',completed:'Completado',error:'Error',closed:'Cerrado',unknown:'Sin estado'}
export const ATTEMPT_LABELS:Record<Attempt['state'],string>={started:'Inicio registrado',observing:'Observación durante el turno',completed:'Turno finalizado',quota:'Interrumpido por cuota',interrupted:'Interrumpido'}
