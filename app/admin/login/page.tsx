export const instant = false

import { connection } from 'next/server'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { centralLogin } from '../actions'
import { currentSession, isCentralConfigured } from '../../../lib/central/auth'


export default async function CentralLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await connection()
  const session = await currentSession()
  if (session.state === 'authenticated') redirect(session.aal === 'aal2' ? '/admin' : '/admin/mfa')
  const { error } = await searchParams
  const configured = isCentralConfigured()
  return <main className="sno-auth-screen">
    <div className="sno-auth-panel">
      <div className="sno-brand"><Image className="sno-brand-logo" src="/logo.png" alt="" width={36} height={36} priority /><span>SNOOSERVICE <small>CENTRAL</small></span></div>
      <span className="sno-overline">ACCESO RESTRINGIDO</span>
      <h1>Administración segura.</h1>
      <p className="sno-muted">Ingresá con tu cuenta autorizada. Después se solicitará el segundo factor.</p>
      {!configured ? <div className="sno-alert" role="alert">El sistema de acceso aún no fue configurado. Por seguridad, el ingreso permanece bloqueado.</div> : null}
      {error ? <div className="sno-alert" role="alert">No fue posible iniciar sesión. Verificá tus credenciales e intentá nuevamente.</div> : null}
      <form action={centralLogin} className="sno-form">
        <label htmlFor="email">Correo electrónico</label>
        <input id="email" type="email" name="email" autoComplete="username" required maxLength={254} disabled={!configured} />
        <label htmlFor="password">Contraseña</label>
        <input id="password" type="password" name="password" autoComplete="current-password" required minLength={8} maxLength={200} disabled={!configured} />
        <button className="sno-button sno-primary" type="submit" disabled={!configured}>Ingresar de forma segura</button>
      </form>
      <p className="sno-auth-note">No existe registro público. Las cuentas deben ser habilitadas expresamente por el administrador.</p>
      <a className="sno-back" href="/">Volver al sitio público</a>
    </div>
  </main>
}
