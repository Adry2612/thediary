# Tasks

## 1. Preferencias de recordatorios

- [x] 1.1 Define el tipo `ReminderPreferences` (interruptor general, tres motivos, hora y umbral), sus valores por defecto y la normalización de valores guardados; verifica con pruebas que un valor inválido cae al defecto sin perder el resto.
- [x] 1.2 Implementa el almacenamiento por dispositivo con clave versionada, lectura tolerante a errores y suscripción a cambios para que Ajustes e Inicio compartan el estado; verifica con pruebas de lectura, escritura, valor corrupto y cambio desde otra pestaña.
- [x] 1.3 Añade los textos en español e inglés de la sección, los tres motivos, la hora, el umbral, los estados del permiso y los errores; verifica que `tests/i18n.test.mjs` sigue pasando y que ambas locales exponen las mismas claves nuevas.

## 2. Evaluación y plan diario

- [x] 2.1 Implementa las utilidades de fecha y hora por zona: clave de fecha en una zona IANA, hora local a instante UTC, fin del día local y suma de días; verifica con pruebas de cambio de hora en Europa/Madrid y de una zona al oeste de Greenwich.
- [x] 2.2 Implementa la evaluación de motivos para un día: rutina pendiente sin sesión, guitarra vencida (solo vencida, no «próxima», nombrando la más urgente) e inactividad desde la última sesión; verifica cada motivo y sus ausencias con pruebas.
- [x] 2.3 Implementa la generación del plan a 90 días: una entrada por fecha local, motivos combinados, repetición semanal de cuerdas e inactividad, omisión del día si la hora ya pasó y textos localizados inyectados; verifica con pruebas de plan vacío, un solo motivo, varios motivos y límite del horizonte.
- [x] 2.4 Implementa el filtro de vigencia que usará el emisor: descarta práctica si hay sesión ese día, inactividad si hay una sesión posterior y cuerdas si el último cambio es posterior al guardado; verifica con pruebas de cada descarte y de una entrada que se queda sin motivos.
- [ ] 2.5 Implementa el servicio que reemplaza el plan de la suscripción actual mediante RPC, con retardo para agrupar cambios y nueva ejecución al guardar una sesión, cambiar preferencias, cambiar idioma o abrir la app; verifica que no llama a Supabase siendo invitado, con recordatorios apagados o sin suscripción, y que el plan se recalcula tras guardar una sesión.

## 3. Cliente push

- [ ] 3.1 Añade `public/sw.js` con `push`, `notificationclick` y `pushsubscriptionchange`, sin manejador de `fetch` ni caché; verifica con `node --check public/sw.js` y comprobando en el navegador que el service worker se registra y activa.
- [ ] 3.2 Añade la clave pública VAPID a `.env.example`, la detección de soporte (service worker, `PushManager`, `Notification`) y la conversión de la clave base64url a bytes; verifica la conversión con pruebas y que sin clave configurada la UI muestra el estado «no configurado».
- [ ] 3.3 Implementa el ciclo de suscripción: activar con gesto de usuario y permiso, guardar suscripción y zona horaria, refrescar al abrir la app, desactivar, cerrar sesión y cambio de cuenta; verifica en el navegador los estados permitido, denegado, bloqueado a posteriori y desactivado, sin suscripciones huérfanas.
- [ ] 3.4 Registra el service worker y el ciclo de suscripción al arrancar la app sin pedir permiso automáticamente; verifica que una carga normal no muestra ningún diálogo de permiso y que el registro aparece en las herramientas del navegador.
- [ ] 3.5 Documenta en `docs/push-reminders.md` la generación de claves, la variable pública, los secretos, el despliegue y la rotación; verifica que el comando de generación de claves funciona tal como está escrito.

## 4. Supabase y envío programado

