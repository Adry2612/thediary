# Proposal

## Why

Practicar desde el móvil con la app instalada rompe la sesión en curso: el
teléfono se bloquea porque el usuario no lo está tocando, el metrónomo y los
avisos se quedan mudos, y al volver el cronómetro ha perdido el tiempo
practicado o la práctica ha desaparecido. No es un límite de la plataforma: son
tres fallos concretos de la app web que hoy nadie cubre, y bloquean justo el uso
para el que existe la app — practicar con la guitarra lejos del escritorio.

## What Changes

- **La práctica en curso sobrevive a que el sistema suspenda o recargue la app.**
  El estado del cronómetro —tiempo transcurrido, bloque actual, tiempo por
  bloque y por destreza, si está en marcha— se guarda junto a la sesión activa y
  se restaura al volver, en vez de reiniciarse a cero.
- **La pantalla no se apaga sola mientras hay una práctica en marcha.** La app
  pide el bloqueo de pantalla del sistema al arrancar el cronómetro, lo vuelve a
  pedir si el usuario sale y entra, y lo libera al pausar, al terminar y al
  cerrar la sesión.
- **El audio vuelve a sonar al volver a la app.** El metrónomo, el generador de
  tonos y el afinador reanudan su contexto de audio cuando la app recupera el
  foco, y el metrónomo reancla su planificación para no soltar una ráfaga de
  clics atrasados.
- **Cuando el navegador exige un gesto para reanudar el audio**, la app lo pide
  con una acción visible en vez de quedarse en silencio sin explicar por qué.
- Se añaden pruebas de las piezas puras nuevas: restauración del cronómetro,
  decisión de pedir o no el bloqueo de pantalla y reanclaje de la planificación.

Fuera de este cambio, deliberadamente: meter la app en un contenedor tipo
Ionic/Capacitor, el widget de pantalla de inicio de iOS, el service worker y la
caché offline, y el metrónomo con la pantalla apagada y la app en segundo plano
—eso último exige un motor de audio nativo y no lo resuelve ningún contenedor
web.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `practice-session-management`: una práctica en marcha conserva su cronómetro
  al volver a la app y mantiene la pantalla encendida mientras corre.
- `practice-tools`: las herramientas de audio reanudan su sonido al recuperar
  el foco y el metrónomo continúa sin repetir clics atrasados.

## Impact

- **Código**: `src/hooks/usePracticeTimer.ts` (restauración y persistencia del
  runtime), `src/stores/useActivePracticeSessionStore.ts` (clave de
  almacenamiento y limpieza), una utilidad pura nueva para serializar y validar
  el runtime guardado, `src/hooks/useMetronome.ts` (reanudación y reanclaje),
  `src/services/metronome-audio-context.ts`, `src/hooks/useToneGenerator.ts` y
  un hook nuevo para el bloqueo de pantalla.
- **Pruebas**: casos nuevos en `tests/practice-timer.test.mjs`,
  `tests/active-practice-session.test.mjs`, `tests/metronome-scheduler.test.mjs`
  y un fichero nuevo para la decisión del bloqueo de pantalla. `npm test` debe
  seguir pasando sin tocar los casos existentes.
- **Sin cambios**: `supabase/`, el contrato de datos compartido, `apps/ios-native/`
  y el despliegue. No hay dependencias nuevas ni migraciones.
- **Riesgo**: iOS puede negar la reanudación del audio sin un gesto del usuario.
  Se asume y se cubre con una acción explícita, no con un reintento silencioso.
