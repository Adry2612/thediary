# Proposal

## Why

Las grabaciones de audio actualmente dependen del almacenamiento local del dispositivo o del almacenamiento interno de la cuenta de la aplicación, lo que dificulta recuperarlas y mantenerlas disponibles en varios dispositivos mediante el servicio de archivos que el usuario ya utiliza. Una sincronización opcional con Google Drive u OneDrive permitirá conservarlas en un proveedor externo sin obligar a iniciar sesión ni cambiar el flujo local existente. Mantener esa copia al día exige repetir la subida archivo a archivo, así que la sincronización debe poder automatizarse cuando el usuario lo pida explícitamente.

## What Changes

- Mantener el guardado local de las grabaciones como comportamiento predeterminado y disponible cuando el usuario no conecta un proveedor externo.
- Añadir un botón de sincronización en cada elemento de grabación que abra un menú de opciones de almacenamiento.
- Permitir elegir Google Drive u OneDrive y completar la autenticación/autorización del proveedor elegido de forma explícita.
- Subir las grabaciones seleccionadas al proveedor conectado, mostrando estados de progreso, sincronizado y error sin bloquear la reproducción o eliminación local.
- Recordar de forma segura el proveedor conectado y asociar cada grabación con su estado y ubicación remota para evitar duplicados y permitir reintentos.
- Ofrecer gestión de la conexión y desconexión de proveedores desde la cuenta/configuración, incluyendo explicación de que las grabaciones no se sincronizan externamente si el usuario no lo solicita.
- Añadir una sincronización automática opcional, desactivada por defecto, que al abrir la aplicación suba solo las grabaciones que aún no estén en el proveedor ya conectado, sin iniciar sesión por el usuario ni bloquear la interfaz.
- Mantener las interfaces en español e inglés y comunicar límites o errores de disponibilidad del proveedor.
- Dejar iCloud Drive fuera de esta entrega y documentarlo como posible fase futura, condicionada a que exista una integración técnicamente viable para la aplicación web.

## Capabilities

### New Capabilities

- `audio-recording-cloud-sync`: Gestiona la conexión opcional a proveedores de almacenamiento, la selección desde una grabación y la sincronización de archivos de audio con sus estados y errores.

### Modified Capabilities

- Ninguna. No existen especificaciones de capacidades previas en `openspec/specs/`; el comportamiento actual de grabaciones se documentará como base para la nueva capacidad.

## Impact

- Componentes de interfaz de `src/components/practice/PracticeRecordingItem.tsx` y `src/components/practice/RecordingsLibrary.tsx`, además de una pantalla o sección de configuración de cuenta.
- Host de sincronización automática montado en `src/app/layout.tsx` y preferencia local en `src/lib/cloud-sync/`.
- Modelo de `PracticeAudioRecording`, almacenamiento IndexedDB y servicios de archivos actuales de Supabase para representar estado, metadatos e identificadores remotos.
- Nuevos módulos de autenticación y adaptadores de proveedor para Google Drive y OneDrive; la solución deberá definir qué operaciones pueden ejecutarse desde el navegador y qué operaciones requieren backend.
- Preferencia local de sincronización automática, host de arranque en el layout raíz y una operación de sincronización de pendientes en el hook de sincronización, con pruebas de la selección de pendientes.
- Posibles variables de configuración, endpoints/server actions y migraciones para guardar conexiones o referencias remotas sin exponer credenciales.
- Pruebas de flujo de selección de proveedor, autorización, subida, reintento, duplicados, desconexión, funcionamiento sin cuenta/proveedor y exclusión explícita de iCloud en esta versión.
