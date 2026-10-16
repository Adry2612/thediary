# Configuración de sincronización de grabaciones

## Modelo de almacenamiento

- El audio se guarda **siempre en el dispositivo** (IndexedDB) al terminar la
  grabación. Es la copia autoritativa y no depende de la red.
- Si el usuario ha iniciado sesión, Supabase guarda **solo metadatos** de la
  grabación (título, sesión, fecha, fase, duración, tipo MIME). El `Blob` de
  audio **nunca** se sube a Supabase Storage.
- Google Drive y OneDrive son **opcionales**. Solo reciben audio cuando el
  usuario conecta el proveedor y pulsa explícitamente "Sincronizar". Es el
  usuario quien autoriza el acceso a su propio drive mediante OAuth.
- La **sincronización automática** es opcional, está desactivada por defecto y
  solo sube al arrancar las grabaciones que aún no estén en el proveedor ya
  conectado. Nunca inicia sesión ni conecta un proveedor por su cuenta.

Si no se configuran las credenciales OAuth, la aplicación sigue funcionando:
graba, reproduce y borra audio local, guarda metadatos en Supabase y no muestra
proveedores de drive habilitados.

## Configuración con variables de entorno

Las credenciales OAuth se configuran en el servidor con variables de entorno
(nunca `NEXT_PUBLIC_`):

```text
CLOUD_SYNC_ENCRYPTION_KEY=
GOOGLE_DRIVE_CLIENT_ID=
GOOGLE_DRIVE_CLIENT_SECRET=
GOOGLE_DRIVE_REDIRECT_URI=
MICROSOFT_GRAPH_CLIENT_ID=
MICROSOFT_GRAPH_CLIENT_SECRET=
MICROSOFT_GRAPH_REDIRECT_URI=
```

Detalles:

- Registra una app OAuth en Google/Microsoft **una sola vez** (ver más abajo).
  Es un requisito de los proveedores: sin un cliente OAuth registrado es
  imposible pedir acceso al drive de un usuario.
- Un proveedor solo aparece habilitado si tiene Client ID, Client Secret y
  Redirect URI, y hay clave de cifrado. Después, en
  `Configuración → Sincronización de grabaciones`, pulsa **Conectar** para abrir
  la ventana de consentimiento del proveedor.
- `CLOUD_SYNC_ENCRYPTION_KEY` puede dejarse vacía: la app genera una y la guarda
  en `.data/cloud-sync.json` (`.data/` está en `.gitignore`). Nunca se envía al
  navegador.

### Google Drive (registro)

1. En <https://console.cloud.google.com/> crea un proyecto y habilita la
   **Google Drive API**.
2. En *Credenciales → Crear credenciales → ID de cliente de OAuth*, tipo
   **Aplicación web**.
3. Añade como **URI de redireccionamiento autorizado** esta URL. Para desarrollo
   local:

   ```text
   http://localhost:3000/api/cloud-sync/google-drive/callback
   ```

4. Define `GOOGLE_DRIVE_CLIENT_ID`, `GOOGLE_DRIVE_CLIENT_SECRET` y
   `GOOGLE_DRIVE_REDIRECT_URI` en el entorno del servidor.

El scope mínimo es `https://www.googleapis.com/auth/drive.file`: la app solo ve
los archivos y carpetas que ella misma crea (carpeta `TheDiary/Recordings`).

### OneDrive (registro)

1. En <https://entra.microsoft.com/> (*App registrations*) registra una app.
2. Añade una plataforma **Web** con este redirect URI:

   ```text
   http://localhost:3000/api/cloud-sync/onedrive/callback
   ```

3. Crea un **client secret** y copia el *Application (client) ID*.
4. Permisos delegados: `Files.ReadWrite`, `User.Read` y `offline_access`.
5. Define `MICROSOFT_GRAPH_CLIENT_ID`, `MICROSOFT_GRAPH_CLIENT_SECRET` y
   `MICROSOFT_GRAPH_REDIRECT_URI` en el entorno del servidor.

El adaptador usa la carpeta visible `TheDiary/Recordings`.

## Sincronización automática al abrir la aplicación

Disponible en `Configuración → Sincronización de grabaciones`. Está
**desactivada por defecto**; al activarla, ese es el consentimiento explícito
del usuario para que la app suba grabaciones sin una acción por archivo.

