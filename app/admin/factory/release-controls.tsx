'use client'
import {useEffect,useRef,useState} from 'react'
import {Rocket,RefreshCw,ExternalLink} from 'lucide-react'
import type {ReleaseResult} from './release-service'

type Action='status'|'publish'|'promote'
export default function ReleaseControls({issue,project,head,enabled,visual,run}:{issue:number;project:string;head:string;enabled:boolean;visual:boolean;run:(issue:number,head:string,action:Action)=>Promise<ReleaseResult>}){
 const [result,setResult]=useState<ReleaseResult>(enabled?{state:'building',message:'Consultando el estado de la entrega…'}:{state:'disabled',message:'Faltan FACTORY_RELEASE_GITHUB_TOKEN y FACTORY_RELEASE_VERCEL_TOKEN en producción. Configuralos como variables sensibles de servidor.'})
 const [busy,setBusy]=useState(false)
 const lock=useRef(false)
 async function check(action:Action){
  if(lock.current||!enabled)return
  if(action!=='status'&&!window.confirm(action==='publish'?'¿Fusionar FAC-'+issue+' en la rama productiva de '+project+' e iniciar su deploy? Commit revisado: '+head.slice(0,12):'¿Asignar el build de producción verificado de '+project+' a su dominio público?'))return
  lock.current=true;setBusy(true)
  try{setResult(await run(issue,head,action))}
  catch{setResult({state:'blocked',message:'No se pudo confirmar la operación. Verificá el estado antes de volver a publicar.'})}
  finally{lock.current=false;setBusy(false)}
 }
 useEffect(()=>{if(enabled)void check('status')},[enabled,issue,head])
 useEffect(()=>{
  if(!enabled||result.state!=='building')return
  const timer=window.setInterval(()=>void check('status'),12000)
  return ()=>window.clearInterval(timer)
 },[enabled,result.state,issue,head])
 return <section style={{border:'1px solid #ffffff20',borderRadius:12,padding:14,display:'grid',gap:8}}>
  <strong><Rocket size={17}/> Publicación a producción</strong>
  <p className="f2-note">{visual?'Validaciones independientes informadas por Factory. Revisá el diff y la versión de prueba.':'Esta tarea no tiene validaciones independientes certificadas por Factory. Revisá las pruebas antes de aprobar.'}</p>
  <p role="status" style={{margin:0,overflowWrap:'anywhere'}}>{result.message}</p>
  {result.commit&&<small>Commit: {result.commit.slice(0,12)}</small>}
  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
   <button className="f2-secondary" type="button" disabled={busy||!enabled} onClick={()=>void check('status')}><RefreshCw size={15}/> {busy?'Consultando…':'Verificar estado'}</button>
   {result.state==='review'&&enabled&&<button className="f2-primary" type="button" disabled={busy} onClick={()=>void check('publish')}><Rocket size={15}/> Publicar en producción</button>}
   {result.state==='promote'&&<button className="f2-primary" type="button" disabled={busy} onClick={()=>void check('promote')}><Rocket size={15}/> Activar en dominio</button>}
   {!enabled&&<a className="f2-secondary" href="https://vercel.com/snoservice/snoservice-web/settings/environment-variables" target="_blank" rel="noreferrer">Configurar credenciales <ExternalLink size={14}/></a>}
  </div>
 </section>
}
