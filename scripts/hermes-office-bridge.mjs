// Local-only compatibility shim for Hermes3D Custom runtime.
// This is a synthetic roster, NOT the runner or an execution service.
import {createServer} from 'node:http'
import {pathToFileURL} from 'node:url'
import {ROLES} from '../app/admin/factory/office/model.ts'
export function createDemoBridge(){
 const server=createServer((req,res)=>{
  function send(status,payload){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Connection':'close'});res.end(JSON.stringify(payload))}
  const port=server.address()?.port
  // No browser-origin requests, DNS rebinding hosts, network access or credential use.
  if(!port||!['127.0.0.1:'+port,'localhost:'+port].includes(req.headers.host)||req.headers.origin!==undefined||req.headers['sec-fetch-site']!==undefined)return send(403,{error:'Loopback server-to-server demo only'})
  if(req.method!=='GET')return send(405,{error:'Read-only demonstration. Agent execution and chat are disabled.'})
  if(req.url==='/health')return send(200,{ok:true,status:'demo-read-only'})
  if(req.url==='/registry')return send(200,{models:{},capabilities:['profiles-read'],demo:true})
  if(req.url==='/state')return send(200,{profileName:'factory-demo-read-only',runtime:{name:'SNOSERVICE Factory — DEMO',vendor:'SNOSERVICE',version:'0.1',status:'demo-read-only',governance:'No execution'},active:Object.fromEntries(ROLES.map(role=>[role.id,'profile-only'])),demo:true,telemetry:'unavailable',capabilities:['profiles-read']})
  return send(404,{error:'Not found'})
 })
 server.requestTimeout=5000
 server.headersTimeout=5000
 return server
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const server=createDemoBridge()
 server.on('error',()=>{console.error('No se pudo iniciar el bridge local. Verificá que el puerto 7770 esté libre.');process.exitCode=1})
 server.listen(7770,'127.0.0.1',()=>console.log('Factory demo bridge: http://127.0.0.1:7770 — solo perfiles, sin ejecución.'))
}
