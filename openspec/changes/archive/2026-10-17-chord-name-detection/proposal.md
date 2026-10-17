# Proposal

## Why

Dos detalles de la caja del acorde. El buscador dejó el campo de nombre con menos sitio y el placeholder "Nombre del acorde" se corta (necesita 220 px y solo tiene 188). Y al revés de lo que ya hace el nombre —que dibuja la forma—, dibujar una forma en el mástil no dice qué acorde es: hay que sabérselo o ir probando nombres.

## What Changes

- **Placeholder del campo de nombre**: se acorta a "Acorde" para que se lea entero; el nombre accesible del campo sigue siendo "Nombre del acorde".
- **Detección al dibujar**: cuando el usuario coloca trastes y cuerdas al aire en el mástil, la app deduce el acorde que forman las notas y escribe su nombre. Si las notas no forman ningún acorde del vocabulario, el nombre se queda como estaba.

Sin cambios de datos ni de guardado: sigue guardándose una forma y un nombre por acorde.

## Capabilities

### Modified Capabilities

- `repertoire-song-editor`: se añade que dibujar una forma en el mástil nombra el acorde.

## Impact

- `src/lib/chords.ts`: nueva función pura `detectChordName(frets)` que reconoce las 7 calidades del vocabulario en afinación estándar.
- `ChordPicker`: al marcar trastes o cuerdas al aire actualiza el nombre con lo detectado; el placeholder pasa a una etiqueta corta.
- Un par de etiquetas de i18n y pruebas de la función nueva.

## Notes

La corrección del placeholder es de copy (no cambia comportamiento), así que no lleva requisito propio; va con las tareas del cambio.
