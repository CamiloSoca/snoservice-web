# SNOOSERVICE Central · Paquete de implementación de seguridad

Archivos adicionales destinados al repositorio `CamiloSoca/snoservice-web`. No contiene barberías conectadas ni dependencias npm nuevas.

### Contenido

- `/admin`: dashboard oscuro, 0 sitios, sin operaciones sobre instalaciones.
- `/admin/login`: ingreso con Supabase Auth, cuentas explícitamente autorizadas.
- `/admin/mfa`: enrolamiento/verificación TOTP obligatorio.
- `/admin/refresh`: renovación controlada de la sesión.
- `/admin/api/overview`: API demostrativa solo lectura, denegación por defecto, requiere AAL2.
- `proxy.ts`: CSP con nonce aleatorio y cabeceras de privacidad para `/admin`.
- `lib/central/*`: lógica de autenticación y autorización en el servidor.
- `next.config.ts`: conserva configuración de origen y suma cabeceras de seguridad específicas a `/admin`.
- `docs/SECURITY.md`: requisitos, riesgos residuales y checklist previo a producción.

### Aplicación

Incorporar los archivos en una rama de validación; solo promover a main tras revisar la compilación y la configuración de acceso. El único archivo existente reemplazado es `next.config.ts`; confirmar su diff contra el commit base antes de incorporar. No conectar todavía bases de datos ni efectuar despliegues.

### Variables

`CENTRAL_SUPABASE_URL`, `CENTRAL_SUPABASE_PUBLISHABLE_KEY`, `CENTRAL_ADMIN_USER_IDS`, `CENTRAL_CANONICAL_ORIGIN`. Más detalles en `docs/SECURITY.md`.

> Importante: Este código no ha pasado todavía pruebas de integración contra Supabase Auth, build real de Next.js ni pruebas de navegador. No debe presentarse como una implementación ya operativa y completamente segura hasta superar dichas verificaciones.
