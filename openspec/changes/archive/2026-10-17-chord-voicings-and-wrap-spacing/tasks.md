# Tasks

## 1. Lógica pura

- [x] 1.1 Añadir `isContinuation` a `WrappedRow` en `src/lib/repertoire-chord-layout.ts` (verdadero cuando la fila no es la primera de su línea lógica); verificar con una prueba en `tests/repertoire-chord-layout.test.mjs` que la primera fila no es continuación y las siguientes sí, y que una línea en blanco tampoco.
- [x] 1.2 Añadir `getGeneratedChordVoicings(pitchClass, type)` (raíz en la 6ª, 5ª y 4ª cuerda, ordenadas por traste de la raíz y sin duplicados) y `getChordVoicings(name, saved)` con la prioridad guardado → librería → generado, en `src/lib/chords.ts`; verificar con prueba que hay más de una forma, que van de la posición más baja a la más alta y que no se repiten.

## 2. Interlineado según el tipo de fila

- [x] 2.1 Sustituir el hueco uniforme de `ChordChartEditor` por uno por tipo de fila (continuación más junta que una frase nueva, y la estrofa separada); verificar en el navegador que las líneas de continuación quedan más juntas y que una frase nueva y una estrofa conservan más aire.

## 3. Voicings en la caja del acorde

- [x] 3.1 Conectar `ChordPicker` con `getChordVoicings` y añadir el control anterior/siguiente con `posición k/n`, visible solo cuando hay más de una forma; verificar que cambiar de posición redibuja el mástil y que se asigna la forma elegida.
- [x] 3.2 Añadir las etiquetas nuevas (posición, anterior, siguiente) en español e inglés; verificar con la prueba de i18n.

## 4. Verificación

- [x] 4.1 Ejecutar `npm run typecheck` y `npm test` y confirmar que pasan sin errores.
- [x] 4.2 Ejecutar `npm run build` y confirmar que termina correctamente.
- [x] 4.3 Comprobar con el navegador el flujo completo: una frase larga con hueco distinto entre continuación, frase nueva y estrofa, y un acorde con varias posiciones que se asignan y se guardan.

## Workflow follow-up

- Archivar el cambio cuando la implementación esté verificada.
