'use server'

import { redirect } from 'next/navigation'
import { authApi, clearTokens, currentSession, isAdminId, requireCentralPendingMfa, sessionFromAuthResponse, storeTokens, validTokens, verifyAccessToken } from '../../lib/central/auth'
import { assertSameOrigin, auditSecurity, validEmail, validTotp } from '../../lib/central/guard'

export async function centralLogin(form: FormData) {
  if (!(await assertSameOrigin())) redirect('/admin/login?error=request')
  const email = form.get('email')
  const password = form.get('password')
  if (!validEmail(email) || typeof password !== 'string' || password.length < 8 || password.length > 200) {
    redirect('/admin/login?error=credentials')
  }
  const response = await authApi('/token?grant_type=password', 'POST', undefined, { email, password })
  if (!response.ok || !validTokens(response.data)) {
    auditSecurity('login_failed')
    redirect('/admin/login?error=credentials')
  }
  const verified = sessionFromAuthResponse(response.data) ?? await verifyAccessToken(response.data.access_token)
  if (!verified || !isAdminId(verified.userId)) {
    auditSecurity('login_denied')
    redirect('/admin/login?error=credentials')
  }
  await storeTokens(response.data)
  auditSecurity('login_success', verified.userId)
  redirect(verified.aal === 'aal2' ? '/admin' : '/admin/mfa')
}

export async function centralLogout() {
  if (!(await assertSameOrigin())) redirect('/admin/login')
  const current = await currentSession()
  if (current.state === 'authenticated') {
    await authApi('/logout?scope=local', 'POST', current.accessToken)
    auditSecurity('logout', current.userId)
  }
  await clearTokens()
  redirect('/admin/login')
}

export type EnrollmentState = { error: string; factorId: string; qr: string; secret: string }
const empty: EnrollmentState = { error: '', factorId: '', qr: '', secret: '' }
export async function centralEnroll(_state: EnrollmentState, _form: FormData): Promise<EnrollmentState> {
  if (!(await assertSameOrigin())) return { ...empty, error: 'Solicitud no permitida.' }
  const user = await requireCentralPendingMfa()
  if (user.aal === 'aal2') return { ...empty, error: 'Tu segundo factor ya está activo.' }
  const known = user.totpFactors
  if (!known) return { ...empty, error: 'No se pudo comprobar los factores existentes.' }
  if (known.some(f => f.status === 'verified')) return { ...empty, error: 'Ya existe un segundo factor. Ingresá su código.' }
  // Avoid multiplying unverified factors. Supabase can limit pending enrollment factors.
  if (known.some(f => f.status === 'unverified')) return { ...empty, error: 'Hay un enrolamiento pendiente. Cerrá sesión e intentá nuevamente si es necesario.' }
  const res = await authApi('/factors', 'POST', user.accessToken, { factor_type: 'totp', friendly_name: 'SNOOSERVICE Central' })
  if (!res.ok || !/^[0-9a-f-]{36}$/i.test(res.data?.id || '') ||
    typeof res.data?.totp?.secret !== 'string' || typeof res.data?.totp?.qr_code !== 'string') {
    return { ...empty, error: 'No fue posible activar el segundo factor.' }
  }
  const svg = res.data.totp.qr_code as string
  const qr = svg.length <= 100000 && svg.trimStart().startsWith('<svg')
    ? `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}` : ''
  auditSecurity('mfa_enrollment_started', user.userId)
  return { error: '', factorId: res.data.id, qr, secret: res.data.totp.secret.slice(0, 200) }
}

export async function centralVerifyMfa(form: FormData) {
  if (!(await assertSameOrigin())) {
    auditSecurity('mfa_origin_denied')
    redirect('/admin/mfa?error=request')
  }
  const user = await requireCentralPendingMfa()
  if (user.aal === 'aal2') redirect('/admin')
  const factorId = form.get('factor_id')
  const code = form.get('code')
  if (typeof factorId !== 'string' || !/^[0-9a-f-]{36}$/i.test(factorId) || !validTotp(code)) {
    auditSecurity('mfa_invalid_format', user.userId)
    redirect('/admin/mfa?error=code')
  }
  const factors = user.totpFactors
  if (!factors || !factors.some(f => f.id === factorId)) {
    auditSecurity('mfa_factor_denied', user.userId)
    redirect('/admin/mfa?error=code')
  }
  const challenge = await authApi(`/factors/${factorId}/challenge`, 'POST', user.accessToken, {})
  if (!challenge.ok || typeof challenge.data?.id !== 'string') {
    auditSecurity('mfa_challenge_failed', user.userId)
    redirect('/admin/mfa?error=code')
  }
  const result = await authApi(`/factors/${factorId}/verify`, 'POST', user.accessToken, {
    challenge_id: challenge.data.id,
    code,
  })
  if (!result.ok || !validTokens(result.data)) {
    auditSecurity('mfa_failed', user.userId)
    redirect('/admin/mfa?error=code')
  }
  const verified = sessionFromAuthResponse(result.data) ?? await verifyAccessToken(result.data.access_token)
  if (!verified || verified.userId !== user.userId || verified.aal !== 'aal2') {
    auditSecurity('mfa_denied', user.userId)
    redirect('/admin/mfa?error=code')
  }
  await storeTokens(result.data)
  auditSecurity('mfa_success', verified.userId)
  redirect('/admin')
}
