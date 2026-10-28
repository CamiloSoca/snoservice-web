# Plan de pruebas de autenticación, autorización y seguridad

## Pruebas automatizables ahora

Se provee `tests/static-security.test.mjs`. Comprueba invariantes de seguridad del overlay y que no se añadió ningún endpoint para gestionar clientes. Su éxito no demuestra ausencia de vulnerabilidades.

## Pruebas de integración pendientes (obligatorias)

| Caso | Resultado esperado |
|---|---|
| Sin configuración | Login bloqueado; no hay información privada |
| Usuario desconocido | No crea sesión y devuelve error genérico |
| UUID ajeno al allowlist | Credenciales correctas pero no entra |
| Usuario permitido AAL1 | `/admin` redirige a MFA, API 403 |
| Usuario permitido AAL2 | Entra a dashboard; API GET 200 con `0` sitios |
| TOTP incorrecto | No asciende a AAL2 |
| Factor de otro usuario | No asciende a AAL2 |
| POST sin Origin/malicioso | Operación denegada |
| Access token expirado | Solo se renueva con refresh válido; de lo contrario se niega |
| Logout | Cookies vacías, refresh invalidado por proveedor |
| Acceso desde navegador XSS de la web pública | Prueba de amenazas y nuevas barreras antes de operaciones críticas |
| RSC/prefetch/caché | No expone datos privados a sesiones no autenticadas |
| Compatibilidad de CSP en navegador | Nonce funciona y no bloquea login ni TOTP |

## Pruebas sobre infra a configurar

- Supabase Auth: rate limits, política de contraseñas, TOTP, detección de abuso, emisión/expiración de JWT.
- Vercel: reglas WAF, monitoreo, alertas, trazas y logs sin secretos.
- Backup/restauración: no aplicable hasta que se cree una base central separada.
- Autorización de instalaciones: no aplicable mientras existan 0 instalaciones.

### Pruebas de privacidad adicionales

- Comprobar la expiración de la cookie de renovación tras 30 minutos de inactividad y la emisión de JWTs con duración corta en Supabase Auth.
- Verificar que `script-src` con nonce funciona tanto en respuestas HTML como en componentes RSC y Server Actions sin degradar a `unsafe-inline`.
