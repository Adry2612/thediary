# Proposal

## Why

La forma del `Csus2` de la librería es `x30010`: Do, Re, Sol, Do y **Mi**. Ese Mi es la tercera mayor, y un sus2 por definición no lleva tercera, así que lo que suena en realidad es un Do add9. Se nota al dibujarlo: la detección de nombres no lo reconoce como ningún acorde del vocabulario, porque las notas no son las de un sus2.

## What Changes

- La forma pasa a `x30033` (Do, Re, Sol, Re, Sol): fundamental, segunda y quinta, con la fundamental en la cuerda más grave. Sigue siendo una forma abierta, sin cejilla, y en la misma zona del mástil.

No cambia ningún requisito: es una corrección del contenido de la librería, no del comportamiento, así que el cambio no lleva delta de especificación.

## Impact

- `src/lib/chords.ts` (`CHORD_SHAPES`).
- La prueba que documentaba la excepción del `Csus2` deja de necesitarla y pasa a exigir que la forma se nombre a sí misma.
