export const instant = false

import { connection } from 'next/server'
import { redirect } from 'next/navigation'
import { AccessShell } from '../access-shell'
import { centralLogout } from '../actions'
import { VerifyMfaForm } from './verify-form'
import { EnrollForm } from './enroll-form'
import { requireCentralPendingMfa } from '../../../lib/central/auth'

export default async function MfaPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await connection()
  const session = await requireCentralPendingMfa()
  if (session.aal === 'aal2') redirect('/admin')
  const factors = session.totpFactors
  const factor = factors?.find(f => f.status === 'verified')
  const { error } = await searchParams

  return <AccessShell phase="mfa">
    <div className="sno-access-heading">
      <p className="sno-access-overline">VERIFICACIÓN DE IDENTIDAD</p>
      <h1>Una última<br/>comprobación<span>.</span></h1>
      <p>Ingresá el código temporal de tu autenticador para abrir el panel.</p>
    </div>
    {error ? <div className="sno-access-alert" role="alert">{error === 'request'
      ? 'No se pudo validar la solicitud. Abrí esta pantalla directamente y reintentá.'
      : 'No pudimos verificar el código. Revisá que siga vigente e intentá de nuevo.'}</div> : null}
    {factors === null ? <div className="sno-access-alert" role="alert">No es posible consultar los factores de acceso. El panel permanece bloqueado.</div> :
      factor ? <VerifyMfaForm factorId={factor.id} /> : <EnrollForm />}
    <form action={centralLogout} className="sno-access-signout"><button type="submit">Usar otra cuenta</button></form>
  </AccessShell>
}