- [ ] 4.1 Crea la migración de `push_subscriptions` con clave única por `endpoint`, zona horaria, marcas de tiempo, índices y RLS por `user_id`; verifica que un usuario solo puede leer y modificar sus filas y que el `endpoint` duplicado no crea una segunda suscripción.
- [ ] 4.2 Crea la migración de `push_reminder_plan` con unicidad por suscripción y fecha, motivos en JSON, estado de envío e intentos, RLS por `user_id` y la RPC atómica `replace_reminder_plan`; verifica que reemplazar no duplica filas, que borra desde hoy y que un usuario no puede tocar el plan de otro.
- [ ] 4.3 Implementa la Edge Function `send-reminders`: cabecera secreta, consulta de vencidos, filtro de vigencia, envío con VAPID, marcado de enviados, incremento de intentos, descarte tras cinco fallos o al acabar el día local y borrado de suscripciones inválidas; verifica con pruebas del filtro y una llamada local que responde con el recuento de enviados sin exponer datos de otros usuarios.
- [ ] 4.4 Añade la programación periódica con `pg_cron` y `pg_net`, leyendo URL y secreto desde Vault y sin escribir secretos en el repositorio; verifica que la migración no falla cuando faltan los secretos, que crea el trabajo cuando existen y que una ejecución manual invoca la función.
- [ ] 4.5 Amplía `docs/push-reminders.md` con el despliegue de la función, los secretos de VAPID y cron, la programación y la prueba con `curl`; verifica que los pasos permiten desplegar y ejecutar la función en un proyecto de Supabase.

## 5. Ajustes

- [ ] 5.1 Añade la sección «Recordatorios» en Configuración con el interruptor general, los tres motivos, la hora, el umbral de inactividad, la nota de configuración por dispositivo y el aviso para invitados; verifica que todos los controles tienen etiqueta y que se recorren con teclado.
- [ ] 5.2 Conecta la sección con los estados del permiso y las acciones de activar, desactivar y enviar una notificación de prueba, incluyendo los casos no soportado, no configurado y bloqueado; verifica en el navegador cada estado y que el aviso de error usa `role="alert"`.
- [ ] 5.3 Revisa la sección a 320, 375, 768 y 1280 px en ambos idiomas; verifica que no hay desbordamiento horizontal, que el selector de umbral solo aparece cuando el motivo de inactividad está activo y que los textos caben.

## 6. Recordatorio dentro de la app

- [ ] 6.1 Implementa la disponibilidad del aviso dentro de la app (invitado, sin soporte, permiso no concedido o sin suscripción), la evaluación de hoy tras la hora elegida y el descarte por fecha local; verifica con pruebas las combinaciones y que el descarte no se repite hasta el día siguiente.
- [ ] 6.2 Añade la fila descartable bajo la cabecera de Inicio con los motivos aplicables, enlaces a Inicio/Cuerdas y acceso a Configuración para activar los avisos; verifica en el navegador como invitado, con permiso denegado y con push activo, y que desaparece al guardar la práctica del día.
- [ ] 6.3 Revisa la fila a 320, 375, 768 y 1280 px; verifica que no duplica el aviso cuando el push está activo y que el botón de descartar es accesible por teclado y lector de pantalla.

## 7. Verificación de integración

- [ ] 7.1 Ejecuta `npm test`, `npm run typecheck` y `npm run build`; verifica que todo pasa y que las pruebas nuevas cubren preferencias, zonas horarias, motivos, plan, filtro y descarte.
- [ ] 7.2 Prueba el recorrido completo con claves VAPID reales: activar, fijar una hora dos minutos por delante, cerrar la pestaña, recibir un solo aviso, pulsarlo y comprobar la pantalla de destino; repite con permiso denegado y en modo invitado.
- [ ] 7.3 Comprueba que un segundo dispositivo no recibe la configuración del primero, que practicar en uno elimina el motivo de práctica del otro y que desactivar o cerrar sesión deja de enviar avisos.
- [ ] 7.4 Ejecuta `openspec validate add-practice-reminders --strict`; verifica que el cambio es válido y que todas las tareas quedan marcadas.

## Workflow follow-up

- Archive the change after the project's review requirements are satisfied.
- Verify the archived specs and the reminder deployment notes after archiving.
