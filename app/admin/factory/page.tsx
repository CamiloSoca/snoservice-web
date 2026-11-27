export const instant = false
import {connection} from 'next/server'
import {requireCentralAdmin} from '../../../lib/central/auth'
import LiveWorkspace from './live'
import Studio from './office/studio'
import {readOffice} from './office/queue'
import {DEMO} from './office/model'
import './office/studio.css'

export default async function FactoryPage({searchParams}:{searchParams:Promise<{project?:string;job?:string;result?:string;view?:string;agent?:string;mode?:string}>}){
 await connection()
 const admin=await requireCentralAdmin()
 const params=await searchParams
 if(params.view==='new'||params.view==='tasks'||params.job||params.project||params.result)return <LiveWorkspace params={params} draftKey={admin.userId}/>
 const snapshot=params.mode==='demo'?DEMO:await readOffice()
 return <Studio snapshot={snapshot}/>
}
