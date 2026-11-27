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

## Hermes3D Studio original — demo local opcional

Además de la oficina web integrada, el bridge local implementa el subconjunto de lectura del contrato custom de Hermes3D (GET /health, /state, /registry). Los ocho perfiles son sintéticos, no sesiones activas ni modelos; todos los POST (incluido chat) se rechazan. No lee la cola ni credenciales. Node 22.18+ requerido.

1. En un checkout separado de esta rama, ejecutar `node scripts/hermes-office-bridge.mjs` (no abrir ni modificar el checkout del runner activo).
2. En otro directorio clonar [Hermes3D](https://github.com/iamlukethedev/Hermes3D), hacer checkout de `beb76292747b816ef317aa6f9a3992e0014f81d9`, revisar las dependencias e instalar con el lockfile existente. No proporcionar tokens de GitHub, Supabase ni Codex.
3. Iniciar Studio únicamente en loopback, con `HOST=127.0.0.1`, `CUSTOM_RUNTIME_ALLOWLIST=127.0.0.1` y `UPSTREAM_ALLOWLIST=127.0.0.1`. En Windows PowerShell: `$env:HOST='127.0.0.1'; $env:CUSTOM_RUNTIME_ALLOWLIST='127.0.0.1'; $env:UPSTREAM_ALLOWLIST='127.0.0.1'; npm run dev`. No exponer túneles ni publicar Studio.
4. En Studio elegir Local runtime o Custom backend, apuntar a `http://127.0.0.1:7770`. La UI upstream puede mostrar botones de chat por su matriz de capacidades estática: no funcionarán; el bridge responde 405. Validar visualmente en local, no se ha ejecutado Studio original en esta entrega.

El bridge solo demuestra compatibilidad del contrato de perfiles con el proveedor fijado. No sustituye la conexión web real de solo lectura ni autentica sesiones de agentes. La integración operativa de Studio requerirá adaptar las capacidades declaradas y eventos reales.

## Fase 2 preparada en ramas independientes

El adaptador acepta el marcador SNOSERVICE_FACTORY_OFFICE_V1 y los metadatos office de eventos de desarrollo; conserva compatibilidad con runners anteriores. La oficina muestra hasta cinco turnos por tarea y hasta ocho tareas recientes (abiertas primero). No muestra texto de conversaciones, IDs nativos ni datos de herramientas. Las observaciones se publican al terminar una invocación; no son streaming ni presencia actual. Los roles no informados permanecen anónimos. El enlace Solicitar tarea al especialista abre el formulario protegido existente y agrega una preferencia allowlisted al prompt; crea una nueva tarea únicamente al enviar el formulario. No altera una solicitud activa, no abre una sesión persistente, no añade comandos ni permisos. No fusionar las ramas ni actualizar el runner hasta comprobar FAC-16 y aprobar el cambio.

La CI visual genera una ruta efímera únicamente en el checkout del job (fixture .txt, no existe en el producto), usa componentes reales con props sintéticas y captura Chromium y WebKit móvil. No requiere credenciales ni consulta la cola. Los screenshots se adjuntan al workflow. No sustituye la prueba autenticada de producción.

El protocolo admite también observaciones parciales durante el turno (estado observing, sequence 1–12) cuando el administrador habilite el observador experimental del runner. No cambia los permisos ni la cuota. El lector rechaza secuencias atrasadas y nunca permite que una observación tardía sustituya un estado terminal. La opción permanece desactivada por defecto y requiere pruebas locales tras FAC-16.
