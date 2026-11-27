import 'server-only'
import {parseTask,withEvents,type Snapshot,type Task} from './model'
import {requireCentralAdmin} from '../../../../lib/central/auth'
const QUEUE='CamiloSoca/Finanzas'
async function get(path:string){
 const token=process.env.FACTORY_QUEUE_TOKEN?.trim()
 if(!token)throw Error('queue unavailable')
 const response=await fetch('https://api.github.com/repos/'+QUEUE+path,{method:'GET',headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'SNOSERVICE-Factory-Office'},cache:'no-store',redirect:'error',signal:AbortSignal.timeout(10000)})
 if(!response.ok)throw Error('queue unavailable')
 return response.json()
}
export async function readOffice():Promise<Snapshot>{
 await requireCentralAdmin()
 const checkedAt=new Date().toISOString()
 try{
  const repo=await get('')
  if(repo.private!==true||repo.has_issues!==true||String(repo.full_name).toLowerCase()!==QUEUE.toLowerCase())throw Error('invalid queue')
  const raw=await get('/issues?state=open&per_page=100&sort=updated&direction=desc')
  if(!Array.isArray(raw))throw Error('invalid queue')
  const tasks=raw.map(parseTask).filter((t):t is Task=>t!==null).slice(0,8)
  const items=await Promise.all(tasks.map(async t=>{try{return withEvents(t,await get('/issues/'+t.id+'/comments?per_page=100&sort=created&direction=desc'))}catch{return {...t,stage:'unknown' as const}}}))
  return {mode:'live',connected:true,checkedAt,tasks:items}
 }catch{return {mode:'live',connected:false,checkedAt,tasks:[]}}
}
