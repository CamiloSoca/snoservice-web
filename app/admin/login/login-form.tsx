'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Eye, EyeOff, ArrowRight, Mail, LockKeyhole } from 'lucide-react'
import { centralLogin } from '../actions'

function Submit({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()
  return <button type="submit" className="sno-access-submit" disabled={disabled || pending} aria-busy={pending}>
    <span>{pending ? 'Validando acceso…' : 'Continuar'}</span>
    {pending ? <span className="sno-access-loading" aria-hidden="true"/> : <ArrowRight size={18} strokeWidth={1.8}/>}
  </button>
}

export default function LoginForm({ configured }: { configured: boolean }) {
  const [visible, setVisible] = useState(false)
  return <form action={centralLogin} className="sno-access-form">
    <div className="sno-access-field">
      <label htmlFor="sno-access-email">Correo electrónico</label>
      <div className="sno-access-input-wrap">
        <Mail size={18} aria-hidden="true" className="sno-access-input-icon"/>
        <input id="sno-access-email" type="email" name="email" autoComplete="username" autoCapitalize="none"
          spellCheck={false} required maxLength={254} placeholder="tu@correo.com" disabled={!configured}/>
      </div>
    </div>
    <div className="sno-access-field">
      <label htmlFor="sno-access-password">Contraseña</label>
      <div className="sno-access-password-wrap sno-access-input-wrap">
        <LockKeyhole size={18} aria-hidden="true" className="sno-access-input-icon"/>
        <input id="sno-access-password" type={visible ? 'text':'password'} name="password" autoComplete="current-password"
          required minLength={8} maxLength={200} placeholder="Ingresá tu contraseña" disabled={!configured}/>
        <button type="button" className="sno-access-password-toggle" onClick={()=>setVisible(v=>!v)}
          aria-label={visible?'Ocultar contraseña':'Mostrar contraseña'} aria-pressed={visible} disabled={!configured}>
          {visible?<EyeOff size={18}/>:<Eye size={18}/>}
        </button>
      </div>
    </div>
    <Submit disabled={!configured}/>
  </form>
}