Cómo decide qué subir:

- Se consulta el catálogo remoto (`TheDiary/Recordings`) del proveedor ya
  conectado y se calcula qué identificadores ya están presentes.
- Solo se suben las grabaciones locales con audio legible cuyo identificador
  **no** aparezca en ese catálogo. Así no se re-sube lo ya sincronizado ni se
  crean duplicados.
- No hay sondeo periódico ni watcher: la comprobación ocurre una vez por carga
  de la aplicación. Si no hay ningún proveedor conectado, no se hace nada.

Comportamiento y límites:

- La preferencia se guarda en `localStorage`
  (`thediary.cloud-sync.auto-sync`) y no se propaga a otros dispositivos.
- El lote es de mejor esfuerzo: continúa tras un fallo individual, pero se
  detiene ante errores de autorización (`token-expired`, `not-authorized`,
  `permission-denied`) para no insistir.
- Un fallo nunca elimina ni invalida la copia local; se muestra como aviso no
  bloqueante y el usuario puede reintentar o reconectar.
- La ejecución se serializa entre pestañas con `navigator.locks` cuando está
  disponible.
- Rollback: desactivar el interruptor, o retirar `CloudAutoSyncHost` del layout,
  devuelve exactamente el comportamiento manual anterior.

## Reproducción de grabaciones que solo están en la nube

En otro dispositivo autorizado, las grabaciones gestionadas aparecen en
`/recordings` aunque no existan localmente. El audio se reproduce a través de:

```text
GET /api/cloud-sync/<provider>/recordings/audio?fileId=<id>
```

Detalles:

- El endpoint añade el token OAuth **en el servidor** (el navegador nunca lo
  ve), reenvía la respuesta del proveedor y respeta las peticiones `Range`, así
  que se puede buscar dentro del audio.
- Google Drive no ofrece una URL preautenticada utilizable en `<audio>` porque
  los archivos solo son visibles para la app; por eso necesita este proxy.
  OneDrive sí devuelve `@microsoft.graph.downloadUrl` y la usa directamente.
- Las entradas que solo existen en la nube **no se guardan en IndexedDB**: se
  listan al cargar y desaparecen si se desconecta el proveedor. Si el proveedor
  no está disponible, se conservan las grabaciones locales.

## Migración de Supabase (metadatos)

Como el audio ya no se sube a Supabase, la columna `storage_path` de
`practice_recordings` debe permitir `NULL`. Aplica una vez:

```sql
alter table public.practice_recordings alter column storage_path drop not null;
```

Sin ella, el audio local funciona igual, pero el metadato no se persiste (se
registra un aviso en consola).

## Seguridad y despliegue

- Nunca añadir secretos a `NEXT_PUBLIC_*`, IndexedDB, objetos de grabación ni
  respuestas de API.
- Los callbacks deben usar HTTPS en producción y validación de `state`.
- `CLOUD_SYNC_ENCRYPTION_KEY` cifra los tokens OAuth (AES-256-GCM). La sesión
  cifrada se guarda en cookies `httpOnly`; si el token es grande se divide en
  fragmentos (`thediary-cloud-<provider>`, `.1`, `.2`, …) porque el navegador
  limita cada cookie a ~4 KB.
- Una configuración incompleta deshabilita solo el proveedor afectado; no debe
  impedir grabar, reproducir ni borrar audio local.
- Desconectar un proveedor revoca o elimina la sesión local cuando sea posible,
  pero no elimina automáticamente archivos remotos.

## Rollback

Si una integración presenta problemas, quitar sus credenciales o su callback del
entorno la deja deshabilitada después del siguiente despliegue. La aplicación
seguirá usando IndexedDB para el audio local y Supabase solo para metadatos. No
es necesario borrar las tablas de metadatos ni los archivos remotos durante el
rollback; pueden conservarse para reanudar la sincronización cuando el proveedor
vuelva a habilitarse.

## Límites operativos

La implementación debe validar el tamaño antes de subir, mostrar progreso para
archivos grandes y traducir errores de cuota, permisos, token expirado y red a
mensajes accionables. Las grabaciones existentes no se suben automáticamente
salvo que el usuario active la sincronización automática, en cuyo caso al abrir
la aplicación se suben únicamente las que falten en el proveedor conectado.
