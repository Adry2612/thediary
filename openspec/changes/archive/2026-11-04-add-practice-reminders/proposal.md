# Proposal

## Why

La app ya sabe qué rutina toca hoy, cuándo vence el cambio de cuerdas de cada guitarra y cuántos días llevas sin practicar, pero solo lo cuenta cuando abres la app. Quien no entra ese día no recibe nada, así que el recordatorio depende de acordarse de mirar.

## What Changes

- Añade **recordatorios opcionales con Web Push** que llegan con la app cerrada, tras conceder permiso en el dispositivo.
- Añade una sección **Recordatorios** en Configuración con:
  - interruptor general;
  - recordatorio de **práctica de hoy**, **cambio de cuerdas** y **días sin practicar**, cada uno activable por separado;
  - una **hora común** configurable (19:00 por defecto);
  - umbral de inactividad configurable: 3, 7, 14 o 30 días (7 por defecto);
  - estado del permiso, aviso para invitados y botón de notificación de prueba.
- Envía **un único aviso diario combinado** por dispositivo: si coinciden varios motivos, se agrupan en una sola notificación a la hora elegida.
- Reglas del aviso:
  - **Práctica**: solo si el día tiene una rutina asignada y todavía no hay una sesión guardada de ese día.
  - **Cuerdas**: solo si alguna guitarra está vencida según su intervalo de días u horas.
  - **Inactividad**: solo si han pasado los días configurados sin ninguna sesión.
  - Sin motivos aplicables no se envía nada.
- Al pulsar la notificación se abre la pantalla correspondiente: Inicio para la práctica, Herramientas/Cuerdas para el mantenimiento.
- Cada dispositivo guarda su suscripción y su zona horaria; la hora se interpreta en la zona del dispositivo. No se envían duplicados y las suscripciones caducadas se eliminan.
- La infraestructura de envío se apoya en Supabase: tabla de suscripciones, plan diario de avisos y una función programada que entrega los que vencen.

Fuera del alcance:

- App nativa, correo, SMS o canales distintos del push del navegador.
- Horas distintas por tipo de recordatorio.
- Elegir una guitarra concreta: el aviso nombra la más urgente.
- Centro de historial de notificaciones, sonidos personalizados o silencio por franjas.
- Recordatorios para invitados con la app cerrada: sin cuenta no hay datos en el servidor, así que no reciben avisos.
- Sincronizar las preferencias de recordatorios entre dispositivos: cada dispositivo tiene su permiso, su suscripción y su configuración.

## Capabilities

### New Capabilities

- `practice-reminders`: preferencias de recordatorios, permiso y suscripción push por dispositivo, reglas del aviso diario combinado y entrega programada.

### Modified Capabilities

<!-- none -->

## Impact

- Ajustes: nueva sección en `src/components/account/SettingsView.tsx`, hook de preferencias y textos en `src/i18n/es.ts` y `src/i18n/en.ts`.
- Lógica pura: evaluación de motivos, zona horaria, generación del plan diario y mensajes combinados en `src/utils/` y `src/services/`.
- Navegador: service worker en `public/`, registro y ciclo de suscripción push, permiso y notificación de prueba.
- Supabase: migración para `push_subscriptions` y el plan de avisos con RLS, función Edge de envío y programación periódica; secretos VAPID fuera del repositorio.
- Configuración: nuevas variables en `.env.example` y documentación del despliegue de la función y las claves.
- Pruebas: evaluación de los tres motivos, zona horaria, combinación de mensajes, generación del plan y preferencias.
