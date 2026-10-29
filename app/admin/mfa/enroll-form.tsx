'use client'

import { useActionState } from 'react'
import Image from 'next/image'
import { centralEnroll, type EnrollmentState } from '../actions'
import { VerifyMfaForm } from './verify-form'

const initial: EnrollmentState = { error: '', factorId: '', qr: '', secret: '' }

export function EnrollForm() {
  const [state, action, pending] = useActionState(centralEnroll, initial)
  return <div>
    {!state.factorId ? <form action={action} className="sno-form">
      <p className="sno-muted">Activá un autenticador TOTP en tu teléfono. Este paso es obligatorio antes de acceder al panel.</p>
      {state.error ? <div className="sno-alert" role="alert">{state.error}</div> : null}
      <button className="sno-button sno-primary" disabled={pending} type="submit">{pending ? 'Preparando…' : 'Configurar autenticador'}</button>
    </form> : <div>
      <p className="sno-muted">Escaneá el QR con tu aplicación de autenticación y escribí el código de seis dígitos.</p>
      {state.qr ? <Image unoptimized width={200} height={200} className="sno-qr" alt="Código QR para configurar el segundo factor" src={state.qr} /> : null}
      <p className="sno-muted">Código de configuración manual (no lo compartas):</p>
      <code className="sno-secret">{state.secret}</code>
      <VerifyMfaForm factorId={state.factorId} enrollment />
    </div>}
  </div>
}
