# SNOOSERVICE Central — Implementación de seguridad V1

**Estado:** código preparado, NO instalado, NO desplegado y NO vinculado a una base de datos. Este paquete contiene solo los archivos nuevos y `next.config.ts`, para superponer a `CamiloSoca/snoservice-web` en una rama de desarrollo. No sustituye la web comercial en `/`.

## 0. Principios

- El panel vive en `/admin`; no hay registro público ni altas de barberías.
- Cero sitios conectados; no se guardan ni reutilizan contraseñas o claves de otras instalaciones.
- Todas las vistas privadas y APIs verifican usuario y MFA **en el servidor**.
- Autorización por UUID exacto del usuario de Supabase Auth en una variable de entorno **del servidor**, nunca por correo, `user_metadata` ni JavaScript del cliente.
- Sin variables obligatorias, acceso denegado. Nunca usar un valor predeterminado permisivo.
- Los JWT llegan solo por cookies `HttpOnly`, `SameSite=Strict`, `Secure` en producción, `Path=/admin` y una ventana de renovación de 30 minutos; el servidor valida el token con `/auth/v1/user` antes de conceder acceso y comprueba `aal2`.
- POST con Server Actions y comprobación de `Origin` contra el origen esperado. Solo hay operaciones de autenticación, enrolamiento y cierre de sesión.
- Content Security Policy con nonce por solicitud en `/admin`, sin `unsafe-inline` para JavaScript, cabeceras anti-cache y anti-framing.
- Logs de auditoría de seguridad sin credenciales, tokens, OTP o cuerpos de solicitud.
- URL del panel: `https://www.snoservice.uy/admin`.

## 1. Configuración previa indispensable

Usar un **proyecto Supabase Auth aislado para SNOOSERVICE Central**, cuya selección y creación se deben aprobar antes de conectarlo; no conectar por accidente proyectos existentes que puedan contener datos de clientes.

Variables de servidor en Vercel (sin prefijo `NEXT_PUBLIC_`):

| Clave | Valor requerido |
| --- | --- |
| `CENTRAL_SUPABASE_URL` | URL HTTPS del proyecto de autenticación del panel, p. ej. `https://<project-ref>.supabase.co` |
| `CENTRAL_SUPABASE_PUBLISHABLE_KEY` | Clave `sb_publishable_...` de ese mismo proyecto. No usar `service_role`, `sb_secret_...` ni claves maestras. |
| `CENTRAL_ADMIN_USER_IDS` | Uno o más UUIDs de usuarios precreados y verificados, separados por comas; al iniciar, uno solo. |
| `CENTRAL_CANONICAL_ORIGIN` | Exactamente `https://www.snoservice.uy` en producción, sin barra final. En desarrollo local, por ejemplo `http://localhost:3000`. |

No introducir secretos en GitHub ni en archivos versionados. No utilizar una cuenta de Auth asociada a otra aplicación de una barbería.

En Supabase Auth: **deshabilitar registros públicos**, deshabilitar proveedores que no se utilicen, exigir email confirmado, habilitar TOTP, configurar JWT de duración corta (p. ej. 5 minutos tras valorar impacto operativo), periodo máximo de sesión y tiempos de inactividad desde Auth si el plan los permite, verificar MFA y rate-limits de Auth. Crear por el canal administrativo una cuenta con password fuerte y UUID añadido a la lista de permitidos. No se implementa un endpoint público para invitar o crear administradores.

### Nota sobre el primer acceso

El primer inicio de sesión solicita contraseña y después obliga a enrolar TOTP. La verificación de TOTP debe elevar la sesión a `aal2` antes de permitir cualquier dato del dashboard. Agregar un segundo factor de recuperación debe planearse antes de depender del sistema. Supabase no ofrece códigos de recuperación TOTP universales; preservar un procedimiento administrativo de recuperación verificable.

## 2. Controles de infraestructura que requieren activación antes de producción

Estos controles **no se pueden declarar activos con solo copiar código**:

1. Configurar rate limiting a nivel de Vercel Firewall/WAF para `/admin/login`, los POST a `/admin/mfa`, `/admin/refresh` y cualquier API administrativa futura; revisar las limitaciones del plan contratado y evitar una dependencia de rate limit en memoria de una función serverless.
2. Configurar límites de intentos y bloqueo/cooldown en Supabase Auth; registrar y alertar sobre picos de accesos fallidos desde infraestructura de observabilidad de confianza.
3. Habilitar alertas y retención segura de logs de Vercel. Los logs de `console.info` incluidos en el paquete no son un registro inmutable ni garantizan retención a largo plazo.
4. Activar HTTPS válido, TLS seguro, dominio canónico y HSTS **para todo el dominio solo tras evaluar subdominios y navegación pública**. HSTS no se añade automáticamente aquí para evitar cambios en el sitio público.
5. Probar proceso de recuperación de cuentas de administrador, revocación de sesiones y eliminación de permisos, así como backup/restauración de una futura base central. Hoy no existe una base de datos central con información que respaldar.
6. Proteger cuentas de proveedores con MFA fuerte, permisos mínimos, auditoría y alertas, y separar los ambientes de staging y producción.

