# Tasks

## 1. Modelo del pulso vacío

- [x] 1.1 Añadir `empty?: true` a `TabBeat` en `src/types/tab-score.ts` y cambiar `normalizeBeat` para que solo sea silencio con `rest: true`, sea vacío con `empty: true` y trate un pulso antiguo sin notas y sin marcas como silencio. Añadir `createEmptyBeat`/`createEmptyBeats`. Verificar en `tests/tab-score-model.test.mjs` con un pulso vacío, un silencio, un pulso antiguo sin notas, uno con notas y otro con `empty` y notas (se descarta `empty`).
- [x] 1.2 Dibujar el pulso vacío como `()` en `src/utils/tab-score/alphatex.ts` y comprobar con el importador de alphaTab que no lo convierte en silencio ni rompe el compás. Verificar en `tests/tab-score-alphatex.test.mjs` y con una partitura de prueba que mezcle nota, silencio y vacío.
- [x] 1.3 Distinguir vacío de silencio en `scoreToText` y en el anuncio de la selección. Verificar en `tests/tab-score-text.test.mjs` y `tests/tab-score-announce.test.mjs`, y añadir las cadenas en `src/i18n/es.ts`, `en.ts` y `dictionary.ts` ejecutando el test que compara claves.

## 2. Borrar y silencio explícito

- [x] 2.1 Hacer que `deleteNote` deje el pulso vacío cuando se borra su última nota, sin tocar los demás pulsos ni el compás. Verificar en `tests/tab-score-operations.test.mjs` con el borrado de la única nota, el de una nota de un acorde y el de una nota con ligadura.
- [x] 2.2 Convertir la opción **Silencio** de la paleta en un interruptor: activa el silencio y, si todos los pulsos ya son silencios, los deja vacíos. Añadir la operación al reductor con un solo paso de historial y su motivo de desactivación. Verificar en `tests/tab-score-palette.test.mjs` y `tests/tab-score-editor-state.test.mjs` con activar, desactivar y deshacer.
- [x] 2.3 Actualizar `docs/tab-score.md` (borrado, silencio y vacío) y la ayuda del tutorial para que digan lo mismo que el código. Verificar que cada afirmación coincide con los tests de 2.1 y 2.2.

## 3. Subdivisión exacta

- [x] 3.1 Hacer que `divideOneBeat` cree los huecos nuevos vacíos, conservando el contenido en el primero y la suma del compás. Verificar en `tests/tab-score-operations.test.mjs` con negra en tresillo, corchea en quintillo y el compás completo.
- [x] 3.2 Exigir en `groupBeats` exactamente N pulsos: eliminar el recorte de los primeros N, devolver un motivo `tupletExactCount` con más o menos pulsos y dejar el tiempo liberado como pulsos vacíos al final del compás, sin silencios. Verificar con tests de tres corcheas, tres negras, cuatro pulsos con tresillo, dos pulsos con tresillo, tiempo liberado no representable y deshacer.
- [x] 3.3 Traducir el motivo nuevo en la paleta y actualizar `docs/tab-score.md` con la regla de selección exacta y los huecos vacíos. Verificar en `tests/tab-score-palette.test.mjs` y comprobando que el texto del documento coincide con los tests de 3.1 y 3.2.

## 4. Selección y teclado

- [x] 4.1 Simplificar `getSelectedNotes` para devolver todas las notas de los pulsos del tramo, sin recortar por cuerdas ni distinguir arrastre horizontal y diagonal. Verificar en `tests/tab-score-selection.test.mjs` con una frase que cambia de cuerda, un arrastre diagonal, pulsos vacíos y sin ancla.
- [x] 4.2 Sustituir las cajas por nota por un bloque verde continuo a toda la altura de la pauta entre el primer y el último pulso, y quitar el imán de 12 px del `hitTest` para que una nota solo se coja dentro de su caja. Verificar en el navegador arrastrando tres notas, pulsando justo fuera de una nota y comprobando que no se selecciona sola, a 375 px y con ratón.
- [x] 4.3 Invertir las flechas verticales en `moveSelection` para que arriba vaya a la cuerda dibujada encima y abajo a la de debajo. Verificar en `tests/tab-score-selection.test.mjs` con los extremos de la afinación y en el navegador con `ArrowUp`/`ArrowDown`.
- [x] 4.7 Cuando las N notas tienen figuras distintas y el tiempo liberado no es representable, igualar el grupo a la figura más corta para que la subdivisión se aplique y el compás conserve su total. Verificar con el test de figuras mixtas y en el navegador con dos negras y una corchea.
- [x] 4.6 Al agrupar notas ya escritas, dejar el cursor en el pulso siguiente al grupo (o en el primer hueco liberado) para que las notas nuevas no se añadan al tresillo. Verificar con un test de escritura tras agrupar y en el navegador escribiendo un traste después de aplicar el tresillo.
- [x] 4.5 Conservar el tramo marcado al abrir el menú de una nota que está dentro de él, para que la subdivisión siga viendo las N notas. Verificar en el navegador seleccionando tres notas, abriendo el menú con doble clic en la tercera y comprobando que el bloque sigue cubriendo las tres y que el tresillo se aplica a las tres.
- [x] 4.4 Actualizar `docs/tab-score.md` y la ayuda del tutorial con la selección por tramo, la nota por impacto exacto y la dirección de las flechas. Verificar que cada afirmación coincide con los tests de 4.1 y 4.3.

## 5. Verificación final

- [x] 5.1 Ejecutar `npm run typecheck`, `npm test` y `npm run build`; verificar que los tres terminan sin fallos nuevos.
- [x] 5.2 Recorrer en el navegador: borrar la última nota de un pulso y comprobar que queda el hueco sin figura y sin sonido, marcar silencio explícito y deshacerlo, seleccionar tres notas y aplicar tresillo comprobando que no se toca ninguna más, dividir un pulso y ver los huecos vacíos, mover la selección con las flechas y repetir con teclado y a 375 px en táctil. Anotar el resultado.

- Recorrido en navegador (2 nov 2026): borrar la última nota deja «vacío» sin figura y sin nota; Silencio activa y desactiva en un paso de deshacer; tres pulsos seleccionados con tresillo agrupan solo esos tres y dejan el tiempo liberado como hueco vacío; con cuatro pulsos el tresillo se desactiva con el motivo exacto; ArrowUp/ArrowDown recorren las cuerdas en el orden dibujado; el bloque verde cubre el tramo a toda altura y pulsar 7 px fuera de una nota la deja intacta y escribe en el punto; abrir el menú de una nota dentro del tramo conserva las tres y el tresillo se aplica a las tres; tras agrupar, escribir un traste cae en el pulso siguiente y no se une al tresillo; dos negras y una corchea seleccionadas se agrupan igualando las tres a corchea y el pulso deja de decir «demasiado corto»; probado a 375 px con arrastre y sin desbordamiento horizontal.

## Workflow follow-up

- Aplicar y archivar después de `add-score-tab-editor` y `add-tab-multi-select-and-tuplets`: `openspec validate` avisa de que las specs principales de `tab-score-editor` y `tab-score-range-editing` todavía no existen.
- Probar el borrado, la subdivisión y la selección en un iPhone real antes de archivar.
