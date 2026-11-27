'use client'
import {useEffect,useRef,useState} from 'react'
import {useRouter} from 'next/navigation'
import {ArrowLeft,Plus,List,RotateCcw,RefreshCw,Maximize2,X,ChevronDown,Monitor} from 'lucide-react'
import {ROLES,studioState,type Snapshot} from './model'
import type {SeatStatus} from './studio-scene'
const team=[...ROLES,{id:'orchestrator',name:'Coordinación',color:'#2ad56f',description:'Orquestador'}]
export default function Studio({snapshot,watch}:{snapshot:Snapshot;watch?:number}){
 const router=useRouter(),canvas=useRef<HTMLCanvasElement>(null),labels=useRef<HTMLDivElement>(null),viewport=useRef<HTMLElement>(null)
 const scene=useRef<ReturnType<typeof import('./studio-scene').createStudio>|null>(null)
 const [ready,setReady]=useState(false),[failed,setFailed]=useState(false),[picked,setPicked]=useState<string|null>(null),[expanded,setExpanded]=useState(false)
 const view=studioState(snapshot,watch),status=view.seats as SeatStatus
 const current=useRef(status);current.current=status
 const selected=team.find(r=>r.id===picked)
 useEffect(()=>{
  let cancelled=false
  if(canvas.current&&labels.current)void import('./studio-scene').then(({createStudio})=>{if(cancelled||!canvas.current||!labels.current)return;try{scene.current=createStudio(canvas.current,labels.current,current.current,()=>setReady(true),()=>setFailed(true))}catch{setFailed(true)}}).catch(()=>{if(!cancelled)setFailed(true)})
  return()=>{cancelled=true;scene.current?.dispose();scene.current=null}
 },[])
 useEffect(()=>{scene.current?.setStatus(status)},[status])
 useEffect(()=>{if(snapshot.mode==='demo')return;const id=window.setInterval(()=>{if(document.visibilityState==='visible')router.refresh()},30000);return()=>window.clearInterval(id)},[router,snapshot.mode])
 const task=view.task
 return <main className={'studio-shell'+(expanded?' studio-expanded':'')}>
  <header className="studio-nav">
   <a className="studio-back" href="/admin?section=automatizaciones" aria-label="Volver a Central"><ArrowLeft size={18}/></a>
   <a className="studio-brand" href="/admin/factory"><img src="/logo.png" alt="SNOSERVICE"/><span><strong>SNOSERVICE</strong><small>FACTORY</small></span></a>
   <div className="studio-nav-right"><a className="studio-secondary" href="/admin/factory?view=tasks"><List size={17}/><span>Tareas</span>{view.open>0&&<b>{view.open}</b>}</a><a className="studio-primary" href="/admin/factory?view=new"><Plus size={19}/> Nueva tarea</a></div>
  </header>
  <section ref={viewport} className="studio-viewport" aria-label="Oficina 3D de Factory" data-renderer={ready&&!failed?'webgl':failed?'fallback':'loading'}>
   <div className="studio-top"><div><div className="studio-kicker">WORKSPACE / 01</div><h1>Factory<span>.</span></h1></div><div className="studio-pill"><i className={snapshot.mode==='demo'?'demo':snapshot.connected?'online':'offline'}/>{snapshot.mode==='demo'?'Demo':snapshot.connected?'Cola conectada':'Sin conexión'}</div></div>
   <div className="studio-stage">
    <canvas ref={canvas} className="studio-canvas" aria-label="Escena 3D interactiva con nueve puestos" style={{visibility:failed?'hidden':'visible'}}/>
    <div ref={labels} className="studio-labels">{team.map(r=><button type="button" key={r.id} data-seat={r.id} data-status={status[r.id]??'idle'} onClick={()=>setPicked(r.id)} className={'studio-seat'+(picked===r.id?' selected':'')} title={r.name}><i/>{r.name}</button>)}</div>
    {!ready&&!failed&&<div className="studio-loading"><span/>Cargando oficina</div>}
    {failed&&<div className="studio-fallback"><Monitor size={25}/><p>3D no disponible en este navegador.</p><div>{team.map(r=><button key={r.id} onClick={()=>setPicked(r.id)}>{r.name}</button>)}</div></div>}
   </div>
   <div className="studio-bottom">
    <div className="studio-task"><span className={'studio-task-icon '+view.kind}><i/></span><div><small>{task?'FAC-'+task.id+' · '+task.project:'EQUIPO'}</small><strong>{view.label}</strong></div>{task&&snapshot.mode==='live'&&<a href={'/admin/factory?view=tasks&job='+task.id} aria-label="Ver tarea"><ChevronDown size={17}/></a>}</div>
    <div className="studio-camera">{watch&&<a className="studio-exit-watch" href="/admin/factory" aria-label="Volver a todas las tareas" title="Volver a todas las tareas"><X size={16}/></a>}<button type="button" onClick={()=>router.refresh()} aria-label="Actualizar" title="Actualizar"><RefreshCw size={17}/></button><button type="button" onClick={()=>scene.current?.reset()} aria-label="Restablecer cámara" title="Restablecer cámara"><RotateCcw size={17}/></button><button type="button" onClick={()=>setExpanded(v=>!v)} aria-label={expanded?'Salir de pantalla completa':'Ampliar oficina'} title="Ampliar oficina"><Maximize2 size={17}/></button></div>
   </div>
   {selected&&<div className="studio-selection"><div><span className="studio-selection-dot" style={{background:selected.color}}/><strong>{selected.name}</strong><small>{status[selected.id]==='working'?'Actividad observada':status[selected.id]==='observed'?'Actividad registrada':status[selected.id]==='paused'?'En pausa':status[selected.id]==='requested'?'Especialista solicitado':'Disponible como perfil'}</small></div><a className="studio-primary" href={'/admin/factory?view=new'+(selected.id==='orchestrator'?'':'&agent='+selected.id)}>Asignar tarea</a><button onClick={()=>setPicked(null)} aria-label="Cerrar selección"><X size={18}/></button></div>}
  </section>
  <footer className="studio-foot"><span><i/> 8 especialistas · Coordinación</span><span>{snapshot.mode==='demo'?'Simulación': 'Estados según último evento'}</span><a href={snapshot.mode==='demo'?'/admin/factory':'/admin/factory?mode=demo'}>{snapshot.mode==='demo'?'Volver al modo real':'Demo'}</a></footer>
 </main>
}
