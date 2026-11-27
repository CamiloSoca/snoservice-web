import * as THREE from 'three'
import {OrbitControls} from 'three/addons/controls/OrbitControls.js'
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js'
import {ROLES} from './model'

export type VisualStatus='idle'|'working'|'observed'|'paused'
export type SeatStatus=Record<string,VisualStatus>
type Avatar={body:THREE.Group;left:THREE.Group;right:THREE.Group;lamp:THREE.MeshStandardMaterial;screen:THREE.MeshStandardMaterial;anchor:THREE.Vector3;id:string;index:number}
type Seat={id:string;x:number;z:number;color:string;name:string}
const seats:Seat[]=[...ROLES.slice(0,4).map((r,i)=>({...r,x:-7.2+i*4.8,z:-3.4})),...ROLES.slice(4).map((r,i)=>({...r,x:-7.2+i*4.8,z:1.35})),{id:'orchestrator',x:-6.9,z:5.8,color:'#45db89',name:'Coordinación'}]
const C={floor:'#727976',wall:'#323a38',wallDark:'#252d2b',base:'#171d1c',edge:'#454e4a',desk:'#a68b70',metal:'#252c2b',screen:'#182621',green:'#2ad56f',rug:'#45534e',wood:'#84674e'}
export function createStudio(canvas:HTMLCanvasElement,labels:HTMLElement,initial:SeatStatus,onReady:()=>void,onError:()=>void){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'})
 renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.65))
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25
 const scene=new THREE.Scene()
 const camera=new THREE.OrthographicCamera(-14,14,10,-10,.1,160)
 const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.12;controls.enablePan=false
 controls.minPolarAngle=.5;controls.maxPolarAngle=1.0;controls.minAzimuthAngle=.06;controls.maxAzimuthAngle=1.05;controls.minZoom=.7;controls.maxZoom=2.2
 controls.target.set(0,.1,0);camera.position.set(16,20,25);controls.update()
 const ambient=new THREE.HemisphereLight('#e0f0f4','#505a4a',2.1);scene.add(ambient)
 const sun=new THREE.DirectionalLight('#fff0d8',3.2);sun.position.set(-9,23,13);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048)
 Object.assign(sun.shadow.camera,{left:-17,right:17,top:17,bottom:-17,near:1,far:60})
 sun.shadow.normalBias=.035;sun.shadow.bias=-.0004;sun.shadow.radius=3;scene.add(sun)
 const fill=new THREE.DirectionalLight('#9ec8d9',.85);fill.position.set(10,9,-12);scene.add(fill)
 const mats=new Map<string,THREE.MeshStandardMaterial>(),geos=new Map<string,THREE.BufferGeometry>()
 function mat(color:string,rough=.8){const key=color+rough;let m=mats.get(key);if(!m){m=new THREE.MeshStandardMaterial({color,roughness:rough});mats.set(key,m)}return m}
 function mesh(parent:THREE.Object3D,geo:THREE.BufferGeometry,m:THREE.Material,x:number,y:number,z:number,shadow=true){
  const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=shadow;o.receiveShadow=true;parent.add(o);return o
 }
 function box(parent:THREE.Object3D,x:number,y:number,z:number,w:number,h:number,d:number,color:string,r=0,shadow=true,m?:THREE.Material){
  const k=[w,h,d,r].join(':');let geo=geos.get(k);if(!geo){geo=r?new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/2,h/2,d/2)):new THREE.BoxGeometry(w,h,d);geos.set(k,geo)}
  return mesh(parent,geo,m??mat(color),x,y,z,shadow)
 }
 function sphere(parent:THREE.Object3D,x:number,y:number,z:number,sx:number,sy:number,sz:number,color:string){
  const k='sphere';if(!geos.has(k))geos.set(k,new THREE.SphereGeometry(1,12,8))
  const o=mesh(parent,geos.get(k)!,mat(color),x,y,z);o.scale.set(sx,sy,sz);return o
 }
 function cyl(parent:THREE.Object3D,x:number,y:number,z:number,top:number,bottom:number,h:number,color:string){
  const key=[top,bottom,h,'cyl'].join(':');if(!geos.has(key))geos.set(key,new THREE.CylinderGeometry(top,bottom,h,12))
  return mesh(parent,geos.get(key)!,mat(color),x,y,z)
 }
 function emissive(color:string,intensity=.8){return new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:intensity,roughness:.55})}
 function plant(x:number,z:number,size=1){
  const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(size);scene.add(g)
  cyl(g,0,.27,0,.36,.28,.54,'#b9b5a7');cyl(g,0,.55,0,.33,.33,.035,'#443c30')
  for(let i=0;i<7;i++){const angle=i*2.399;const leaf=sphere(g,Math.cos(angle)*.26,.85+(i%3)*.12,Math.sin(angle)*.26,.16,.44,.13,i%2?'#407e51':'#6c9e5e');leaf.rotation.z=Math.cos(angle)*.55;leaf.rotation.x=Math.sin(angle)*.55}
 }
 function sign(text:string,width:number,height:number,x:number,y:number,z:number,color='#dce8df'){
  const c=document.createElement('canvas');c.width=1024;c.height=256
  const ctx=c.getContext('2d')!;ctx.clearRect(0,0,1024,256);ctx.font='700 112px system-ui,sans-serif';ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,512,128)
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace
  const material=new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false})
  const m=new THREE.Mesh(new THREE.PlaneGeometry(width,height),material);m.position.set(x,y,z);scene.add(m)
 }
 // A cutaway architecture model. No opaque front walls obstruct the team.
 box(scene,0,-.65,0,21.4,.85,16.6,C.base,.17)
 box(scene,0,-.13,0,21,.25,16.2,C.floor,.045)
 box(scene,0,-.36,8.12,20.9,.12,.055,C.green,.025)
 box(scene,10.5,-.36,0,.055,.12,16.15,C.green,.025)
 for(let i=0;i<28;i++)box(scene,-10.1+i*.75,.008,0,.014,.013,15.95,'#59615e',0,false)
 for(let i=0;i<21;i++)box(scene,0,.009,-7.8+i*.78,20.8,.012,.013,'#59615e',0,false)
 // Back gallery and left glass wall with mullions.
 box(scene,0,1.42,-8.0,21,.22,.28,C.edge,.02)
 box(scene,0,2.92,-8,21,.28,.3,C.wallDark,.025)
 box(scene,0,.27,-8,21,.54,.3,C.wallDark,.025)
 for(let i=0;i<8;i++)box(scene,-10.35+i*2.96,1.63,-8,.12,2.3,.29,C.wallDark)
 const glass=new THREE.MeshPhysicalMaterial({color:'#708b91',metalness:.05,roughness:.25,transparent:true,opacity:.17,depthWrite:false})
 box(scene,0,1.64,-8,20.7,2.14,.045,'#769b9e',0,false,glass)
 box(scene,-10.4,1.46,0,.27,2.9,16.05,C.wallDark,.04)
 for(let i=0;i<4;i++){const z=-5.7+i*3.8;box(scene,-10.23,1.66,z,.055,1.7,2.8,'#667774',.035);box(scene,-10.18,1.66,z,.025,1.55,2.62,'#839893',.01)}
 box(scene,0,2.12,-7.8,7.6,1.46,.18,'#1e2825',.05)
 const logoMat=emissive(C.green,.9);box(scene,-3.2,2.12,-7.67,.16,.74,.03,C.green,.03,false,logoMat)
 sign('SNOSERVICE',6.5,1.6,.45,2.12,-7.68,'#e8f5ec')
 // Warm work pods and green circulation strip.
 box(scene,0,.026,-3.0,19.8,.045,3.9,'#46504d',.08,false)
 box(scene,0,.026,1.72,19.8,.045,3.9,'#46504d',.08,false)
 box(scene,0,.027,-.85,19.5,.025,.14,'#5e7868',.01,false)
 box(scene,0,.027,4.15,19.5,.025,.14,'#5e7868',.01,false)
 const avatars:Avatar[]=[]
 const skin=['#b67d59','#e5b48b','#c79068','#8e654c','#d7a080','#f0c2a2','#a56b50','#d0a080','#bc8d6f']
 seats.forEach((s,index)=>{
  const g=new THREE.Group();g.position.set(s.x,0,s.z);scene.add(g)
  // Thin, rounded furniture; twin screens and hardware details.
  box(g,0,.92,-.2,3.18,.13,1.62,C.desk,.055)
  for(const x of [-1.39,1.39])for(const z of [-.81,.41])box(g,x,.45,z,.12,.87,.12,C.metal,.025)
  box(g,-1.22,.48,-.2,.48,.68,.7,'#454c48',.055)
  box(g,-1.22,.61,.16,.27,.018,.025,'#87968e',.005)
  const screen=emissive('#263e35',.35)
  for(const x of [-.53,.46]){
   box(g,x,1.06,-.65,.35,.055,.26,C.metal,.025)
   box(g,x,1.25,-.74,.085,.32,.09,C.metal,.015)
   box(g,x,1.53,-.74,1.02,.63,.10,'#1c2523',.055)
   box(g,x,1.53,-.675,.89,.50,.03,'#263e35',.025,false,screen)
   for(let l=0;l<3;l++)box(g,x-.20+(l%2)*.04,1.69-l*.12,-.65,.35+(l%2)*.12,.025,.012,l===1?'#6d9a87':'#8eb5a0',.006,false)
  }
  box(g,0,1.015,.18,.74,.055,.23,'#313a37',.028)
  for(let i=0;i<8;i++)box(g,-.31+i*.088,1.046,.18,.055,.012,.13,'#75817a',.004,false)
  box(g,.56,1.025,.18,.14,.045,.22,'#303a35',.025)
  cyl(g,1.11,1.10,-.08,.105,.095,.22,'#dae1d6')
  const lamp=emissive('#52655c',.3)
  box(g,1.45,1.01,.35,.12,.045,.12,'#52655c',.025,false,lamp)
  // Swivel chair.
  cyl(g,0,.26,1.05,.13,.15,.43,'#272f2c')
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5;const leg=box(g,Math.sin(a)*.22,.095,1.05+Math.cos(a)*.22,.10,.09,.49,'#28312d',.03);leg.rotation.y=a}
  box(g,0,.54,1.05,.78,.14,.77,'#39433e',.09)
  box(g,0,.95,1.43,.77,.73,.13,'#39433e',.08)
  // Small stylized 3D people, each with distinct proportions and accent.
  const body=new THREE.Group();body.position.set(0,.58,1.03);g.add(body)
  const accent=s.color,sk=skin[index]
  box(body,0,.45,-.035,.49,.62,.32,accent,.11)
  box(body,0,.14,-.09,.48,.20,.35,'#222c29',.07)
  for(const x of [-.13,.13]){box(body,x,.04,-.28,.20,.19,.39,'#26322e',.065);box(body,x,-.32,-.41,.18,.53,.18,'#26322e',.05);box(body,x,-.54,-.47,.21,.12,.30,'#1b2421',.035)}
  cyl(body,0,.80,-.035,.10,.12,.17,sk)
  sphere(body,0,1.05,-.055,.26,.29,.245,sk)
  sphere(body,0,1.20,-.005,.265,.18,.25,index%3===0?'#42352b':index%3===1?'#242b29':'#72523b')
  for(const x of [-.247,.247])sphere(body,x,1.06,-.015,.05,.075,.065,sk)
  // Facing the screens, eyes and headset are modeled on the far side.
  for(const x of [-.085,.085])sphere(body,x,1.08,-.286,.023,.026,.017,'#282b26')
  const left=new THREE.Group(),right=new THREE.Group()
  for(const [arm,x] of [[left,-.29],[right,.29]] as const){arm.position.set(x,.65,-.055);body.add(arm);box(arm,0,-.15,-.08,.16,.36,.18,accent,.065);box(arm,0,-.30,-.27,.14,.16,.31,sk,.06)}
  if(index%3===0){for(const x of [-.265,.265])box(body,x,1.06,-.01,.075,.21,.19,'#303e37',.03)}
  avatars.push({body,left,right,lamp,screen,anchor:new THREE.Vector3(s.x,2.35,s.z+1.05),id:s.id,index})
 })
 // Collaboration lounge, server room and central meeting table.
 box(scene,3.9,.035,6.25,7.15,.045,2.95,'#657067',.12,false)
 box(scene,2.5,.56,6.78,2.6,.42,.88,'#3b5550',.13)
 box(scene,2.5,.93,7.15,2.65,.62,.21,'#3b5550',.10)
 for(const x of [1.24,3.76])box(scene,x,.73,6.78,.24,.43,.89,'#3b5550',.08)
 for(const x of [1.93,3.06])box(scene,x,.79,6.72,1.06,.16,.69,'#688078',.09)
 cyl(scene,2.5,.33,5.72,.15,.18,.58,C.metal);cyl(scene,2.5,.65,5.72,.72,.72,.095,C.wood)
 box(scene,2.5,.72,5.72,.48,.045,.31,'#d7d6c8',.025)
 for(const x of [7.0,8.5]){box(scene,x,1.05,6.45,1.2,2.10,1.1,'#202927',.07);box(scene,x,1.05,7.04,1.01,1.91,.045,'#384540',.035);for(let i=0;i<8;i++){box(scene,x,.27+i*.22,7.075,.87,.12,.035,'#182520',.015);box(scene,x+.32,.27+i*.22,7.103,.065,.04,.012,C.green,.008,false,emissive(C.green,.7))}}
 for(const [x,z,s] of [[-9.55,-7.05,1.25],[9.45,-7.03,1.25],[-9.55,3.8,1],[.15,7.25,1.0],[9.45,3.9,.95]])plant(x,z,s)
 // Soft ground shadow outside the slab.
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(150,150),new THREE.ShadowMaterial({opacity:.18}));ground.rotation.x=-Math.PI/2;ground.position.y=-1.10;ground.receiveShadow=true;scene.add(ground)
 let statuses=initial,frame=0,disposed=false,last=0
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches
 const pos=new THREE.Vector3()
 let initialSize=true
 const resize=()=>{
  const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return
  const aspect=w/h;const half=Math.max(10.5,13.9/aspect)
  camera.left=-half*aspect;camera.right=half*aspect;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix()
  renderer.setSize(w,h,false);if(initialSize){camera.zoom=aspect<.9?1.13:1;camera.updateProjectionMatrix();initialSize=false}
 }
 const observer=new ResizeObserver(resize);observer.observe(canvas);resize()
 function updateLabels(){
  const w=canvas.clientWidth,h=canvas.clientHeight
  for(const a of avatars){
   const el=labels.querySelector<HTMLElement>('[data-seat="'+a.id+'"]');if(!el)continue
   pos.copy(a.anchor).project(camera)
   el.style.left=((pos.x*.5+.5)*w)+'px';el.style.top=((-pos.y*.5+.5)*h)+'px'
   el.style.visibility=(Math.abs(pos.x)<1&&Math.abs(pos.y)<1&&pos.z<1)?'visible':'hidden'
  }
 }
 function animate(ms:number){
  if(disposed)return;frame=requestAnimationFrame(animate)
  if(document.hidden||ms-last<33)return
  last=ms;const time=ms*.001;controls.update()
  for(const a of avatars){
   const state=statuses[a.id]??'idle',active=state==='working'
   const color=active?'#40ee83':state==='paused'?'#e0ab61':state==='observed'?'#6daeb0':'#65736a'
   a.lamp.color.set(color);a.lamp.emissive.set(color);a.lamp.emissiveIntensity=active?1.6:.4
   a.screen.color.set(active?'#376d50':'#263e35');a.screen.emissive.set(active?'#2b7950':'#1a3127');a.screen.emissiveIntensity=active?.9:.27
   a.left.rotation.x=active?-.35+(reduce?0:Math.sin(time*7+a.index)*.15):.18
   a.right.rotation.x=active?-.35+(reduce?0:Math.cos(time*7+a.index)*.15):.18
   a.body.rotation.y=active?0:(reduce?0:Math.sin(time*.8+a.index)*.035)
  }
  renderer.render(scene,camera);updateLabels()
 }
 function lost(e:Event){e.preventDefault();onError()}
 canvas.addEventListener('webglcontextlost',lost)
 frame=requestAnimationFrame(animate);onReady()
 return {setStatus(next:SeatStatus){statuses=next},reset(){controls.target.set(0,.1,0);camera.position.set(16,20,25);camera.zoom=canvas.clientWidth/canvas.clientHeight<.9?1.13:1;camera.updateProjectionMatrix();controls.update()},dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();controls.dispose();canvas.removeEventListener('webglcontextlost',lost);const materials=new Set<THREE.Material>(),geometry=new Set<THREE.BufferGeometry>();scene.traverse(o=>{if(o instanceof THREE.Mesh){geometry.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m)}});for(const g of geometry)g.dispose();for(const m of materials){if('map' in m&&m.map instanceof THREE.Texture)m.map.dispose();m.dispose()}for(const m of mats.values())m.dispose();for(const g of geos.values())g.dispose();renderer.dispose()}}
}
