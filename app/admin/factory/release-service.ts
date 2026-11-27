import 'server-only'

const TEAM='team_i66QM8ay0yxz1ab9xsnoGODp'
const targets={
 maracana:{repo:'distribuidora-admin',base:'main',project:'prj_mMqwyoqJJDOp9CVOinaMjQLbKyhD',domains:['distribuidora.snoservice.uy'],private:true},
 finanzas:{repo:'Finanzas',base:'reconstruccion-node-supabase',project:'prj_n3ul7K6Y3W6g5Ud52CG5ZMSCGSAt',domains:['finanzas.snoservice.uy'],private:true},
 central:{repo:'snoservice-web',base:'main',project:'prj_PiChgJpHrhOffjBdpf5xTFP4Eiow',domains:['www.snoservice.uy','snoservice.uy'],private:false}
} as const
type Target=typeof targets[keyof typeof targets]
type Delivery={issue:number;project:string;pr:number;head:string}
export type ReleaseResult={state:'disabled'|'review'|'building'|'promote'|'published'|'blocked';message:string;commit?:string}
const sha=(x:unknown):x is string=>typeof x==='string'&&/^[0-9a-f]{40}$/.test(x)
const isDeployment=(x:unknown):x is string=>typeof x==='string'&&/^dpl_[a-zA-Z0-9]+$/.test(x)
class ReleaseError extends Error{}
function fail(msg:string):never{throw new ReleaseError(msg)}
export function configured(){return Boolean(process.env.FACTORY_RELEASE_GITHUB_TOKEN?.trim()&&process.env.FACTORY_RELEASE_VERCEL_TOKEN?.trim())}

