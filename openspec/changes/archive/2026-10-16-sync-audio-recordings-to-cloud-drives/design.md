# Design

## Context

La aplicación es una web Next.js que guarda grabaciones como `Blob` en IndexedDB para el modo local y utiliza Supabase Storage/`practice_recordings` cuando el usuario ha iniciado sesión. La interfaz de grabaciones ya centraliza reproducción, filtros y borrado, pero no tiene un modelo de estado remoto por proveedor. Las APIs de Google Drive y OneDrive requieren OAuth y sus tokens no deben quedar expuestos en el cliente.

## Goals / Non-Goals

**Goals:**

- Añadir un flujo explícito y reutilizable para conectar Google Drive y OneDrive.
- Mantener intacto el flujo local y hacer que una subida fallida no pierda una grabación.
- Permitir sincronización individual desde cada `PracticeRecordingItem`, con estados persistentes y reintentos.
- Permitir una sincronización automática opcional al abrir la aplicación, activada explícitamente por el usuario y limitada a los proveedores ya conectados.
- Recuperar grabaciones gestionadas por la aplicación desde el mismo proveedor en otro dispositivo autorizado.
- Mantener una frontera de proveedor para que una futura integración de iCloud pueda evaluarse sin reescribir la UI ni el almacenamiento local.

**Non-Goals:**

- No sincronizar continuamente en segundo plano ni sondear periódicamente: la sincronización automática, si el usuario la activa, se comprueba al abrir la aplicación.
- No sustituir Supabase como almacenamiento de datos de práctica ni migrar las grabaciones existentes de Supabase de forma automática.
- No incluir iCloud Drive, compartir enlaces públicamente, colaboración ni resolución de ediciones concurrentes del mismo audio.

## Decisions

### Adaptadores de proveedor detrás de un contrato común

Crear una interfaz de almacenamiento externo con operaciones de conexión, listado de archivos gestionados, subida idempotente y desconexión. Implementar adaptadores separados para Google Drive y OneDrive. La UI solo consumirá el contrato y un catálogo normalizado de estados; así se evita acoplarla a nombres de campos o errores específicos de cada API.

Se descarta integrar las APIs directamente en los componentes React porque duplicaría OAuth, manejo de errores y reglas de idempotencia, y haría más costosa una futura evaluación de iCloud.

### OAuth y tokens en el servidor

El cliente iniciará la autorización mediante rutas/handlers del servidor y recibirá únicamente el estado de conexión y resultados de operación. Los access/refresh tokens se guardarán y renovarán en una sesión segura de servidor o almacenamiento protegido asociado a la conexión; nunca se persistirán en IndexedDB, en el objeto de grabación ni en el HTML. La desconexión revocará o eliminará la autorización local según lo permita el proveedor, pero no borrará archivos remotos automáticamente.

Se elige este enfoque frente a guardar tokens en el navegador porque reduce el impacto de XSS y permite renovar tokens sin exponer credenciales a los componentes de grabación.

### Carpeta y manifiesto gestionados por la aplicación

Cada proveedor tendrá una carpeta visible y estable de la aplicación, como `TheDiary/Recordings`, y una representación de metadatos gestionada por la aplicación. La referencia local guardará proveedor, identificador remoto y estado; la subida usará el identificador de la grabación como clave idempotente. Un manifiesto remoto o metadatos equivalentes permitirán reconstruir título, sesión, fecha, fase, duración y tipo MIME al autorizar el proveedor en otro dispositivo.

Los adaptadores encapsularán las diferencias entre propiedades de Google Drive y `driveItem` de Microsoft Graph. No se asumirá que el usuario puede modificar manualmente el nombre del archivo sin afectar la identidad de la grabación.

### Persistencia separada del Blob local

Ampliar el modelo de grabación con un mapa de sincronización por proveedor, manteniendo el `Blob` y la reproducción local independientes. Los estados serán al menos `not-connected`, `not-synced`, `uploading`, `synced` y `error`, con mensaje seguro para el usuario y marca temporal. El mapa se almacenará junto con los metadatos locales y, cuando exista cuenta de aplicación, podrá reflejarse en los datos asociados a la cuenta sin guardar secretos.

### Sincronización iniciada por el usuario

