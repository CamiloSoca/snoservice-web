export const instant = false

import { connection } from 'next/server'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { centralLogout } from '../actions'
import { VerifyMfaForm } from './verify-form'
import { requireCentralPendingMfa, listTotpFactors } from '../../../lib/central/auth'
import { EnrollForm } from './enroll-form'


export default async function MfaPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await connection()
  const session = await requireCentralPendingMfa()
  if (session.aal === 'aal2') redirect('/admin')
  const factors = await listTotpFactors(session.accessToken)
  const factor = factors?.find(f => f.status === 'verified')
  const { error } = await searchParams
  return <main className="sno-auth-screen"><div className="sno-auth-panel">
    <div className="sno-brand"><Image className="sno-brand-logo" src="/logo.png" alt="" width={36} height={36} priority /><span>SNOOSERVICE <small>CENTRAL</small></span></div>
    <span className="sno-overline">PROTECCIÓN DE IDENTIDAD</span>
    <h1>Segundo factor.</h1>
    <p className="sno-muted">Tu cuenta todavía no tiene acceso al panel. Completá la verificación para continuar.</p>
    {error ? <div className="sno-alert" role="alert">{error === 'request'
      ? 'El navegador no pudo completar la solicitud de forma segura. Abrí esta página directamente y reintentá.'
      : error === 'expired'
        ? 'La sesión venció. Volvé a ingresar con tu correo y contraseña.'
        : 'El código no pudo verificarse. Revisá que esté vigente e intentá nuevamente.'}</div> : null}
    {factors === null ? <div className="sno-alert">No es posible consultar los factores de acceso. Por seguridad, el panel continúa bloqueado.</div> :
      factor ? <VerifyMfaForm factorId={factor.id} /> : <EnrollForm />}
    <form action={centralLogout} className="sno-form"><button className="sno-button sno-secondary" type="submit">Cerrar sesión</button></form>
  </div></main>
}
