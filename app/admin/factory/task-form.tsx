'use client'
import {useEffect,useRef,useState,type FormEvent} from 'react'
import {ArrowRight} from 'lucide-react'
import ReferenceImages,{type RefImage} from './reference-images'

export const PROMPT_LIMIT=20000
type Draft={project:string;title:string;description:string;priority:string;images:RefImage[]}
type Result={ok:true;id:number}|{ok:false;error:string}
const projectOptions=[['finanzas','Finanzas'],['maracana','Maracaná'],['central','SNOSERVICE']]
const priorities=['Alta','Normal','Baja']
function empty(project:string):Draft{return {project:projectOptions.some(([id])=>id===project)?project:'finanzas',title:'',description:'',priority:'Normal',images:[]}}
function isImage(x:unknown):x is RefImage{
 if(!x||typeof x!=='object')return false
 const i=x as RefImage
 return typeof i.name==='string'&&i.name.length<=1024&&typeof i.data==='string'&&i.data.length<=266668&&/^[A-Za-z0-9+/]+={0,2}$/.test(i.data)&&typeof i.size==='number'&&Number.isInteger(i.size)&&i.size>0&&i.size<=200000
}
export default function TaskForm({project,ready,draftKey,createAction}:{project:string;ready:boolean;draftKey:string;createAction:(form:FormData)=>Promise<Result>}){
 const [draft,setDraft]=useState<Draft>(()=>empty(project))
 const draftRef=useRef(draft)
 const [loaded,setLoaded]=useState(false)
 const [error,setError]=useState('')
 const [storageError,setStorageError]=useState(false)
 const [busy,setBusy]=useState(false)
 const [imageBusy,setImageBusy]=useState(false)
 const lock=useRef(false)
 const key='snoservice.factory.draft.v1.'+draftKey
 useEffect(()=>{
  try{
   const raw=sessionStorage.getItem(key)
   if(raw){
    const d=JSON.parse(raw) as Partial<Draft>
    const next:Draft={project:typeof d.project==='string'&&projectOptions.some(([id])=>id===d.project)?d.project:empty(project).project,
     title:typeof d.title==='string'?d.title:'',description:typeof d.description==='string'?d.description:'',
     priority:typeof d.priority==='string'&&priorities.includes(d.priority)?d.priority:'Normal',
     images:Array.isArray(d.images)?d.images.filter(isImage).slice(0,3):[]}
    draftRef.current=next;setDraft(next)
   }
  }catch{setStorageError(true)}
  setLoaded(true)
 },[key,project])
 function update(patch:Partial<Draft>){
  const next={...draftRef.current,...patch};draftRef.current=next;setDraft(next)
  try{sessionStorage.setItem(key,JSON.stringify(next));setStorageError(false)}catch{setStorageError(true)}
 }
 function discard(){
  if(!window.confirm('¿Descartar el borrador y sus imágenes?'))return
  const next=empty(project);draftRef.current=next;setDraft(next);setError('')
  try{sessionStorage.removeItem(key);setStorageError(false)}catch{setStorageError(true)}
 }
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault()
  if(lock.current||imageBusy||!loaded)return
  if(draft.description.trim().length<10||draft.description.length>PROMPT_LIMIT||draft.title.trim().length<3||draft.title.length>100){
   setError('Revisá el título y la longitud de la descripción. El borrador sigue disponible.');return
  }
  const form=new FormData(event.currentTarget)
  lock.current=true;setBusy(true);setError('')
  try{
   const result=await createAction(form)
   if(!result.ok){setError(result.error);return}
   try{sessionStorage.removeItem(key)}catch{}
   window.location.assign('/admin/factory?job='+result.id+'&result=created#detail')
  }catch{setError('No se pudo confirmar el envío. Revisá la cola antes de reintentar; conservamos el borrador.')}
  finally{lock.current=false;setBusy(false)}
 }
 const over=draft.description.length>PROMPT_LIMIT
 return <form onSubmit={submit} className="f2-modal" style={{width:'100%',maxWidth:850,boxShadow:'none'}}>
  <fieldset disabled={!loaded||busy} style={{border:0,padding:0,margin:0,minWidth:0,display:'grid',gap:14}}>
   <label>Proyecto<select name="project" value={draft.project} onChange={e=>update({project:e.target.value})}>{projectOptions.map(([id,name])=><option key={id} value={id}>{name}</option>)}<option disabled value="cut">13 CUT · protegido</option></select></label>
   <label>Título<input name="title" required minLength={3} maxLength={100} value={draft.title} onChange={e=>update({title:e.target.value})}/></label>
   <label>Descripción<textarea name="description" required minLength={10} rows={12} style={{minHeight:260,resize:'vertical'}} aria-invalid={over} value={draft.description} onChange={e=>update({description:e.target.value})} placeholder="Qué cambiar y cómo verificar el resultado…"/>
    <span style={{textAlign:'right',fontSize:12,color:over?'#ff9b9b':undefined}}>{draft.description.length.toLocaleString('es-UY')} / {PROMPT_LIMIT.toLocaleString('es-UY')} caracteres{over?' · Supera el límite. No se recortó el texto.':''}</span>
   </label>
   <ReferenceImages images={draft.images} onChange={images=>update({images})} onBusy={setImageBusy} disabled={busy||!loaded}/>
   <label>Prioridad<select name="priority" value={draft.priority} onChange={e=>update({priority:e.target.value})}>{priorities.map(p=><option key={p}>{p}</option>)}</select></label>
  </fieldset>
  <p className="f2-note">No incluyas secretos ni datos de clientes. El borrador (incluidas las imágenes comprimidas) se conserva en esta pestaña; se elimina cuando se confirma el envío o lo descartás. Los cambios del repositorio público SNOSERVICE serán públicos.</p>
  {storageError&&<p role="alert" className="f2-note">El navegador no permitió guardar el borrador. No cierres ni recargues esta pestaña hasta copiarlo o enviarlo.</p>}
  {error&&<p role="alert" style={{color:'#ffb4b4',whiteSpace:'pre-wrap'}}>{error}</p>}
  <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
   <button type="submit" className="f2-primary" disabled={!ready||!loaded||busy||imageBusy||over}>{busy?'Enviando tarea…':'Enviar a desarrollo'} <ArrowRight size={17}/></button>
   <button type="button" className="f2-secondary" disabled={!loaded||busy||imageBusy} onClick={discard}>Descartar borrador</button>
  </div>
 </form>
}