El control de cada grabación abrirá un menú accesible con Google Drive y OneDrive. La acción de subir será explícita; no se añadirá una suscripción automática ni se bloqueará el reproductor. La biblioteca podrá solicitar la reconciliación del catálogo remoto al cargar o después de autorizar un proveedor, conservando los elementos locales si la red falla.

### Sincronización automática opcional al abrir la aplicación

Como excepción controlada a la regla anterior, la configuración ofrecerá un interruptor de sincronización automática, desactivado por defecto, guardado en el almacenamiento local del navegador. Activar ese interruptor es la acción explícita del usuario que autoriza subidas posteriores sin acción por archivo; el sistema nunca inicia la autenticación de un proveedor por su cuenta y solo actúa sobre proveedores ya conectados.

La decisión de qué falta se toma con el catálogo remoto (`TheDiary/Recordings`) como fuente de verdad: se listan los manifiestos del proveedor, se calcula el conjunto de identificadores presentes y se suben únicamente las grabaciones locales con `Blob` legible cuyo identificador no aparezca. Esto evita depender de un estado de sincronización local que hoy no se persiste de forma fiable y evita crear duplicados.

La ejecución vive en un host de arranque montado en el layout raíz que delega la red en el hook de sincronización existente y serializa la ejecución entre pestañas mediante `navigator.locks` cuando está disponible. El lote es de mejor esfuerzo: continúa tras un fallo individual, se detiene ante errores de autorización, y comunica el resultado con avisos no bloqueantes sin alterar nunca la copia local.

### Tratamiento de errores y límites

Los adaptadores normalizarán cancelación OAuth, permisos insuficientes, expiración de token, cuota, archivo ausente y desconexión de red. La UI mostrará una acción de reintento y no revelará respuestas crudas ni tokens. Las subidas usarán carga reanudable cuando el proveedor lo soporte y límites de tamaño explícitos antes de iniciar la transferencia.

## Risks / Trade-offs

- [Los proveedores cambian permisos, límites y formatos de error] → Encapsular cada API en un adaptador, probar respuestas normalizadas y conservar reintentos manuales.
- [Una sesión OAuth de invitado puede no estar disponible automáticamente en otro dispositivo] → Descubrir archivos al volver a autorizar el mismo proveedor y documentar que la autorización debe repetirse por dispositivo si no hay cuenta de aplicación.
- [El manifiesto remoto puede borrarse o quedar desactualizado] → Usar identificadores estables en nombres/metadatos, tolerar entradas incompletas y nunca borrar la copia local por una discrepancia remota.
- [Las grabaciones son archivos grandes y pueden consumir cuota] → Validar tamaño, mostrar progreso y errores de cuota, y evitar re-subidas mediante referencias remotas idempotentes.
- [Añadir OAuth aumenta la superficie de seguridad y configuración] → Mantener secretos solo en variables de servidor, aplicar scopes mínimos de archivos y documentar las credenciales de cada proveedor antes del despliegue.
- [La sincronización automática puede provocar subidas inesperadas] → Está desactivada por defecto, se explica en su descripción y solo actúa sobre proveedores ya conectados; solo se suben las grabaciones ausentes en el catálogo remoto.
- [Dos pestañas abiertas podrían subir el mismo archivo a la vez] → Serializar la ejecución con `navigator.locks` por origen, con degradación a ejecución directa si no está disponible.

## Migration Plan

1. Añadir configuración y credenciales OAuth de Google Drive y Microsoft Graph por entorno, sin activar proveedores hasta que estén configurados.
2. Desplegar el modelo de estados y las rutas de conexión sin cambiar el comportamiento de guardado local ni de Supabase.
3. Activar primero la conexión y subida bajo una capacidad/configuración controlada; validar autorización, reintentos y recuperación en otro dispositivo.
4. Si un proveedor falla, deshabilitarlo mediante configuración y conservar estados/locales; no borrar archivos ni datos de Supabase.
5. Las grabaciones existentes no se suben automáticamente: el usuario las sincroniza desde su menú. Si activa la sincronización automática en la configuración, la aplicación sube al arrancar solo las que falten en el proveedor ya conectado, evitando transferencias inesperadas y duplicados.

## Open Questions

- Confirmar durante la implementación el tamaño máximo de grabación aceptable para la experiencia de subida y los scopes finales aprobados por cada proveedor; estos valores pueden ajustarse sin cambiar el contrato de la capacidad.
