# Factory Office — fase 1

Ruta propuesta: /admin/factory/office (autenticación Central, AAL2 y origen canónico existentes). Demo: ?mode=demo. La rama no requiere actualizar el runner, modificar la cola ni configurar un servidor nuevo.

## Recursos de Hermes3D

Se reutilizan los generadores originales de personajes, mobiliario y tiles de [Hermes3D](https://github.com/iamlukethedev/Hermes3D/tree/beb76292747b816ef317aa6f9a3992e0014f81d9/src/features/pixel-office), commit beb76292747b816ef317aa6f9a3992e0014f81d9, licencia MIT incluida en el directorio hermes. El plano, renderer Canvas, inspector y adaptador de cola son específicos de Factory. No se instala el Studio completo, Phaser, Three.js ni un segundo modelo. No hay integración 3D en esta fase.

## Alcance y datos

- Ocho perfiles del runner existente; selección por plano o botones accesibles.
- Modo demo claramente separado, sin llamadas a la cola.
- Modo real: GET sobre repositorio privado fijo, verificación de propietario y formato, hasta ocho tareas abiertas y último evento válido disponible entre los últimos 100 comentarios. Renovación al pulsar Actualizar o cada minuto con pestaña visible.
- El servidor conserva FACTORY_QUEUE_TOKEN; solo serializa título, proyecto, número, etapa y fecha, y categorías acotadas de pausa. Nunca serializa prompts, mensajes arbitrarios, tokens o archivos.
- Los eventos actuales no prueban actividad individual. Los perfiles reales permanecen sin telemetría individual; no se simula trabajo. Los estados de tarea son últimos eventos, no comprobación de conexión al runner.
- No se crean issues ni se ejecutan comandos, no se publica código, no se toca Supabase, no se modifica el runner.

## Pruebas

`npm ci`, `node --test tests/*.test.mjs`, `npx tsc --noEmit`, `npm run build`. Para validación visual, abrir la ruta en una sesión admin autorizada; comprobar modo demo, selección de ocho perfiles, desplazamiento interno móvil, modo real, pausa por cuota y errores de conexión. Sin credenciales no se puede probar la ruta privada en preview.

## Fase 2 (después de FAC-16)

Añadir un protocolo versionado de telemetría por agente con id de tarea, id de agente, ejecución, timestamp, secuencia y tipo; eventos emitidos por el orquestador, no inferidos del texto del modelo. Persistir checkpoints y distinguir planificado/iniciado/completado, caducidad y desconexión. Confirmar la API y capacidad de eventos nativos de Codex. Proponer un adaptador de runtime de Hermes3D con health/state/registry y mensajería solo cuando haya sesiones reales, autenticación, límites y autorizaciones. No implementar chat que invoque modelos o manipule permisos mientras la tarea actual siga pendiente. Mantener aprobación explícita para despliegues, migraciones y acceso externo. Evaluar renderer 3D solo después de verificar el flujo real.

## Reversión

No fusionar ni desplegar hasta revisión. Para descartar, cerrar la PR y borrar su rama. No requiere cambios de datos ni de configuración del runner.
