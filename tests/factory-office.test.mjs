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
 const queue=source('app/admin/factory/office/queue.ts'), page=source('app/admin/factory/office/page.tsx'), client=source('app/admin/factory/office/office.tsx')
 assert.match(queue,/import 'server-only'/);assert.match(queue,/await requireCentralAdmin\(\)/);assert.match(page,/await requireCentralAdmin\(\)/)
 assert.match(queue,/method:'GET'/);assert.match(queue,/repo.private!==true/);assert.match(queue,/redirect:'error'/);assert.doesNotMatch(queue,/method:'(?:POST|PATCH|DELETE)'/)
 assert.doesNotMatch(client,/FACTORY_QUEUE_TOKEN|api.github.com|process.env|dangerouslySetInnerHTML/)
})
