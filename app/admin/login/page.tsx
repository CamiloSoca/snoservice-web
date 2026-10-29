export const instant = false

import { connection } from 'next/server'
import { redirect } from 'next/navigation'
import { currentSession, isCentralConfigured } from '../../../lib/central/auth'
import { AccessShell } from '../access-shell'
import LoginForm from './login-form'

export default async function CentralLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await connection()
  const session = await currentSession()
  if (session.state === 'authenticated') redirect(session.aal === 'aal2' ? '/admin' : '/admin/mfa')
  if (session.state === 'refresh') redirect('/admin/refresh')
  const { error } = await searchParams
  const configured = isCentralConfigured()

  return <AccessShell phase="login">
    <div className="sno-access-heading">
      <p className="sno-access-overline">ACCESO ADMINISTRATIVO</p>
      <h1>Bienvenido<br/>a Central<span>.</span></h1>
      <p>Ingresá con tu cuenta autorizada para continuar al centro de operaciones.</p>
    </div>
    {!configured ? <div className="sno-access-alert" role="alert">El acceso todavía no está configurado. Por seguridad, el ingreso permanece bloqueado.</div> : null}
    {error ? <div className="sno-access-alert" role="alert">{error === 'request'
      ? 'No se pudo validar la solicitud. Abrí esta página directamente y reintentá.'
      : 'No pudimos verificar las credenciales. Revisá tu correo y contraseña.'}</div> : null}
    <LoginForm configured={configured}/>
    <p className="sno-access-underform">Este acceso no permite el registro de nuevas cuentas.</p>
  </AccessShell>
}
