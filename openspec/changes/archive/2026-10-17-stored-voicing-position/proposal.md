# Proposal

## Why

Al volver a editar un acorde que se guardó con una posición distinta de la primera, el contador de posiciones dice siempre «Posición 1/N» aunque el diagrama dibuje la forma guardada. Comprobado en el navegador: un `A` asignado en su segunda posición (cejilla del traste 5) se reabre con esos mismos trastes dibujados, pero con el contador en «Posición 1/3». La consecuencia visible es que la primera pulsación de «›» solo cambia el número a «2/3» sin mover el dibujo —ya era esa forma— y hay que pulsar otra vez para pasar a la siguiente.

El número y el dibujo son dos vistas de lo mismo: la forma. Como lo que se guarda es la forma y no el número, el número tiene que deducirse de ella.

## What Changes

- El contador de posiciones pasa a mostrar la posición de la forma que se está viendo: si coincide con una de la lista, muestra su número.
- Al pulsar «‹» o «›» se avanza desde la posición que se está viendo, no desde el último índice elegido.

## Impact

- `src/lib/chords.ts`: función para localizar la posición de una forma dentro de la lista de voicings.
- `src/components/repertoire/ChordPicker.tsx`.
- Especificación `chord-voicings` (requisito «The chosen position is kept with the chord»).
