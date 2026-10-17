# Tasks

## 1. Modelo y lógica pura

- [x] 1.1 Añadir el tipo `UserChord` (`{ id, name, shape }`) y el campo `customChords` al estado persistido y al store, y fusionarlo por `id` en `mergePracticeData`; verificar con una prueba de merge (local + nube, sin duplicados) que pasa.
- [x] 1.2 Crear `wrapLyricLine(line, columns)` en `src/lib/repertoire-chord-layout.ts`: reparto por palabra, palabra que no cabe partida por carácter, acorde en hueco consumido pegado a la fila anterior, etiqueta al borde bajada a la fila siguiente, y líneas en blanco consecutivas colapsadas; verificar con `tests/repertoire-chord-layout.test.mjs`.
- [x] 1.3 Añadir el vocabulario estructurado (12 fundamentales × 7 tipos) y `parseChordName(name)` a `src/lib/chords.ts`, con una clave de identidad (clase de altura + tipo) para la forma y los duplicados y conservando la grafía escrita; verificar con casos reconocidos, no reconocidos y una pareja enarmónica (`Db7`/`C#7`) que resuelve a la misma forma en `tests/repertoire-chords.test.mjs`.
- [x] 1.4 Añadir el generador de formas por tipo y `resolveChordShape(name, saved)` con la prioridad guardado → librería → generado; verificar que la librería gana cuando existe y que toda combinación del vocabulario produce una forma, con prueba.

## 2. Envoltura de la letra

- [x] 2.1 Pintar en `ChordChartEditor` las filas de `wrapLyricLine` en lugar de la línea con `overflow-x-auto`; verificar que una línea larga ya no hace scroll y sigue alineada con sus acordes.
- [x] 2.2 Medir el ancho del contenedor (ResizeObserver + anchura de columna) y reencuadrar al redimensionar; verificar que la línea se recompone al cambiar el ancho.
- [x] 2.3 Dibujar el salto de estrofa de las líneas en blanco y añadir sus etiquetas en español e inglés; verificar que dos estrofas se separan y que las etiquetas existen, con la prueba de i18n.

## 3. Caja del acorde

- [x] 3.1 Añadir grupos con cabecera no seleccionable al `SelectField` (que el teclado las salte); verificar con una prueba de que la cabecera no es seleccionable.
- [x] 3.2 Reconvertir `ChordPicker` al orden nombre grande editable → mástil → selectores → botones, con el nombre como fuente de verdad; verificar que escribir un acorde reconocido actualiza selectores y dibujo.
- [x] 3.3 Conectar los selectores de Nota y Tipo con el nombre y con `resolveChordShape`, mostrando los enarmónicos en la Nota (`C#/Db`…) e incluyendo el grupo de personalizados; verificar que cambiar un selector actualiza el nombre y el dibujo, y que un nombre no reconocido deja los selectores vacíos.
- [x] 3.4 Mostrar la etiqueta "personalizado" cuando la forma sale de los acordes guardados; verificar que aparece con un acorde propio y no con uno de la librería.
- [x] 3.5 Habilitar `Quitar` solo cuando la posición seleccionada ya tiene acorde; verificar que no se ofrece en una posición vacía.
- [x] 3.6 Añadir todas las etiquetas nuevas en español e inglés; verificar con la prueba de i18n.

## 4. Acordes del usuario

- [x] 4.1 Añadir las acciones `saveCustomChord` y `deleteCustomChord` al store, sincronizadas con los datos del usuario; verificar que un acorde guardado se ofrece tras recargar.
- [x] 4.2 Añadir el botón `Guardar` en la caja y una gestión mínima para borrar los acordes propios; verificar que un acorde guardado se reutiliza y que al borrarlo vuelve el de la librería.
- [x] 4.3 Ofrecer los acordes guardados en el grupo "Personalizados" del selector, con grupo general para los que no tienen fundamental; verificar ambos casos.
- [x] 4.4 Añadir las etiquetas nuevas en español e inglés; verificar con la prueba de i18n.

## 5. Verificación

- [x] 5.1 Ejecutar `npm run typecheck` y `npm test` y confirmar que pasan sin errores.
- [x] 5.2 Ejecutar `npm run build` y confirmar que termina correctamente.
- [x] 5.3 Comprobar a mano el flujo completo: envoltura sin scroll, caja con nombre editable, guardar un acorde propio y reutilizarlo en otra canción.

## Workflow follow-up

- Archivar el cambio cuando la implementación esté verificada.
