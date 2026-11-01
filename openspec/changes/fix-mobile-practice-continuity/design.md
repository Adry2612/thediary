# Design

## Context

Ver `proposal.md` — Why y `specs/` para el comportamiento exigido.

Estado actual que condiciona el diseño:

- `src/hooks/usePracticeTimer.ts` mantiene el runtime del reloj en `runtimeRef`
  y publica un `TimerSnapshot` por `useState`. Nada de eso se persiste.
- El mismo hook reinicia el runtime en un `useEffect` con dependencias
  `[countUp, phasePlanKey, publishSnapshot]`, que **también corre al montar**.
  Ese efecto es la causa directa de que recargar la app devuelva el reloj a
  cero, y es el punto donde debe entrar la restauración.
- `synchronizePracticeTimer` (`src/utils/practice-timer.ts`) es autoconsistente:
  calcula `deltaMs = now - lastUpdatedAtMs` y devuelve `lastUpdatedAtMs = now`.
  Restaurar el runtime tal cual conserva la semántica actual —el hueco de tiempo
  en segundo plano se cuenta como practicado— sin inventar reglas nuevas.
- El runtime lleva `phaseElapsedTotalsMs` y `skillElapsedMs`, que alimentan la
  sesión guardada y **no se pueden reconstruir** desde `startedAtMs`.
- `useActivePracticeSessionStore` ya persiste la sesión en
  `thediary.active-practice-session`, sin el reloj.
- `useMetronome` planifica con `SCHEDULE_AHEAD_SECONDS = 0.1` sobre
  `AudioContext.currentTime` y avanza `nextBeatTimeRef` desde un
  `setInterval(25 ms)`. No escucha `visibilitychange`.
- `src/services/audio-session.ts` ya declara `navigator.audioSession` como
  `playback` para el interruptor de silencio de iOS: hay precedente de mejoras
  progresivas de audio.
- `useMetronome` es compartido por el metrónomo de Herramientas y el de la
  pantalla de práctica, así que un solo arreglo cubre los dos.

## Goals / Non-Goals

**Goals:**

- Que recargar, suspender o bloquear el teléfono no reinicie una práctica.
- Que la pantalla no se apague sola mientras corre el cronómetro.
- Que el audio vuelva al recuperar el foco sin ráfagas ni silencios sin explicar.
- Piezas puras y testeables con `node --test`, sin tocar los casos existentes.

**Non-Goals:**

- Audio en segundo plano con la pantalla apagada: exige motor nativo.
- Cambiar la forma de la sesión activa que ya se persiste.
- Tocar el contrato de datos compartido o el cliente iOS.
- Caché offline o service worker.

## Decisions

### D1 — Persistir el runtime completo, no valores derivados

Se guarda `{ version, sessionId, planKey, countUp, runtime }` en
`thediary.active-practice-timer`. El `runtime` es el `PracticeTimerRuntime`
completo, incluidos `phaseElapsedTotalsMs`, `skillElapsedMs` y
`lastUpdatedAtMs`.

*Por qué*: es la única forma de conservar los totales por bloque y por destreza,
que son los que acaban en la práctica guardada. Reconstruirlos desde
`startedAtMs` es imposible cuando hay bloques saltados o tiempo en overtime.

*Alternativas*: guardar solo `startedAtMs` y recalcular (descartado: pierde los
totales); guardar el `TimerSnapshot` publicado (descartado: no lleva los totales
ni `lastUpdatedAtMs`, que es lo que hace avanzar el reloj).

### D2 — La restauración vive en el efecto que hoy reinicia

El `useEffect` de `[countUp, phasePlanKey, publishSnapshot]` pasa a consultar el
almacén antes de crear el runtime a cero: si hay una instantánea que coincide en
`sessionId`, `planKey` y `countUp`, la adopta; si no, arranca desde cero como hoy.

*Por qué*: hidratar en un efecto aparte compite con este reinicio y con el
primer tick del intervalo, y el orden de los efectos decide el resultado. Un solo
punto de decisión elimina la carrera.

*Alternativas*: hidratar en el inicializador de `useState` (descartado: el efecto
de reinicio lo pisa en el mismo commit); mover el reinicio a un evento explícito
(descartado: cambia el contrato del hook y toca más llamadas de las necesarias).

### D3 — Validación estricta de la instantánea guardada

Módulo puro nuevo `src/utils/practice-timer-storage.ts` con
`serializeTimer`, `parseStoredTimer` y `shouldRestoreTimer`. Descarta la
instantánea cuando cambia la versión, el `sessionId`, el `planKey` o `countUp`,
cuando `phaseIndex` queda fuera del plan, cuando aparece un número no finito o
negativo, o cuando los arrays de totales no cuadran con el plan.

*Por qué*: una entrada corrupta o de otro plan no puede romper una práctica ni
contaminar la sesión que se va a guardar. Descartarla es barato; arreglarla no.

*Alternativas*: confiar en lo guardado (descartado: un `phaseIndex` fuera de
rango ya rompe `synchronizePracticeTimer`, que lanza `RangeError`).