async function json(url:string,token:string,method='GET',body?:unknown){
 const r=await fetch(url,{method,cache:'no-store',redirect:'error',signal:AbortSignal.timeout(9000),headers:{Authorization:'Bearer '+token,Accept:'application/json','Content-Type':'application/json','User-Agent':'SNOSERVICE-Factory-Release',...(url.startsWith('https://api.github.com/')?{'X-GitHub-Api-Version':'2022-11-28'}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})})
 if(!r.ok)fail((url.startsWith('https://api.github.com/')?'GitHub':'Vercel')+' rechazó la operación (HTTP '+r.status+'). Revisá permisos y estado del proyecto.')
 const raw=await r.text()
 return raw?JSON.parse(raw):null
}
function git(t:Target,path:string,method='GET',body?:unknown){return json('https://api.github.com/repos/CamiloSoca/'+t.repo+path,process.env.FACTORY_RELEASE_GITHUB_TOKEN!,method,body)}
function vercel(path:string,params:Record<string,string>={},method='GET',body?:unknown){
 const query=new URLSearchParams({...params,teamId:TEAM})
 return json('https://api.vercel.com'+path+'?'+query,process.env.FACTORY_RELEASE_VERCEL_TOKEN!,method,body)
}
async function head(t:Target){const r=await git(t,'/git/ref/heads/'+encodeURIComponent(t.base));if(!sha(r?.object?.sha))fail('No se pudo verificar la rama base.');return r.object.sha as string}
async function deployments(t:Target,commit:string,branch:string){
 const r=await vercel('/v7/deployments',{projectId:t.project,sha:commit,branch,limit:'10'})
 if(!Array.isArray(r?.deployments))fail('Respuesta inesperada de Vercel.')
 return r.deployments.filter((d:any)=>d.meta?.githubCommitSha===commit&&d.meta?.githubCommitRef===branch&&String(d.meta?.githubRepo).toLowerCase()===t.repo.toLowerCase()&&String(d.meta?.githubOrg).toLowerCase()==='camilosoca')
}
function ready(d:any){return (d?.readyState??d?.state)==='READY'&&(!d.checksState||d.checksState==='completed')&&(!d.checksConclusion||d.checksConclusion==='succeeded'||d.checksConclusion==='success')}
async function validate(t:Target,d:Delivery){
 const repo=await git(t,'')
 if(String(repo?.full_name).toLowerCase()!==('CamiloSoca/'+t.repo).toLowerCase()||repo.private!==t.private)fail('Repositorio no coincide.')
 const p=await git(t,'/pulls/'+d.pr)
 if(p?.number!==d.pr||p.head?.sha!==d.head||p.head?.ref!=='factory/fac-'+d.issue||String(p.head?.repo?.full_name).toLowerCase()!==('CamiloSoca/'+t.repo).toLowerCase()||p.base?.ref!==t.base||String(p.base?.repo?.full_name).toLowerCase()!==('CamiloSoca/'+t.repo).toLowerCase()||String(p.user?.login).toLowerCase()!=='camilosoca'||p.title!=='Factory FAC-'+d.issue+' — propuesta de cambios')fail('La PR no coincide con la entrega original.')
 return p
}
async function current(t:Target,commit:string){
 const list=await deployments(t,commit,t.base)
 const candidate=list.find((d:any)=>d.target==='production')
 if(!candidate)return {state:'building',message:'Merge confirmado. Vercel aún no registró el build de producción.',commit} as ReleaseResult
 const id=candidate.uid??candidate.id
 if(!isDeployment(id))fail('Identificador de deployment inválido.')
 const status=candidate.readyState??candidate.state
 if(status==='ERROR'||status==='CANCELED')return {state:'blocked',message:'El build de producción falló o fue cancelado. Revisá Vercel.',commit} as ReleaseResult
 if(!ready(candidate))return {state:'building',message:'Vercel está compilando o verificando la versión de producción.',commit} as ReleaseResult
 const aliases=await Promise.all(t.domains.map(domain=>vercel('/v13/deployments/'+encodeURIComponent(domain))))
 if(aliases.every(a=>a.id===id&&a.meta?.githubCommitSha===commit&&a.target==='production'&&ready(a)))return {state:'published',message:'Publicado. Todos los dominios apuntan al commit aprobado.',commit} as ReleaseResult
 if(await head(t)!==commit)return {state:'blocked',message:'La rama de producción avanzó. No se promoverá una versión anterior.',commit} as ReleaseResult
 return {state:'promote',message:'Build READY. Falta asignar la versión a los dominios de producción.',commit} as ReleaseResult
}
export async function release(d:Delivery,action:'status'|'publish'|'promote'):Promise<ReleaseResult>{
 if(!configured())return {state:'disabled',message:'Falta configurar las credenciales de publicación de GitHub y Vercel (solo servidor).'}
 if(!Number.isSafeInteger(d.issue)||d.issue<1||!Number.isSafeInteger(d.pr)||d.pr<1||!sha(d.head)||!Object.hasOwn(targets,d.project))return {state:'blocked',message:'Entrega inválida o proyecto protegido.'}
 const t=targets[d.project as keyof typeof targets]
 try{
  // Verify project production branch explicitly; never promote a non-production branch.
  const project=await vercel('/v9/projects/'+t.project)
  if(project?.id!==t.project||project?.link?.productionBranch!==t.base)fail('La rama productiva de Vercel no coincide con Factory.')
  let p=await validate(t,d)
  if(p.merged===true){
   if(!sha(p.merge_commit_sha))fail('No se pudo identificar el commit fusionado.')
   const commit=p.merge_commit_sha
   const state=await current(t,commit)
   if(action==='promote'&&state.state==='promote'){
    const candidates=await deployments(t,commit,t.base)
    const candidate=candidates.find((x:any)=>x.target==='production'&&ready(x))
    const id=candidate?.uid??candidate?.id
    if(!isDeployment(id)||await head(t)!==commit)fail('El commit de producción cambió. No se promovió.')
    await vercel('/v10/projects/'+t.project+'/promote/'+id,{},'POST',{})
    return await current(t,commit)
   }
   return state
  }
  if(p.state!=='open')fail('La PR está cerrada sin merge.')
  const original=await git(t,'/git/commits/'+d.head)
  const base=await head(t)
  if(original?.parents?.length!==1||original.parents[0]?.sha!==base||p.base?.sha!==base)fail('La rama base cambió desde el desarrollo. Revisá y validá nuevamente antes de publicar.')
  const preview=(await deployments(t,d.head,'factory/fac-'+d.issue)).find((x:any)=>x.target!== 'production'&&ready(x))
  if(!preview)return {state:'blocked',message:'La versión de prueba todavía no está READY o tiene verificaciones pendientes.'}
  if(action!=='publish')return {state:'review',message:'Preview READY. Revisá la PR y confirmá la publicación del commit indicado.',commit:d.head}
  if(p.draft===true){
   if(typeof p.node_id!=='string')fail('PR inválida.')
   const result=await json('https://api.github.com/graphql',process.env.FACTORY_RELEASE_GITHUB_TOKEN!,'POST',{query:'mutation($id:ID!){markPullRequestReadyForReview(input:{pullRequestId:$id}){pullRequest{isDraft}}}',variables:{id:p.node_id}})
   if(result?.errors?.length||result?.data?.markPullRequestReadyForReview?.pullRequest?.isDraft!==false)fail('No se pudo preparar la PR para revisión.')
  }
  p=await validate(t,d)
  if(p.merged===true&&sha(p.merge_commit_sha))return current(t,p.merge_commit_sha)
  if(p.mergeable!==true||p.draft||p.state!=='open'||await head(t)!==base)fail('La PR no está lista para merge o la rama base cambió.')
  const merged=await git(t,'/pulls/'+d.pr+'/merge','PUT',{sha:d.head,merge_method:'squash',commit_title:'Factory FAC-'+d.issue+' — publicación aprobada'})
  if(merged?.merged!==true||!sha(merged.sha))fail('GitHub no confirmó el merge.')
  return {state:'building',message:'Merge confirmado. Vercel iniciará el deploy de producción. Actualizá el estado para comprobar el dominio.',commit:merged.sha}
 }catch(e){return {state:'blocked',message:e instanceof ReleaseError?e.message:'No se pudo confirmar el estado. No reintentes a ciegas: actualizá y revisá la PR.'}}
}
