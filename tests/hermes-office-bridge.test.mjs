import {test} from 'node:test'
import assert from 'node:assert/strict'
import {once} from 'node:events'
import {request} from 'node:http'
import {createDemoBridge} from '../scripts/hermes-office-bridge.mjs'
test('Hermes3D demo contract exposes only roster and blocks execution or browser requests',async()=>{
 const server=createDemoBridge()
 server.listen(0,'127.0.0.1');await once(server,'listening')
 const base='http://127.0.0.1:'+server.address().port
 try{
  assert.equal((await (await fetch(base+'/health')).json()).status,'demo-read-only')
  const state=await (await fetch(base+'/state')).json()
  assert.equal(state.demo,true);assert.equal(state.telemetry,'unavailable');assert.equal(Object.keys(state.active).length,8)
  assert.ok(Object.values(state.active).every(x=>x==='profile-only'))
  const registry=await (await fetch(base+'/registry')).json();assert.deepEqual(registry.models,{})
  assert.equal((await fetch(base+'/v1/chat/completions',{method:'POST',body:'{}'})).status,405)
  assert.equal((await fetch(base+'/state',{headers:{Origin:'http://example.test'}})).status,403)
  // Fetch normalizes Host; use the low-level HTTP client to send the actual hostile header.
  const hostileStatus=await new Promise((resolve,reject)=>{const req=request(base+'/state',{headers:{Host:'evil.example'}},res=>{res.resume();res.once('end',()=>resolve(res.statusCode))});req.once('error',reject);req.end()})
  assert.equal(hostileStatus,403)
  assert.equal((await fetch(base+'/secrets')).status,404)
 }finally{await new Promise((resolve,reject)=>server.close(err=>err?reject(err):resolve()))}
})
