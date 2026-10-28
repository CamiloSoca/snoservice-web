import { test } from 'node:test'
import { strict as assert } from 'node:assert'
import { readFileSync } from 'node:fs'

const get = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('The central dashboard is fail-closed and requires the MFA-admin guard', () => {
  const source = get('app/admin/page.tsx')
  assert.match(source, /await requireCentralAdmin\(\)/)
  assert.match(source, /Sin datos conectados|No existen credenciales compartidas/)
  assert.doesNotMatch(source, /service_role|DATABASE_URL|secret_token/)
})

test('The overview API authorizes both identity and AAL2', () => {
  const source = get('app/admin/api/overview/route.ts')
  assert.match(source, /auth\.state !== 'authenticated'/)
  assert.match(source, /auth\.aal !== 'aal2'/)
  assert.match(source, /no-store/)
})

test('Only explicitly allowlisted immutable UUIDs become admins', () => {
  const source = get('lib/central/auth.ts')
  assert.match(source, /CENTRAL_ADMIN_USER_IDS/)
  assert.match(source, /ids\.size === 0/)
  assert.match(source, /authApi\('\/user'/)
  assert.doesNotMatch(source, /user_metadata|service_role|NEXT_PUBLIC_/)
})

test('Mutating actions verify Origin and MFA flow cannot bypass AAL2', () => {
  const source = get('app/admin/actions.ts')
  const matches = [...source.matchAll(/assertSameOrigin\(\)/g)]
  assert.ok(matches.length >= 4)
  assert.match(source, /verified\.aal !== 'aal2'/)
  assert.match(source, /verifyAccessToken/)
})

test('Admin cookies are httpOnly, strict and scoped to /admin', () => {
  const source = get('lib/central/auth.ts')
  assert.match(source, /httpOnly: true/)
  assert.match(source, /sameSite: 'strict'/)
  assert.match(source, /path: '\/admin'/)
  assert.match(source, /NODE_ENV === 'production'/)
})

test('Admin CSP uses a random nonce and disallows framed admin pages', () => {
  const source = get('proxy.ts')
  assert.match(source, /randomBytes\(16\)/)
  assert.match(source, /frame-ancestors 'none'/)
  assert.match(source, /Cache-Control/)
  assert.doesNotMatch(source, /script-src[^\n]*unsafe-inline/)
})
