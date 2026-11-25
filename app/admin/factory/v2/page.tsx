export const instant = false

import { connection } from 'next/server'
import { requireCentralAdmin } from '../../../../lib/central/auth'
import Workspace from './workspace'

export default async function FactoryV2Page() {
  await connection()
  await requireCentralAdmin()
  return <Workspace/>
}
