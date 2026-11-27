import {createHash} from 'node:crypto'
export const MARK_V2='SNOSERVICE_FACTORY_BUILD_V2\n'
const IMAGE_MARK='SNOSERVICE_FACTORY_IMAGE_V1\n'
const CHUNK_SIZE=48000
type Reference={sha256:string;size:number;chunks:number[]}
export function readImages(form:FormData){
 if(form.get('references_pending'))throw Error('Preparación pendiente')
 const entries=form.getAll('reference')
 if(entries.length>3)throw Error('Demasiadas imágenes')
 return entries.map(value=>{
  if(typeof value!=='string'||value.length>266668||!/^[A-Za-z0-9+/]+={0,2}$/.test(value))throw Error('Imagen inválida')
  const raw=Buffer.from(value,'base64')
  if(raw.length>200000||raw.toString('base64')!==value||!validJpeg(raw))throw Error('Imagen inválida')
  return {data:value,sha256:createHash('sha256').update(raw).digest('hex'),size:raw.length}
 })
}
function validJpeg(raw:Buffer){
 if(raw.length<12||raw.readUInt16BE(0)!==0xffd8||raw.readUInt16BE(raw.length-2)!==0xffd9)return false
 let pos=2
 while(pos+4<=raw.length){
  if(raw[pos]!==255)return false
  while(pos<raw.length&&raw[pos]===255)pos++
  if(pos>=raw.length)return false
  const marker=raw[pos++]
  if(marker===0xda||pos+2>raw.length)return false
  const size=raw.readUInt16BE(pos)
  if(size<2||pos+size>raw.length)return false
  if([0xc0,0xc1,0xc2].includes(marker)){
   if(size<8)return false
   const h=raw.readUInt16BE(pos+3),w=raw.readUInt16BE(pos+5)
   return w>0&&h>0&&w<=2000&&h<=2000
  }
  pos+=size
 }
 return false
}
export function parseReferences(value:unknown):value is Reference[]{
 if(!Array.isArray(value)||value.length<1||value.length>3)return false
 const seen=new Set<number>()
 return value.every(ref=>{
  if(!ref||typeof ref!=='object'||Object.keys(ref).length!==3||typeof ref.sha256!=='string'||!/^[a-f0-9]{64}$/.test(ref.sha256)||!Number.isInteger(ref.size)||ref.size<4||ref.size>200000||!Array.isArray(ref.chunks)||ref.chunks.length!==Math.ceil(Math.ceil(ref.size/3)*4/CHUNK_SIZE))return false
  return ref.chunks.every((id:unknown)=>{if(typeof id!=='number'||!Number.isSafeInteger(id)||id<1||seen.has(id))return false;seen.add(id);return true})
 })
}
export async function storeImages(images:ReturnType<typeof readImages>,post:(body:string)=>Promise<number>):Promise<Reference[]>{
 const references:Reference[]=[]
 for(const [i,image] of images.entries()){
  const chunks:number[]=[]
  for(let offset=0;offset<image.data.length;offset+=CHUNK_SIZE){
   const id=await post(IMAGE_MARK+JSON.stringify({image:i+1,part:chunks.length,sha256:image.sha256,data:image.data.slice(offset,offset+CHUNK_SIZE)}))
   if(!Number.isSafeInteger(id)||id<1)throw Error('Fragmento no guardado')
   chunks.push(id)
  }
  references.push({sha256:image.sha256,size:image.size,chunks})
 }
 if(!parseReferences(references))throw Error('Manifiesto inválido')
 return references
}
