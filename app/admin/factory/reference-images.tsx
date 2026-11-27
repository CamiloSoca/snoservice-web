'use client'
import {useRef,useState} from 'react'
import {ImagePlus,X} from 'lucide-react'

const MAX=3, LIMIT=200000
type RefImage={name:string;data:string;size:number}
async function compress(file:File):Promise<RefImage>{
 if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>15_000_000)throw Error('Usá PNG, JPG o WebP de hasta 15 MB.')
 // The admin CSP permits data: images but intentionally disallows blob:.
 // FileReader stays local; the original file is never sent to the server.
 const url=await new Promise<string>((resolve,reject)=>{
  const reader=new FileReader()
  reader.onload=()=>typeof reader.result==='string'?resolve(reader.result):reject(Error('No se pudo leer la imagen.'))
  reader.onerror=()=>reject(Error('No se pudo leer el archivo.'))
  reader.onabort=()=>reject(Error('Lectura de imagen cancelada.'))
  reader.readAsDataURL(file)
 })
 const image=new Image()
 image.src=url
 try{await image.decode()}catch{throw Error('No se pudo abrir la imagen. Verificá que sea un PNG, JPG o WebP válido.')}
 {
  if(!image.naturalWidth||!image.naturalHeight||image.naturalWidth*image.naturalHeight>40_000_000)throw Error('La imagen tiene dimensiones demasiado grandes.')
  const canvas=document.createElement('canvas')
  const ctx=canvas.getContext('2d')
  if(!ctx)throw Error('No se pudo preparar la imagen.')
  for(const edge of [1800,1600,1400,1200,1000,800]){
   const scale=Math.min(1,edge/Math.max(image.naturalWidth,image.naturalHeight))
   canvas.width=Math.max(1,Math.round(image.naturalWidth*scale))
   canvas.height=Math.max(1,Math.round(image.naturalHeight*scale))
   ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height)
   ctx.drawImage(image,0,0,canvas.width,canvas.height)
   for(const quality of [0.88,0.78,0.68,0.58]){
    const data=canvas.toDataURL('image/jpeg',quality).split(',')[1]
    if(!data)continue
    const size=data.length*3/4-(data.endsWith('==')?2:data.endsWith('=')?1:0)
    if(size<=LIMIT)return {name:file.name,data,size}
   }
  }
  throw Error('No se pudo comprimir la imagen al tamaño permitido.')
 }
}
export default function ReferenceImages(){
 const input=useRef<HTMLInputElement>(null)
 const [images,setImages]=useState<RefImage[]>([])
 const [busy,setBusy]=useState(false)
 const [error,setError]=useState('')
 async function add(files:FileList|null){
  if(!files||busy)return
  if(files.length+images.length>MAX){setError('Podés adjuntar hasta tres imágenes.');if(input.current)input.current.value='';return}
  setBusy(true);setError('')
  try{const next:RefImage[]=[];for(const file of Array.from(files))next.push(await compress(file));setImages(old=>[...old,...next])}
  catch(e){setError(e instanceof Error?e.message:'No se pudo preparar la imagen.')}
  finally{setBusy(false);if(input.current)input.current.value=''}
 }
 return <fieldset style={{border:'1px solid #ffffff20',borderRadius:12,padding:12,minWidth:0,margin:0}}>
  <legend style={{padding:'0 5px',fontWeight:600}}>Referencias visuales (opcional)</legend>
  <p className="f2-note">Hasta 3 imágenes. Se comprimen localmente y se envían a Codex como contexto de diseño. No adjuntes datos personales ni credenciales.</p>
  <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" multiple hidden onChange={e=>void add(e.currentTarget.files)}/>
  <button type="button" className="f2-secondary" disabled={busy||images.length>=MAX} onClick={()=>input.current?.click()}><ImagePlus size={18}/> {busy?'Preparando imágenes…':'Adjuntar imágenes'} ({images.length}/{MAX})</button>
  {busy&&<input type="hidden" name="references_pending" value="1"/>}
  {error&&<p role="alert" className="f2-note">{error}</p>}
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(110px,1fr))',gap:8,marginTop:8}}>
   {images.map((image,i)=><div key={i} style={{position:'relative',minWidth:0,border:'1px solid #ffffff20',borderRadius:8,padding:6}}>
    {/* Local preview only, not a public URL. */}
    <img src={'data:image/jpeg;base64,'+image.data} alt={'Referencia '+(i+1)} style={{width:'100%',height:100,objectFit:'contain',borderRadius:6}}/>
    <p style={{fontSize:11,overflowWrap:'anywhere',margin:'4px 0'}}>{image.name} · {Math.ceil(image.size/1024)} KB</p>
    <input type="hidden" name="reference" value={image.data}/>
    <button type="button" className="f2-secondary" aria-label={'Quitar referencia '+(i+1)} disabled={busy} onClick={()=>setImages(old=>old.filter((_,j)=>i!==j))}><X size={14}/> Quitar</button>
   </div>)}
  </div>
 </fieldset>
}
