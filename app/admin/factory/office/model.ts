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
export type Task={id:number;title:string;project:string;stage:Stage;at:string|null;reason:string|null}
export type Snapshot={mode:'demo'|'live';connected:boolean;checkedAt:string|null;tasks:Task[]}
export const STAGES:Record<Stage,string>={analyze:'Análisis',develop:'Desarrollo',validate:'Validación',review:'Revisión',blocked:'Bloqueada',paused:'Pausada',queued:'En cola',unknown:'Sin verificar'}
const projects:Record<string,string>={maracana:'Maracaná',finanzas:'Finanzas',central:'SNOSERVICE'}
const validStages=new Set(['analyze','develop','validate','review','blocked','paused'])
const markers=['SNOSERVICE_FACTORY_BUILD_V1\n','SNOSERVICE_FACTORY_BUILD_V2\n']
const eventMarker='SNOSERVICE_FACTORY_EVENT_V1\n'
function record(value:unknown):Record<string,unknown>|null{return value!==null&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,unknown>:null}
function own(value:unknown){return String(record(value)?.login??'').toLowerCase()==='camilosoca'}
export function parseTask(raw:unknown):Task|null{
 const x=record(raw);if(!x||x.pull_request||x.state!=='open'||!own(x.user)||typeof x.title!=='string'||!x.title.startsWith('[Factory BUILD] ')||!Number.isSafeInteger(x.number)||Number(x.number)<1||typeof x.body!=='string'||x.body.length>65000)return null
 const marker=markers.find(m=>String(x.body).startsWith(m));if(!marker)return null
 try{
  const r=record(JSON.parse(x.body.slice(marker.length)));if(!r||typeof r.project!=='string'||!Object.hasOwn(projects,r.project)||typeof r.title!=='string'||r.title.length<3||r.title.length>100||typeof r.description!=='string'||r.description.length>20000||!['Alta','Normal','Baja'].includes(String(r.priority)))return null
  return {id:Number(x.number),title:r.title,project:projects[r.project],stage:'queued',at:null,reason:null}
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
 return latest??task
}
export const DEMO:Snapshot={mode:'demo',connected:false,checkedAt:null,tasks:[{id:1,title:'Catálogo comercial (simulado)',project:'Maracaná',stage:'develop',at:null,reason:null},{id:2,title:'Revisión de seguridad (simulada)',project:'Finanzas',stage:'validate',at:null,reason:null}]}
export function roleState(role:typeof ROLES[number],snapshot:Snapshot,task:Task|undefined){
 if(snapshot.mode==='demo')return role.stage===task?.stage?'demo-working':'demo-idle'
 // Queue events are job-level, NOT evidence of a running individual agent.
 return 'unverified'
}
