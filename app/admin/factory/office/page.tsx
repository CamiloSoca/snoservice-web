export const instant = false
import {connection} from 'next/server'
import {requireCentralAdmin} from '../../../../lib/central/auth'
import {readOffice} from './queue'
import {DEMO} from './model'
import Office from './office'
import './office.css'
export default async function FactoryOffice({searchParams}:{searchParams:Promise<{mode?:string}>}){
 await connection()
 await requireCentralAdmin()
 const {mode}=await searchParams
 const snapshot=mode==='demo'?DEMO:await readOffice()
 return <Office snapshot={snapshot}/>
}
