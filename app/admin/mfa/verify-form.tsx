'use client'

import { useState, type FormEvent } from 'react'
import { useFormStatus } from 'react-dom'
import { centralVerifyMfa } from '../actions'

/**
 * Let the user see why a form cannot be submitted.
 * Safari may quietly reject an HTML input pattern for a pasted/auto-filled code.
 * This client-side convenience does not grant access: the server action validates
 * the 6-digit code, the factor ID, the logged-in admin and AAL2 independently.
 */
function VerifyButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button className="sno-button sno-primary sno-mfa-submit" type="submit" disabled={pending} aria-busy={pending}>
      {pending ? (
        <><span className="sno-mfa-spinner" aria-hidden="true" /> Verificando identidad…</>
      ) : label}
    </button>
  )
}

export function VerifyMfaForm({ factorId, enrollment = false }: {
  factorId: string
  enrollment?: boolean
}) {
  const [error, setError] = useState('')
  const label = enrollment ? 'Verificar y activar' : 'Verificar identidad'

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // Read the actual input value: iOS one-time-code autofill can update the DOM
    // before React receives an onChange notification.
    const input = event.currentTarget.elements.namedItem('code')
    const normalized = input instanceof HTMLInputElement
      ? input.value.replace(/[^0-9]/g, '').slice(0, 6)
      : ''
    if (!/^\d{6}$/.test(normalized)) {
      event.preventDefault()
      setError('Ingresá los seis números del código de tu aplicación autenticadora.')
      return
    }
    if (input instanceof HTMLInputElement) input.value = normalized
    setError('')
  }

  return (
    <form action={centralVerifyMfa} className="sno-form sno-mfa-form" noValidate onSubmit={handleSubmit}>
      <input type="hidden" name="factor_id" value={factorId} />
      <label htmlFor="totp-code">{enrollment ? 'Código temporal de seis números' : 'Código de tu aplicación autenticadora'}</label>
      <input
        id="totp-code"
        type="text"
        name="code"
        onInput={(event) => {
          // Strip spaces and punctuation added by iOS autofill or copy/paste.
          const input = event.currentTarget
          const normalized = input.value.replace(/[^0-9]/g, '').slice(0, 6)
          if (input.value !== normalized) input.value = normalized
          if (error) setError('')
        }}
        inputMode="numeric"
        autoComplete="one-time-code"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        enterKeyHint="done"
        maxLength={16}
        aria-describedby={error ? 'totp-validation-error' : 'totp-help'}
        aria-invalid={Boolean(error)}
        placeholder="000000"
        className="sno-mfa-code"
      />
      <p id="totp-help" className="sno-mfa-help">Usá el código vigente de seis dígitos. Si lo pegás, quitamos los espacios automáticamente.</p>
      {error ? <p id="totp-validation-error" className="sno-mfa-feedback" role="alert">{error}</p> : null}
      <VerifyButton label={label} />
    </form>
  )
}
