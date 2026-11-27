export const instant = false
import { connection } from 'next/server'
import { requireCentralAdmin } from '../../../lib/central/auth'
import LiveWorkspace from './live'

export default async function FactoryPage({searchParams}:{searchParams:Promise<{project?:string;job?:string;result?:string;view?:string;agent?:string}>}) {
  await connection()
  const admin=await requireCentralAdmin()
  return <LiveWorkspace params={await searchParams} draftKey={admin.userId}/>
}
