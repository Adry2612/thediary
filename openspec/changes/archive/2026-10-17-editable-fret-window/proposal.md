# Proposal

## Why

Al dibujar un acorde en el mástil la zona tocable se calcula desde la propia forma y se recorta: con la forma vacía solo deja marcar los trastes 1–4 y, en cuanto se marca un traste, la ventana se encoge (marcar el traste 2 deja 1–3). Muchos acordes —el B (`x24442`), el F#, cualquier cejilla— no se pueden completar, así que las notas nunca llegan a formar el acorde y el nombre no se asocia. La librería usa trastes hasta el 8 y las formas generadas hasta el 15.

## What Changes

- El diagrama del selector pasa a mostrar una **ventana fija de cinco trastes** que el usuario mueve por el mástil con dos flechas junto al diagrama. La ventana **no cambia al marcar trastes**.
- Al elegir un nombre o una posición, la ventana encuadra esa forma y, si no cabe entera, muestra sus trastes más agudos.
- Los puntos de trastes que quedan fuera de la ventana no se dibujan, como al desplazar un mástil de verdad.
- La ventana llega hasta el traste 15, que cubre todo el vocabulario y las formas generadas.

## Capabilities

### Modified Capabilities

- `repertoire-song-editor`: el requisito del selector sobre el mástil pasa a describir la ventana de cinco trastes que se puede mover y que no se encoge al dibujar.

## Impact

- `src/lib/chords.ts`: constantes de la ventana de edición y `getEditingWindowStart`.
- `FretboardDiagram`: ventana opcional y puntos fuera de la ventana.
- `ChordPicker`: estado de la ventana, flechas junto al diagrama y encuadre al cambiar de nombre o de posición.
- Etiquetas de i18n y pruebas de la función nueva.

## Notes

Los puntos fuera de la ventana se ocultan en lugar de dibujarse fuera de la cuadrícula; al desplazar la ventana vuelven a aparecer.
