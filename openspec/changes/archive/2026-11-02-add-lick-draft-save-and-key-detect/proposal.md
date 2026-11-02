# Proposal

## Why

Escribir una tablatura lleva varias sesiones y el editor solo persiste al guardar el lick completo, así que una idea a medias obliga a rellenar título, tonalidad y datos antes de poder cerrar. Además, la tonalidad solo se detecta de las tablaturas antiguas de rejilla: en la partitura visual el campo se queda vacío aunque haya notas suficientes.

## What Changes

- **Guardar tablatura sin terminar el lick.** El editor de tablatura gana un botón propio que guarda la partitura y los campos que ya sean válidos, sin exigir BPM, canción ni técnicas, y **sin salir del editor**. Si el título está vacío se guarda como «Sin título»; al escribir uno y guardar el lick se actualiza el mismo registro. Un lick nuevo creado así aparece en la biblioteca como cualquier otro.
- **La tonalidad se detecta desde la partitura visual.** La detección usa las notas, cuerdas y afinación de la partitura que se está editando, no solo la tablatura antigua guardada.
- **La tonalidad detectada se aplica sola mientras el campo está en automático.** Si el usuario elige una tonalidad a mano, deja de sobrescribirse; «Usar esta tonalidad» vuelve a activar el automático.
- **Fuera de alcance:** guardar borradores anónimos sin lick, varias versiones de una tablatura, resolver tonalidades con acordes o contexto armónico, y detectar tonalidad en canciones o material de práctica.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `licks-library`: el editor puede guardar la tablatura de un lick sin completar el resto de la ficha, y la tonalidad se detecta de la partitura visual y se aplica automáticamente mientras el campo no se haya fijado a mano.

## Impact

- **Código:** `src/components/licks/LickEditor.tsx` (botón, borrador, campos), `LickEditorPage.tsx` (guardado sin navegar), `src/utils/licks/key-detection.ts` (detección desde `TabScore`), `src/utils/tab-score/alphatex.ts` (afinación a MIDI reutilizable), textos en `src/i18n/` y `docs/licks.md`.
- **Datos:** no cambia el modelo ni se sube versión; un lick borrador es un lick normal con título provisional. La tonalidad sigue siendo opcional.
- **Tests:** detección de tonalidad desde una partitura (afinación, notas muertas, mínimos), normalización de la afinación y comparación de claves de i18n.
- **Riesgo:** guardar un borrador con «Sin título» puede llenar la biblioteca de licks sin nombre; se mitiga mostrando el estado «Tablatura guardada» y permitiendo renombrarlo al guardar el lick.
