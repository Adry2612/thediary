# Proposal

## Why

Un lick suele salir de un momento concreto de una canción o de un vídeo. Hoy el usuario puede guardar el enlace de YouTube en el material de práctica de una canción, pero sin marcar el fragmento: cada vez que quiere comprobar cómo suena tiene que abrir el vídeo y buscar el segundo a mano. El lick ya tiene ficha propia; el vídeo de referencia debe vivir ahí, con su inicio y su final.

## What Changes

- Cada lick puede llevar **un vídeo de referencia opcional** de YouTube con un segundo de inicio y un segundo de fin.
- El editor del lick añade tres campos —enlace, desde y hasta— y valida antes de guardar: el enlace tiene que ser un vídeo de YouTube y el final tiene que ser posterior al inicio. Acepta tiempos en segundos (`83`) y en `m:ss` o `h:mm:ss` (`1:23`).
- La ficha del lick muestra el vídeo incrustado y **repite solo el fragmento marcado**: al llegar al final vuelve al inicio y sigue. Si el usuario lo prefiere, un enlace abre YouTube en ese mismo segundo.
- Los licks antiguos y los que no tengan vídeo se cargan igual; un vídeo guardado que ya no sea válido se descarta sin perder el lick.
- Fuera de alcance: varios vídeos por lick, vídeos en las canciones o en el material de práctica, elegir el fragmento desde la reproducción y descargar el vídeo.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `licks-library`: el lick gana un vídeo de referencia opcional con inicio y fin, su validación y su reproducción en bucle en la ficha del lick.

## Impact

- `src/types/lick.ts`: campo opcional `referenceVideo`.
- `src/utils/licks/normalize.ts` y un módulo nuevo para validar el enlace y los tiempos.
- `src/components/licks/LickEditor.tsx` y `src/app/(workspace)/licks/[id]/page.tsx`.
- Componente nuevo del reproductor con la IFrame Player API de YouTube.
- Textos de `licks` en `src/i18n/dictionary.ts`, `es.ts` y `en.ts`.
- Tests de normalización, tiempos y validación; recorrido en navegador en escritorio y móvil.
