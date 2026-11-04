# Recordatorios push

La app envía como mucho **un aviso diario combinado por dispositivo** con la
app cerrada. El plan lo calcula el dispositivo y lo escribe en Supabase; una
función programada solo filtra los motivos que ya no se cumplen y entrega lo
que vence.

## Piezas

| Pieza | Dónde |
| --- | --- |
| Preferencias, motivos y plan | `src/services/reminder-*.ts`, `src/utils/reminder-*.ts` |
| Service worker | `public/sw.js` (solo `push`, `notificationclick` y `pushsubscriptionchange`) |
| Suscripción | `src/services/push-reminders.ts`, `src/services/supabase/push-subscriptions.ts` |
| Tablas y RPC | `supabase/migrations/202611040001_push_reminders.sql` |
| Programación | `supabase/migrations/202611040002_push_reminders_cron.sql` |
| Emisor | `supabase/functions/send-reminders/index.ts` |

## Claves VAPID

Genera un par una sola vez y guarda la privada fuera del repositorio:

```bash
npx web-push generate-vapid-keys
```

- La **pública** va en la app como `NEXT_PUBLIC_VAPID_PUBLIC_KEY`.
- La **privada**, la pública y un `mailto:` de contacto (`VAPID_SUBJECT`) son
  secretos de la función.
- Rotar las claves invalida las suscripciones existentes: vuelve a generarlas,
  despliega y pide al usuario que reactive los avisos en Configuración.

## Supabase

1. Aplica las migraciones:

   ```bash
   supabase db push
   ```

2. Crea los secretos de la función:

   ```bash
   supabase secrets set \
     VAPID_PUBLIC_KEY=... \
     VAPID_PRIVATE_KEY=... \
     VAPID_SUBJECT=mailto:tu-correo@ejemplo.com \
     SEND_REMINDERS_SECRET=una-cadena-larga-aleatoria
   ```

3. Despliega la función:

   ```bash
   supabase functions deploy send-reminders --no-verify-jwt
   ```

   `--no-verify-jwt` es necesario porque la invoca `pg_cron` con el secreto
   compartido, no con un JWT de usuario.

4. Guarda en Vault la URL de la función y el mismo secreto:

   ```sql
   select vault.create_secret(
     'https://<project-ref>.supabase.co/functions/v1/send-reminders',
     'send_reminders_url'
   );
   select vault.create_secret('una-cadena-larga-aleatoria', 'send_reminders_secret');
   ```

5. Vuelve a aplicar la migración de cron (o ejecútala a mano). Programa la
   función cada cinco minutos y no falla si faltan extensiones o secretos.

## Prueba manual

```bash
curl -i -X POST "https://<project-ref>.supabase.co/functions/v1/send-reminders" \
  -H "x-cron-secret: una-cadena-larga-aleatoria" \
  -H "Content-Type: application/json" \
  -d '{}'
```

La respuesta cuenta `sent`, `skipped`, `failed` y `removed` sin devolver datos
de otras cuentas.

## Reglas del aviso

- **Práctica**: hay rutina asignada al día local y ninguna sesión guardada ese
  día.
- **Cuerdas**: alguna guitarra ha alcanzado su intervalo de días u horas; se
  nombra la más urgente.
- **Inactividad**: han pasado los días configurados desde la última práctica.
- Los motivos se combinan en una sola notificación a la hora elegida.
- Sin motivos aplicables no se envía nada.
- La etiqueta `thediary-daily` reemplaza una entrega repetida en vez de
  apilarla.
- Al pulsar el aviso se abre Inicio, o Herramientas en el bloque de cuerdas.

## Límites conocidos

- En iOS el push web exige la app instalada (16.4+).
- Sin abrir la app durante más de 90 días el plan se agota; al abrirla se
  regenera.
- Si el push no está disponible (invitado, navegador sin soporte, permiso
  bloqueado o sin suscripción), Inicio muestra el mismo recordatorio como fila
  descartable, una vez al día y solo después de la hora elegida.
