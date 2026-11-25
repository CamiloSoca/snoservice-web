export const instant = false
import { connection } from 'next/server'
import { redirect } from 'next/navigation'
import { requireCentralAdmin } from '../../../../lib/central/auth'

export default async function FactoryLegacyRedirect({searchParams}:{searchParams:Promise<{project?:string;job?:string;result?:string;view?:string}>}) {
  await connection()
  await requireCentralAdmin()
  const params=await searchParams
  const query=new URLSearchParams()
  for(const key of ['project','job','result','view'] as const){
    if(typeof params[key]==='string')query.set(key,params[key])
  }
  redirect('/admin/factory'+(query.size?'?'+query.toString():''))
}
