# Proposal

## Why

El metrónomo marca siempre el mismo patrón: el primer pulso acentuado y los demás iguales. En compases compuestos (6/8, 9/8, 12/8) el acento no cae donde hace falta, y no hay forma de silenciar un pulso concreto sin bajar el volumen de todos. Cambiar de compás no resuelve el patrón.

Además, un pulso solo podía ser normal, fuerte o mudo. Faltaba distinguir dos tipos de resalte: uno que deja sonar y otro que se ahoga, como un charles abierto y uno cerrado.

## What Changes

- Los puntos de pulso pasan a ser interactivos y recorren **cuatro estados**: normal → resalte abierto → resalte cerrado → silencio.
- El **resalte abierto** suena con el tono fuerte y deja su cola; el **resalte cerrado** sube un 10 % y se ahoga a los 40 ms.
- El pulso silenciado no suena pero **sí sigue marcando el compás** con su animación y su número.
- El patrón se guarda **por compás** en este dispositivo y se recupera al cambiar de pantalla o recargar.
- Cada estado se distingue por forma, no solo por color, y se anuncia en texto.
- Teclado: con el foco en un pulso, Enter o Espacio recorren los cuatro estados y `M` alterna el silencio.

Fuera del alcance:

- Patrones por subdivisión: el gesto actúa sobre el pulso completo.
- Patrones predefinidos por estilo o compás.
- Exportar, importar o sincronizar el patrón entre dispositivos.
- Un editor de patrón más allá de los puntos.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `practice-tools`: añade requisitos sobre los pulsos del metrónomo, que hasta ahora no estaban especificados, y no cambia los cuatro requisitos existentes de la sección.

## Impact

- Estado y audio: `src/hooks/useMetronome.ts`, `src/utils/metronome-scheduler.ts`, `src/services/metronome-audio.ts`.
- Patrón y su persistencia: `src/utils/metronome-beat-pattern.ts` y `src/services/metronome-beat-pattern-storage.ts`.
- Timbres: `src/utils/metronome-voice.ts` gana la variante ahogada de cada voz.
- Interfaz: `src/components/practice/MetronomeCard.tsx`.
- Textos: `src/i18n/es.ts`, `src/i18n/en.ts` y `src/i18n/dictionary.ts`.
- Pruebas: `tests/metronome-beat-pattern.test.mjs`, `tests/metronome-voice.test.mjs`, `tests/metronome-scheduler.test.mjs` y `tests/metronome-audio.test.mjs`.
