# Tasks

## 1. Modelo de sincronización y configuración

- [x] 1.1 Definir los tipos de proveedor, estado de sincronización, referencia remota y errores normalizados, y verificar con pruebas unitarias las transiciones `not-connected`, `not-synced`, `uploading`, `synced` y `error`.
- [x] 1.2 Ampliar el modelo `PracticeAudioRecording` y la versión de IndexedDB para persistir el mapa de sincronización sin romper registros existentes; verificar con una prueba de migración que los registros antiguos siguen siendo reproducibles.
- [x] 1.3 Añadir la migración/estructura de persistencia necesaria para referencias remotas y conexiones no secretas asociadas al usuario, y verificar las políticas de acceso con una prueba o revisión de SQL que impida acceder a datos de otro usuario.
- [x] 1.4 Documentar las variables de entorno, scopes mínimos y pasos de configuración de Google Drive y Microsoft Graph; verificar que la aplicación permanece funcional con ambos proveedores deshabilitados.

## 2. OAuth y adaptadores de proveedores

- [x] 2.1 Implementar el contrato de conexión, desconexión, listado, subida idempotente y renovación de sesión detrás de handlers del servidor; verificar que ningún token aparece en respuestas destinadas al cliente ni en el objeto de grabación.
- [x] 2.2 Implementar el adaptador de Google Drive con carpeta/manifiesto gestionados por la aplicación, carga reanudable cuando corresponda y traducción de errores; verificar con pruebas usando respuestas simuladas de autorización, cuota, permisos y red.
- [x] 2.3 Implementar el adaptador de OneDrive/Microsoft Graph con carpeta/manifiesto gestionados por la aplicación, carga reanudable cuando corresponda y traducción de errores; verificar con pruebas usando respuestas simuladas de autorización, cuota, permisos y red.
- [x] 2.4 Añadir pruebas de seguridad y desconexión para comprobar que revocar o quitar un proveedor detiene nuevas subidas, conserva las grabaciones locales y no elimina archivos remotos automáticamente.

## 3. Servicio de sincronización y catálogo remoto

- [x] 3.1 Implementar el servicio que coordina una subida individual, valida que el `Blob` exista, actualiza estados/progreso y conserva la grabación local ante cualquier fallo; verificar éxito, fallo y reintento con pruebas unitarias.
- [x] 3.2 Implementar la deduplicación por identificador estable y el manifiesto remoto, incluyendo reconstrucción de metadatos al autorizar el mismo proveedor en otro dispositivo; verificar que repetir una solicitud no crea un segundo archivo y que se pueden listar grabaciones remotas.
- [x] 3.3 Implementar la reconciliación del catálogo al conectar/cargar, tolerando proveedor no disponible, manifiesto incompleto o archivo remoto eliminado; verificar que no se borran ni bloquean grabaciones locales.
- [x] 3.4 Documentar el comportamiento de límites de tamaño, cuota, cancelación y sesión OAuth expirada; verificar que cada error ofrece un mensaje accionable y una ruta de reintento sin exponer respuestas crudas del proveedor.

## 4. Interfaz de grabaciones, cuenta e idiomas

- [x] 4.1 Añadir el botón accesible de sincronización y el menú por grabación en `PracticeRecordingItem`, mostrando proveedores conectados, estados, progreso, error y reintento sin bloquear reproducción o borrado; verificarlo con pruebas de interacción de los estados principales.
- [x] 4.2 Integrar la carga y actualización del catálogo en `RecordingsLibrary` y en los hooks/servicios de grabación, manteniendo el flujo IndexedDB/Supabase actual cuando no hay proveedor; verificar el flujo completo con pruebas de carga, guardado local y desconexión de red.
- [x] 4.3 Añadir en cuenta/configuración las acciones para conectar y desconectar Google Drive y OneDrive, incluyendo estados de autorización y explicación sobre archivos remotos no eliminados; verificar navegación, cancelación OAuth y desconexión.
- [x] 4.4 Añadir todas las etiquetas, estados, errores y textos de accesibilidad en español e inglés, sin mostrar iCloud como opción habilitada; verificar que ambos diccionarios cumplen el tipo y que el menú anuncia correctamente su estado.

## 5. Integración y verificación

- [x] 5.1 Añadir pruebas de integración con adaptadores simulados para conectar un proveedor, sincronizar una grabación, recargarla desde el catálogo remoto en otro contexto y reintentar un fallo; verificar que se conservan los datos locales en cada caso.
- [x] 5.2 Ejecutar `npm run typecheck` y `npm test`, corregir regresiones del flujo de grabación y verificar manualmente la aplicación con proveedores deshabilitados y con cada proveedor habilitado en un entorno de prueba.
- [x] 5.3 Revisar que la documentación de despliegue cubra credenciales OAuth, scopes, callbacks, límites y rollback; verificar que una configuración incompleta deshabilita solo el proveedor afectado y no impide usar grabaciones locales.

## 6. Sincronización automática opcional al abrir la aplicación

- [x] 6.1 Añadir la preferencia local de sincronización automática (desactivada por defecto) con lectura, escritura, suscripción a cambios y un hook de React; verificar que el valor por defecto es desactivado y que persiste entre recargas.
- [x] 6.2 Implementar la función pura que, dados los registros locales y los identificadores ya presentes en el proveedor, devuelve las grabaciones a subir; verificar con pruebas unitarias grabaciones ausentes, ya presentes, sin `Blob` y con audio vacío.
- [x] 6.3 Extender `useCloudRecordingSync` con `syncPendingRecordings(provider)`: consultar el catálogo remoto, calcular pendientes, subir una a una, preservar el código de error normalizado y devolver el resumen; verificar que un `token-expired` detiene el lote y que un fallo de red no lo hace.
- [x] 6.4 Implementar el host de arranque con ejecución una vez por carga, serialización entre pestañas mediante `navigator.locks` (con degradación) y avisos no bloqueantes de progreso, resultado y error; verificar que no actúa con la preferencia desactivada ni sin proveedor conectado.
- [x] 6.5 Montar el host en el layout raíz y añadir el interruptor accesible (`aria-pressed`) en `Configuración → Sincronización de grabaciones` con su explicación de que no inicia sesión por el usuario; verificar la activación y desactivación.
- [x] 6.6 Añadir todas las etiquetas y avisos nuevos en español e inglés y actualizar el aviso `cloudStorageNotice` de la sección de grabaciones; verificar que ambos diccionarios compilan con el tipo `Dict`.
- [x] 6.7 Actualizar `docs/cloud-storage-sync.md` para describir el auto-sync, su carácter opcional y qué grabaciones sube, y ejecutar `npm run typecheck` y `npm test`.

## 7. Reproducción de grabaciones que solo están en la nube

- [x] 7.1 Exponer en el adaptador de Google Drive una URL de reproducción servida por la app, ya que sus archivos gestionados no se pueden servir con una URL preautenticada; verificar con una prueba que el catálogo remoto incluye esa URL.
- [x] 7.2 Añadir la operación de descarga al contrato del adaptador y un endpoint `GET /api/cloud-sync/<provider>/recordings/audio` que añada el token en el servidor y reenvíe las peticiones `Range`; verificar con una prueba que se reenvía el rango y se conserva el content-type.
- [x] 7.3 Documentar el proxy de reproducción y sus límites (nada se guarda en IndexedDB) y ejecutar `npm run typecheck`, `npm test` y `npm run build`.
