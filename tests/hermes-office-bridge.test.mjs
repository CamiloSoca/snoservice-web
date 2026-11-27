import {test} from 'node:test'
import assert from 'node:assert/strict'
import {once} from 'node:events'
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
  assert.equal((await fetch(base+'/state',{headers:{Host:'evil.example'}})).status,403)
  assert.equal((await fetch(base+'/secrets')).status,404)
 }finally{await new Promise((resolve,reject)=>server.close(err=>err?reject(err):resolve()))}
})
