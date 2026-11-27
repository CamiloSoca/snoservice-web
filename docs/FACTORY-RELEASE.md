# Publicación de entregas Factory

La tarjeta Publicación a producción aparece en entregas cerradas como completadas, con una PR y commit registrados por el runner. No consume cuota de Codex ni requiere el runner para publicar. No cambia las reglas de autenticación, MFA ni mTLS.

## Configuración única

Agregar en Vercel, proyecto snoservice-web, entorno Production, como variables sensibles de servidor (nunca NEXT_PUBLIC_ ni en Preview):

- FACTORY_RELEASE_GITHUB_TOKEN: token fine-grained con acceso solamente a CamiloSoca/Finanzas, CamiloSoca/distribuidora-admin y CamiloSoca/snoservice-web; Contents y Pull requests Read and write. El token de cola existente no necesita permisos adicionales.
- FACTORY_RELEASE_VERCEL_TOKEN: token de acceso para el equipo snoservice con el mínimo alcance disponible que permita leer proyectos/deployments y promover producción. Si el proveedor ofrece acceso al equipo completo, evaluar el alcance antes de habilitarlo; el servicio usa una lista fija de tres proyectos. No entregar estos secretos a Codex ni incluirlos en un issue.

Redeploy de snoservice-web después de agregar las variables. Sin ambas, el control no permite mutaciones.

## Flujo

1. Consultar estado del commit exacto de la PR. Se comprueba la relación con el FAC, autor, repositorio y rama base; la rama debe seguir coincidiendo con el padre original del commit y el preview debe estar READY.
2. Confirmar manualmente Publicar en producción. El servidor marca la PR lista y hace squash merge usando SHA esperado. No se modifica una PR ajena ni 13 CUT. No saltar revisiones/branch protections. Una compilación READY no sustituye revisar el diff y las pruebas.
3. Consultar estado de la compilación de producción. El panel consulta cada 12 s mientras está abierto y el estado es building. Si el dominio ya sirve ese deployment, muestra Publicado.
4. Si el dominio no se asignó, confirmar Activar en dominio. Solo se promueve el build READY de producción del commit fusionado, si sigue siendo el HEAD de la rama productiva; no se promueve un preview ni un commit anterior deliberadamente.
5. Volver a consultar hasta verificar que los dominios conocidos apuntan a ese commit exacto. En caso de errores de API o de cambios en la base, detenerse y revisar.

El botón no altera datos de Supabase, variables de otros proyectos ni permisos. No es un sistema de aprobación autónomo; una persona autoriza la operación. La revisión del código y los permisos mínimos siguen siendo necesarios. Si GitHub no ofrece una comprobación de base atómica, mantener las protecciones de rama y no realizar merges concurrentes fuera del flujo.