### D4 — Escritura con throttle y volcado en `pagehide`

Se escribe como mucho una vez por segundo mientras corre el reloj, y siempre en
pausa, salto de bloque, fin y `pagehide`. Nunca en `beforeunload`.

*Por qué*: el `setInterval` de sincronización corre cada 250 ms y el JSON crece
con el plan; escribir en cada tick es gasto innecesario en un móvil. `pagehide`
es el único evento de descarga en el que iOS es fiable.

*Alternativas*: escribir en cada sincronización (descartado: cuatro escrituras
por segundo); `beforeunload` (descartado: no se dispara de forma fiable en iOS).

### D5 — Bloqueo de pantalla como hook con reactivación

Hook nuevo `useScreenWakeLock(active: boolean)`: pide el bloqueo cuando `active`
es verdadero y la página está visible, lo vuelve a pedir en `visibilitychange`
hacia visible, y lo libera al desactivarse, al ocultarse la página y al
desmontar. Detecta `'wakeLock' in navigator` y captura `NotAllowedError`.

*Por qué*: el sistema libera el bloqueo en cuanto la página deja de estar
visible. Sin la reactivación, volver a la app dejaría la pantalla apagándose otra
vez a los pocos segundos, que es el fallo que se quiere corregir.

*Alternativas*: pedirlo solo al pulsar empezar (descartado: se pierde al cambiar
de app y no se recupera); mantener la pantalla con un vídeo en bucle (descartado:
gasta batería y es un truco que los navegadores acaban bloqueando).

### D6 — Reanudar, reanclar y pedir gesto solo si hace falta

Al volver a visible con el metrónomo en marcha: `await context.resume()`. Si
queda en `running`, se reancla
`nextBeatTimeRef = context.currentTime + SCHEDULE_AHEAD_SECONDS` y se limpian
`pulseTimeoutsRef` y `activeSourcesRef`. Si sigue suspendido, se expone un estado
que la vista convierte en una acción visible "Reactivar sonido".

*Por qué*: `scheduleNextBeats` programa 100 ms por delante en tiempo del
`AudioContext`. Tras una suspensión la referencia queda atrás y el primer tick
programaría todos los pulsos perdidos de golpe: una ráfaga de clics. Reanudar sin
reanclar es peor que no reanudar. Y cuando el navegador exige un gesto, fingir
que suena deja al usuario sin saber por qué no hay sonido.

*Alternativas*: reiniciar el metrónomo al volver (descartado: pierde el compás y
el pulso visual); reanudar sin reanclar (descartado: ráfaga).

### D7 — Un hook de reanudación compartido, contextos separados

`useAudioResume` recibe la referencia al contexto y si la herramienta está
activa, y devuelve si hace falta el gesto. Lo usan metrónomo, generador de tonos
y afinador; el metrónomo añade su callback de reanclaje.

*Por qué*: cada herramienta tiene su propio `AudioContext` (el afinador además
usa el micrófono) y la spec las trata como independientes. Un contexto global
acoplaría herramientas que hoy no lo están.

*Alternativas*: un `AudioContext` único para toda la app (descartado: acopla
herramientas y complica el ciclo de vida del micrófono).

## Risks / Trade-offs

- **[iOS exige un gesto para reanudar audio]** → acción "Reactivar sonido" en
  lugar de reintento silencioso; se valida en simulador y en dispositivo real.
- **[El tiempo en segundo plano infla una práctica]** → es la semántica que ya
  tiene el reloj; el bloqueo de pantalla evita el caso habitual y una práctica
  pausada no cuenta el tiempo ausente.
- **[`pagehide` no llega si el sistema mata la app]** → la escritura con throttle
  acota la pérdida a cerca de un segundo.
- **[Instantánea de otro plan]** → `planKey` y `countUp` la invalidan y se
  arranca limpio, sin migrar nada.
- **[El bloqueo de pantalla consume batería]** → se libera al pausar y al
  terminar; es el precio de no tener audio en segundo plano.
- **[Almacenamiento lleno o modo privado]** → las escrituras van envueltas y un
  fallo deja la práctica funcionando en memoria, sin bloquearla.

## Migration Plan

1. Añadir el módulo puro y sus pruebas; `npm test` debe pasar sin tocar casos
   existentes.
2. Conectar la restauración en `usePracticeTimer` y verificar que una práctica
   sin instantánea previa se comporta igual que antes.
3. Añadir el hook de bloqueo de pantalla y conectarlo a la pantalla de práctica.
4. Reanudar audio y reanclar el metrónomo.
5. Rollback: borrar la clave `thediary.active-practice-timer` y revertir los
   hooks. Las versiones antiguas ya ignoran esa clave, así que no hay migración
   de datos ni estado que restaurar.

## Open Questions

Ninguna. El único límite conocido —metrónomo con la pantalla apagada— queda
fuera de alcance por decisión explícita, no por falta de respuesta.
