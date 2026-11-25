export const instant = false
import { connection } from 'next/server'
import { requireCentralAdmin } from '../../../../lib/central/auth'
import Workspace from './workspace'
import LiveWorkspace from './live'

export default async function FactoryV2Page({searchParams}:{searchParams:Promise<{demo?:string;project?:string;job?:string;result?:string;view?:string}>}) {
  await connection()
  await requireCentralAdmin()
  const params=await searchParams
  return params.demo==='1'?<Workspace/>:<LiveWorkspace params={params}/>
}
