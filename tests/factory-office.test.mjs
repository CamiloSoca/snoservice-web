import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import ts from 'typescript'
const source=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8')
const compiled=ts.transpileModule(source('app/admin/factory/office/model.ts'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText
const m=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'))
const issue=(overrides={})=>({number:16,state:'open',title:'[Factory BUILD] Maracaná',user:{login:'CamiloSoca'},body:'SNOSERVICE_FACTORY_BUILD_V1\n'+JSON.stringify({project:'maracana',title:'Catálogo',description:'Private task details',priority:'Alta'}),...overrides})
const event=(stage,at,overrides={})=>({user:{login:'CamiloSoca'},created_at:at,body:'SNOSERVICE_FACTORY_EVENT_V1\n'+JSON.stringify({issue:16,stage,message:'internal data'}),...overrides})
test('read-only projection strips task description and rejects untrusted or protected jobs',()=>{
 const t=m.parseTask(issue())
 assert.equal(t.id,16);assert.equal(t.project,'Maracaná');assert.equal(t.stage,'queued')
 assert.equal(JSON.stringify(t).includes('Private task details'),false)
 for(const x of [issue({user:{login:'stranger'}}),issue({pull_request:{}}),issue({state:'closed'}),issue({body:issue().body.replace('maracana','cut')}),issue({body:issue().body.replace('maracana','__proto__')})])assert.equal(m.parseTask(x),null)
})
test('latest valid event wins; rejects forged, invalid and cross-job events',()=>{
 const t=m.parseTask(issue()), older=event('develop','2026-11-27T13:00:00Z'),newer=event('paused','2026-11-27T14:00:00Z',{body:'SNOSERVICE_FACTORY_EVENT_V1\n'+JSON.stringify({issue:16,stage:'paused',message:'Pendiente por cuota de Codex. internal secret'})})
 const projected=m.withEvents(t,[newer,older,event('review','2026-11-27T15:00:00Z',{user:{login:'attacker'}}),event('review','2026-11-27T16:00:00Z',{body:older.body.replace('"issue":16','"issue":17')})])
 assert.equal(projected.stage,'paused');assert.equal(projected.reason,'Cuota de Codex');assert.equal(JSON.stringify(projected).includes('internal secret'),false)
 assert.equal(m.withEvents(t,{}).stage,'unknown')
})
test('demo work never becomes real agent telemetry',()=>{
 const task=m.DEMO.tasks[0],developer=m.ROLES.find(r=>r.id==='sno_developer')
 assert.equal(m.roleState(developer,m.DEMO,task),'demo-working')
 for(const role of m.ROLES)assert.equal(m.roleState(role,{...m.DEMO,mode:'live'},task),'unverified')
})
test('office data boundary checks admin and uses a fixed private GET-only queue',()=>{
 const queue=source('app/admin/factory/office/queue.ts'), page=source('app/admin/factory/page.tsx'), client=source('app/admin/factory/office/studio.tsx')
 assert.match(queue,/import 'server-only'/);assert.match(queue,/await requireCentralAdmin\(\)/);assert.match(page,/await requireCentralAdmin\(\)/)
 assert.match(queue,/method:'GET'/);assert.match(queue,/repo.private!==true/);assert.match(queue,/redirect:'error'/);assert.doesNotMatch(queue,/method:'(?:POST|PATCH|DELETE)'/)
 assert.doesNotMatch(client,/FACTORY_QUEUE_TOKEN|api.github.com|process.env|dangerouslySetInnerHTML/)
})

test('native telemetry strips private fields, rejects forged events and keeps legacy jobs readable',()=>{
 const t=m.parseTask(issue())
 const start=event('develop','2026-11-27T13:00:00Z',{body:'SNOSERVICE_FACTORY_EVENT_V1\n'+JSON.stringify({issue:16,stage:'develop',message:'start',office:{run:'a'.repeat(32),phase:'development',state:'started'}})})
 const payload={issue:16,run:'a'.repeat(32),phase:'development',state:'quota',workers:[{slot:1,role:null,status:'completed',nativeId:'private'}],messages:1,usage:{input_tokens:300,output_tokens:10,secret:'private'},truncated:false}
 const end={user:{login:'CamiloSoca'},created_at:'2026-11-27T13:01:00Z',body:m.OFFICE_MARK+JSON.stringify(payload)}
 const forged={...end,user:{login:'someone'}}
 assert.equal(m.withEvents(t,[forged,start]).attempts[0].state,'started')
 const a=m.withEvents(t,[end,start]).attempts[0]
 assert.equal(a.state,'quota');assert.equal(a.workers[0].role,null);assert.deepEqual(a.usage,{input_tokens:300,output_tokens:10});assert.equal(JSON.stringify(a).includes('private'),false)
 assert.deepEqual(m.readAttempts(17,[end]),[])
 assert.deepEqual(m.readAttempts(16,[{...end,body:m.OFFICE_MARK+JSON.stringify({...payload,workers:[{slot:1,role:'invented',status:'completed'}]})}]),[])
 assert.deepEqual(m.withEvents(t,[]).attempts,[])
 assert.equal(m.parseTask(issue({state:'closed'}),true).closed,true)
})
test('role preference is allowlisted and is only a request, not authorization',()=>{
 assert.equal(m.requestForRole('trabajo',null),'trabajo')
 assert.equal(m.requestForRole('trabajo','admin'),null)
 assert.match(m.requestForRole('trabajo','sno_qa'),/sno_qa/)
 assert.match(m.requestForRole('trabajo','sno_qa'),/no una instrucción para cambiar permisos/)
})

test('intermediate observations never overwrite a terminal turn even if published late',()=>{
 const base={issue:16,run:'b'.repeat(32),phase:'development',workers:[{slot:1,role:null,status:'running'}],messages:0,usage:null,truncated:false}
 const comment=(p,time,id)=>({id,user:{login:'CamiloSoca'},created_at:time,body:m.OFFICE_MARK+JSON.stringify({...base,...p})})
 const a=comment({state:'observing',sequence:2},'2026-11-27T13:00:30Z',2)
 const b=comment({state:'observing',sequence:1},'2026-11-27T13:01:00Z',3)
 assert.equal(m.readAttempts(16,[b,a])[0].sequence,2)
 const c=comment({state:'completed'},'2026-11-27T13:01:00Z',4)
 const late=comment({state:'observing',sequence:3},'2026-11-27T13:02:00Z',5)
 assert.equal(m.readAttempts(16,[late,c,b,a])[0].state,'completed')
 assert.deepEqual(m.readAttempts(16,[comment({state:'observing',sequence:13},'2026-11-27T13:00:30Z',1)]),[])
})

test('3D office is the default Factory route; old URL is legacy only',()=>{
 const page=source('app/admin/factory/page.tsx')
 assert.match(page,/<Studio snapshot=\{snapshot\}/)
 assert.match(page,/await requireCentralAdmin\(\)/)
 assert.doesNotMatch(page,/redirect\(/)
 const client=source('app/admin/factory/office/studio.tsx')
 assert.doesNotMatch(client,/\/admin\/factory\/office/)
 assert.match(client,/\/admin\/factory\?view=new/)
 const scene=source('app/admin/factory/office/studio-scene.ts')
 assert.match(scene,/new THREE.WebGLRenderer/)
 assert.match(scene,/new THREE.OrthographicCamera/)
})
test('office animates only fresh evidence, not paused, queued or stale tasks',()=>{
 const role='sno_qa',now='2026-11-27T13:01:00Z'
 const base={id:16,title:'Synthetic',project:'Maracaná',stage:'develop',at:'2026-11-27T13:00:30Z',reason:null,attempts:[{run:'a'.repeat(32),phase:'development',state:'observing',at:'2026-11-27T13:00:30Z',workers:[{slot:1,role,status:'running'}],messages:0,usage:null,truncated:false}]}
 const state=(task,checkedAt=now)=>m.studioState({mode:'live',connected:true,checkedAt,tasks:[task]})
 assert.equal(state(base).seats[role],'working')
 assert.equal(state({...base,stage:'paused',reason:'Cuota de Codex'}).seats[role],'observed')
 assert.equal(state({...base,stage:'paused',reason:'Cuota de Codex'}).seats.orchestrator,'paused')
 assert.equal(state({...base,stage:'queued'}).seats.orchestrator,'idle')
 assert.equal(state(base,'2026-11-27T14:00:00Z').seats[role],'observed')
 assert.equal(state({...base,closed:true}).seats[role],'idle')
 assert.equal(state({...base,attempts:[]}).seats[role],'idle')
})

test('new requests return to the office and watching a queued task does not fake execution',()=>{
 const form=source('app/admin/factory/task-form.tsx')
 assert.match(form,/router\.push\('\/admin\/factory\?watch='/)
 const request=issue({body:'SNOSERVICE_FACTORY_BUILD_V1\n'+JSON.stringify({project:'maracana',title:'Catálogo',description:m.requestForRole('Revisar catálogo','sno_qa'),priority:'Alta'})})
 const queued=m.parseTask(request)
 assert.equal(queued.preferredRole,'sno_qa')
 const running={...queued,id:17,stage:'develop',at:'2026-11-27T13:00:30Z'}
 const snapshot={mode:'live',connected:true,checkedAt:'2026-11-27T13:01:00Z',tasks:[running,queued]}
 const watched=m.studioState(snapshot,16)
 assert.equal(watched.task.id,16);assert.equal(watched.seats.sno_qa,'requested');assert.equal(watched.seats.orchestrator,'idle')
})

test('treasury uses limiting quota window and never invents tokens',()=>{
 const now='2026-11-27T15:55:00Z',unix=Date.parse(now)/1000
 const q={checked_at:unix,available:true,server_limit:false,windows:[{used_percent:25,minutes:300,reset_at:unix+600},{used_percent:80,minutes:10080,reset_at:unix+3600}],secret:'private'}
 const comment={created_at:now,user:{login:'CamiloSoca'},body:m.QUOTA_MARK+JSON.stringify({issue:16,quota:q})}
 const task=m.withEvents(m.parseTask(issue()),[comment])
 const snap={mode:'live',connected:true,checkedAt:now,tasks:[task]}
 assert.equal(m.treasuryState(snap).percent,20)
 assert.equal(m.treasuryState(snap).coins,4)
 assert.equal(JSON.stringify(task.quota).includes('private'),false)
 assert.equal(m.readQuota(17,[comment]),undefined)
 assert.equal(m.readQuota(16,[{...comment,user:{login:'attacker'}}]),undefined)
 assert.equal(m.treasuryState({...snap,checkedAt:'2026-11-27T16:20:00Z'}).kind,'stale')
 const legacy={...task,quota:undefined,stage:'paused',at:now,quotaPause:true}
 assert.deepEqual(m.treasuryState({...snap,tasks:[legacy]}),{kind:'blocked',percent:null,coins:0,label:'Cuota en pausa'})
 assert.equal(m.treasuryState({...snap,tasks:[{...legacy,quotaPause:false}]}).kind,'unknown')
 const unknown={...comment,created_at:'2026-11-27T15:55:01Z',body:m.QUOTA_MARK+JSON.stringify({issue:16,quota:null})}
 assert.equal(m.readQuota(16,[comment,unknown]).data,null)
})