## 3. Restricciones arquitectónicas para las próximas barberías

- Nunca almacenar una clave `service_role` común con acceso a múltiples clientes en `/admin` o su proyecto web.
- Las integraciones futuras deben tener credenciales independientes, rotables y con privilegios específicos (estado/lectura antes que escritura); accesos de despliegue aislados de accesos a datos.
- Consultas y comandos de un tenant deben validar el ID objetivo, pertenencia, capacidades y autorización en servidor; denegar por defecto.
- Operaciones de alto riesgo: aprobación explícita, MFA reciente adicional cuando aplique, registro durable, trazabilidad y, si corresponde, doble aprobación y rollback.
- Diseñar aislamiento de bases y RLS antes de crear integraciones. **No se ejecutan migraciones de bases existentes**.
- La página pública y `/admin` comparten origen; un XSS en la página pública puede emitir solicitudes autenticadas al panel. Las cookies HttpOnly no detienen el abuso de sesión de un XSS de mismo origen. Mantener CSP e higiene de dependencias del sitio público; exigir verificación reforzada para operaciones críticas. Un subdominio de backend separado no elimina por sí solo el riesgo si el panel sigue renderizado en el mismo origen.

## 4. Comprobaciones obligatorias antes de publicar

- [ ] `npm ci`, `npm run build`, `npm run lint` y revisión manual del resultado, con versiones del lockfile intactas.
- [ ] Sin variables, `/admin` no muestra información y no hay endpoints operativos abiertos.
- [ ] No autenticado: redirección a login; `/admin/api/overview` devuelve 401 sin datos.
- [ ] Cuenta válida fuera de allowlist: inicio de sesión denegado, sin cookies.
- [ ] Cuenta en allowlist con solo AAL1: redirección a MFA; API devuelve 403.
- [ ] Cuenta allowlist con AAL2: acceso a panel y datos mínimos sin caché.
- [ ] Contraseña inválida, código TOTP inválido, factor ajeno y solicitudes sin Origin: denegadas.
- [ ] Cookies con `HttpOnly`, `Secure` en HTTPS, `SameSite=Strict`, Path `/admin` y tiempos adecuados.
- [ ] Las sesiones expiradas fallan cerradas o actualizan mediante refresh; logout revoca refresh token y limpia cookies.
- [ ] Validar CSP en navegadores Chromium/WebKit; sin alertas CSP, sin ejecuciones inline no autorizadas, con QR de enrolamiento funcional.
- [ ] Verificar accesibilidad y pantallas móviles sin filtrar datos en HTML, RSC, prefetch ni cachés.
- [ ] Rate limits, alertas, políticas de Supabase, recuperaciones y respaldos configurados en proveedores.
- [ ] Pentest autorizado contra entorno de staging y revisión de dependencias a la fecha de publicación.

## 5. Qué NO está implementado

No hay almacenamiento duradero de auditoría, base de datos central, backups, seguimiento de integraciones, gestión de dominios, despliegues automatizados, tenants, suscripciones ni facturación. Tampoco se configuraron WAF y Auth en las cuentas externas. Todo esto exige decisiones y permisos de infraestructura, y se mantiene inhabilitado. Los controles específicos de GitHub quedan a cargo del propietario del repositorio.

## 6. Estrategia de adopción sin afectar producción

1. Importar estos archivos a una rama nueva del repositorio, **sin fusionar a `main`**.
2. Probar build en una copia aislada y aplicar los tests descritos.
3. Elegir y aprobar un proyecto Supabase Auth dedicado para Central; configurarlo sin tocar bases existentes.
4. Configurar variables de entorno en preview y probar Auth + MFA en un entorno autorizado.
5. Configurar WAF, alertas y política de retención.
6. Después de pruebas de seguridad y aprobación expresa, desplegar la ruta `/admin` sin sustituir `/`.
7. No conectar barberías hasta que existan políticas y pruebas de aislamiento.

Fuentes oficiales de referencia: Next.js Authentication y Proxy; Supabase Auth MFA/TOTP y servidor. Se debe volver a validar documentación y versiones antes de poner en producción.

### Notas sobre Next.js 16

La aplicación existente habilita `cacheComponents: true`; por ello estas rutas privadas usan `await connection()` y no exportan las opciones obsoletas de segmento `dynamic` ni `revalidate`. Los fetch de identidad son `cache: no-store`. La versión existente 16.4.2 contiene los arreglos de seguridad de octubre 2026, pero antes de instalar verificar actualizaciones estables (16.4.3 disponible a fecha 28/10/2026) y regenerar lockfile en una rama cuando corresponda.
