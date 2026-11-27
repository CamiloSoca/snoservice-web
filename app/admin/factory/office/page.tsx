import {connection} from 'next/server'
import {redirect} from 'next/navigation'
import {requireCentralAdmin} from '../../../../lib/central/auth'
export const instant=false
// Legacy URL only; Factory itself renders the studio directly.
export default async function LegacyOffice({searchParams}:{searchParams:Promise<{mode?:string}>}){
 await connection()
 await requireCentralAdmin()
 const {mode}=await searchParams
 redirect(mode==='demo'?'/admin/factory?mode=demo':'/admin/factory')
}
