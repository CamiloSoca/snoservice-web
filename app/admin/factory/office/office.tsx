'use client'
import {useEffect,useRef,useState} from 'react'
import {useRouter} from 'next/navigation'
import {ROLES,STAGES,roleState,type Snapshot} from './model'
import {buildCharacterFrames} from './hermes/art/characters'
import {buildFurnitureSprites} from './hermes/art/furniture'
import {buildGroundTileSprites} from './hermes/art/tiles'
import {paintSpriteToContext,spriteWidth,spriteHeight} from './hermes/art/sprite'
import type {PixelSprite} from './hermes/types'
const W=960,H=576
const desks=ROLES.map((_,i)=>({x:152+(i%4)*218,y:174+Math.floor(i/4)*192}))
function renderOffice(canvas:HTMLCanvasElement,selected:string,snapshot:Snapshot,taskId:number){
 const ctx=canvas.getContext('2d');if(!ctx)return
 ctx.imageSmoothingEnabled=false
 const art=new Map([...buildGroundTileSprites(),...buildFurnitureSprites()].map(s=>[s.key,s]))
 const textures=new Map<string,HTMLCanvasElement>()
 function texture(s:PixelSprite){let c=textures.get(s.key);if(c)return c;c=document.createElement('canvas');c.width=spriteWidth(s);c.height=spriteHeight(s);const context=c.getContext('2d');if(context)paintSpriteToContext(s,context,0,0);textures.set(s.key,c);return c}
 function draw(key:string,x:number,y:number,scale=1){const s=art.get(key);if(!s)return;const c=texture(s);ctx!.drawImage(c,x,y,c.width*scale,c.height*scale)}
 function rect(x:number,y:number,w:number,h:number,color:string){ctx!.fillStyle=color;ctx!.fillRect(x,y,w,h)}
 function label(value:string,x:number,y:number,color:string,size=15){ctx!.font='600 '+size+'px system-ui,sans-serif';ctx!.textAlign='center';ctx!.fillStyle=color;ctx!.fillText(value,x,y)}
 rect(0,0,W,H,'#172a21')
 for(let y=64;y<H-32;y+=32)for(let x=32;x<W-32;x+=32)draw((y===256||y===288)?'tile_floor_cream':'tile_floor_wood',x,y)
 for(let x=32;x<W-32;x+=32)draw(x%128===0?'tile_wall_window':'tile_wall',x,32)
 rect(32,64,896,6,'#426150')
 label('SNO / STUDIO',480,24,'#b9f4cd',14)
 label('DESARROLLO',480,88,'#536454',12)
 label('CALIDAD Y OPERACIONES',480,280,'#536454',12)
 const task=snapshot.tasks.find(t=>t.id===taskId)
 desks.forEach(({x,y},i)=>{
  const role=ROLES[i],state=roleState(role,snapshot,task)
  const active=state==='demo-working'
  rect(x-85,y-65,170,132,selected===role.id?'#a9dbb3':'#e2e7d4')
  rect(x-82,y-62,164,126,'#d5ddcb')
  draw('furn_desk_monitor',x-48,y-55,1.5)
  const character=buildCharacterFrames({seed:role.id,accentColor:role.color})[active?'sit_down':'idle_down']
  const c=texture(character);ctx.drawImage(c,x-30,y-23,c.width*1.5,c.height*1.5)
  rect(x-76,y+69,152,26,'#25362f')
  rect(x-72,y+76,8,8,active?'#55df88':snapshot.mode==='demo'?'#9ca8a0':'#e8b969')
  label(role.name,x+5,y+87,'#eef5ee',13)
 })
 draw('furn_plant_tall',35,72,1.3);draw('furn_plant_tall',875,72,1.3)
 draw('furn_sofa_h',80,486,1.4);draw('furn_coffee_table',180,496,1.2)
 draw('furn_server_rack',810,475,1.3);draw('furn_server_rack',860,475,1.3)
 rect(320,486,320,48,'#294639');label('SNOSERVICE  /  FACTORY',480,516,'#a9edbb',19)
 label(snapshot.mode==='demo'?'SIMULACIÓN · NO ES EJECUCIÓN REAL':'MONITOREO · ESTADOS INDIVIDUALES NO VERIFICADOS',480,562,'#b4c9ba',11)
}
export default function Office({snapshot}:{snapshot:Snapshot}){
 const router=useRouter()
 const canvas=useRef<HTMLCanvasElement>(null)
 const [selected,setSelected]=useState<string>(ROLES[0].id)
 const [chosen,setChosen]=useState<number>(snapshot.tasks[0]?.id??0)
 const task=snapshot.tasks.find(t=>t.id===chosen)??snapshot.tasks[0]
 const role=ROLES.find(r=>r.id===selected)??ROLES[0]
 useEffect(()=>{if(snapshot.mode!=='live')return;const id=window.setInterval(()=>{if(document.visibilityState==='visible')router.refresh()},60000);return()=>window.clearInterval(id)},[router,snapshot.mode])
 useEffect(()=>{if(canvas.current)renderOffice(canvas.current,selected,snapshot,task?.id??0)},[selected,snapshot,task?.id])
 return <main className="fo-shell">
  <header className="fo-header"><a href="/admin/factory">← Centro de operaciones</a><span>SNOSERVICE / FACTORY</span><div><a className={snapshot.mode==='live'?'fo-selected':''} href="/admin/factory/office">Real</a><a className={snapshot.mode==='demo'?'fo-selected':''} href="/admin/factory/office?mode=demo">Demo</a></div></header>
  <div className="fo-title"><div><p>WORKSPACE / OFFICE 01</p><h1>Oficina de agentes<span>.</span></h1><p>Tu equipo de desarrollo, en un solo lugar.</p></div><button type="button" onClick={()=>router.refresh()}>Actualizar</button></div>
  <div className="fo-notice" role="status">{snapshot.mode==='demo'?'MODO DEMO — Datos y estados simulados. No se ejecuta ningún agente.':snapshot.connected?'Cola privada conectada · Los eventos son de la tarea, no telemetría individual.':'Cola no disponible · No se muestran estados inventados.'}</div>
  <div className="fo-layout"><section className="fo-panel"><div className="fo-panel-head"><h2>Studio 2D</h2><span>8 perfiles configurados</span></div><div className="fo-map"><canvas ref={canvas} width={W} height={H} aria-label="Plano de la oficina. Seleccioná un perfil en el listado accesible." onClick={e=>{const b=e.currentTarget.getBoundingClientRect();const x=(e.clientX-b.left)*W/b.width,y=(e.clientY-b.top)*H/b.height;const index=desks.findIndex(d=>Math.abs(d.x-x)<85&&y>d.y-65&&y<d.y+95);if(index>=0)setSelected(ROLES[index].id)}}/></div><div className="fo-roster">{ROLES.map(r=><button key={r.id} type="button" aria-pressed={r.id===selected} onClick={()=>setSelected(r.id)}><strong>{r.name}</strong><small>{snapshot.mode==='demo'?(roleState(r,snapshot,task)==='demo-working'?'Trabajo simulado':'En espera simulada'):'Sin telemetría individual'}</small></button>)}</div></section>
  <aside className="fo-panel fo-inspector"><div className="fo-panel-head"><h2>Inspector</h2><span>Solo lectura</span></div><div className="fo-inner"><p className="fo-eyebrow">PERFIL SELECCIONADO</p><h3>{role.name}</h3><p>{role.description}</p><code>{role.id}</code><hr/><p className="fo-eyebrow">TAREAS {snapshot.mode==='demo'?'SIMULADAS':'ABIERTAS'}</p>{snapshot.tasks.length?<><label htmlFor="fo-task">Seleccionar tarea</label><select id="fo-task" value={task?.id??0} onChange={e=>setChosen(Number(e.target.value))}>{snapshot.tasks.map(t=><option key={t.id} value={t.id}>{snapshot.mode==='demo'?'DEMO':'FAC'}-{t.id} · {t.project}</option>)}</select><h3>{task?.title}</h3><p><strong>{task?STAGES[task.stage]:'—'}</strong>{task?.reason?' · '+task.reason:''}</p>{task?.at&&<p>Último evento: <time dateTime={task.at}>{task.at.slice(0,16).replace('T',' ')} UTC</time></p>}{snapshot.mode==='live'&&task&&<a className="fo-link" href={'/admin/factory?job='+task.id}>Ver registro de tarea →</a>}</>:<p>{snapshot.connected?'No hay tareas abiertas verificadas.':'No hay datos de la cola.'}</p>}<hr/><p>El chat individual y los handoffs se habilitarán cuando el runner emita eventos verificables por agente. Esta vista no puede iniciar Codex ni modificar tareas.</p></div></aside></div>
  <footer className="fo-footer"><span>Recursos pixel art: Hermes3D · MIT</span><span>{snapshot.checkedAt?'Consulta: '+snapshot.checkedAt.slice(0,16).replace('T',' ')+' UTC':'Datos de demostración'}</span></footer>
 </main>
}
