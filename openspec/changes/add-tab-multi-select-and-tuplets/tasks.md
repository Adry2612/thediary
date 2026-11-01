# Tasks

## 1. Modelo, ticks y dibujo

- [x] 1.1 Ampliar `TabBeat.tuplet` a 3, 5, 6, 7, 9, 10 y 12, añadir la tabla de proporciones (3:2, 5:4, 6:4, 7:4, 9:8, 10:8, 12:8) y normalizar solo esos valores. Verificar con tests de los siete números, un valor desconocido que se descarta conservando el pulso y un `tuplet: 3` antiguo que sigue cargando.
- [x] 1.2 Calcular los ticks con la proporción de cada subdivisión y emitir `{tu n}` en AlphaTex. Verificar con tests de duración de cada número, de la representación AlphaTex y de la partitura dibujada.
- [x] 1.3 Aceptar en `getBarFill` una tolerancia de 4 ticks cuando el compás contiene subdivisiones y mantener la comparación exacta en los demás. Verificar con tests de un compás con septillo y nonillo (no se marca) y de un compás normal con 1 tick de diferencia (sí se marca).
- [x] 1.4 Generalizar la etiqueta de la subdivisión en `scoreToText` y en el anuncio de la selección (tresillo, quintillo, seisillo, septillo, nonillo, decimillo, doceavo). Verificar con tests del texto de cada número.

## 2. División del pulso

- [x] 2.1 Implementar `divideBeat`: calcular la figura base como `ticks / entran`, sustituir el pulso por N huecos con `tuplet: n`, conservar el contenido en el primero y dejar silencios en el resto, con los motivos `cannotSubdivide`, `alreadySubdivided` y `beatLimit`. Verificar con tests de negra en tresillo, corchea en quintillo, semifusa que no cabe, pulso ya subdividido, compás lleno de pulsos y suma del compás.
- [x] 2.2 Añadir la acción al reductor con un solo paso de historial y dejar seleccionado el primer hueco. Verificar con tests de deshacer, de rehacer y de la selección resultante.
- [x] 2.3 Comprobar que tras dividir se pueden escribir las N notas con el avance automático y que el compás sigue exacto. Verificar con tests del reductor que escriben 3, 5 y 7 notas seguidas.

## 3. Selección por arrastre

- [x] 3.1 Añadir al lienzo el arrastre horizontal: `pointerdown` selecciona el origen, el movimiento por encima de 8 px extiende con `select` y `extend`, `pointerup` termina, la pulsación larga y el doble toque se cancelan y no se abre el menú ni se escribe. Verificar en el navegador con ratón y a 375 px con toque.
- [x] 3.2 Poner `touch-action: pan-y` en la capa interactiva para que el arrastre vertical siga desplazando la página y comprobar que Mayús + clic y Mayús + flechas siguen extendiendo el tramo. Verificar en el navegador con ratón y a 375 px.

## 4. Paleta, diálogo y textos

- [x] 4.1 Sustituir la opción de tresillo de la paleta por **Subdivisión**, que abre un diálogo con los siete números, su nombre y el motivo cuando no caben; aplicar la división al elegir y cerrar con Escape sin cambios. Verificar con tests de la opción, del estado activo y de cada motivo de desactivación.
- [x] 4.2 Añadir las cadenas del diálogo, la paleta y las etiquetas de cada subdivisión en `src/i18n/dictionary.ts`, `es.ts` y `en.ts`; ejecutar el test que compara las claves entre idiomas.
- [x] 4.3 Actualizar `docs/tab-score.md` y la ayuda del tutorial con la selección por arrastre y las subdivisiones; comprobar que cada afirmación coincide con el código y los tests.

## 5. Verificación final

- [x] 5.1 Ejecutar `npm run typecheck`, `npm test` y `npm run build`; verificar que los tres terminan sin fallos nuevos.
- [x] 5.2 Recorrer en el navegador: arrastrar para marcar tres pulsos, aplicar una duración al tramo, dividir un pulso en tresillo, escribir las tres notas, comprobar el compás exacto, probar quintillo y septillo, deshacer, repetir con teclado y a 375 px en táctil. Anotar el resultado.

## 6. Agrupar notas existentes

- [x] 6.1 Al seleccionar exactamente N pulsos, agruparlos en una sola subdivisión (una nota por hueco) y añadir el tiempo liberado como silencios al final del compás. Verificar con tests de tres corcheas, tres negras y cinco corcheas.
- [x] 6.2 Rechazar con motivo las selecciones con menos pulsos que la subdivisión, las figuras distintas y las que cruzan compás; con más pulsos, agrupar los primeros N. Verificar en el selector.
- [x] 6.3 Actualizar la spec, el diseño, la documentación y el recorrido del navegador: tres notas seleccionadas + tresillo forman un solo grupo con su silencio, no nueve huecos.

## 7. Selección por notas

- [x] 7.1 Añadir `getSelectedNotes`: cruza los pulsos del tramo con las cuerdas entre el ancla y el foco y devuelve solo las notas que existen. Verificar con tests de una cuerda, un rectángulo de cuerdas, pulsos vacíos y sin ancla.
- [x] 7.2 Dibujar una caja por nota seleccionada en vez del bloque de pulso, manteniendo el resaltado por pulso solo cuando no hay notas. Verificar en el navegador arrastrando sobre tres notas y comprobando que se resaltan las tres, no los pulsos.

## Workflow follow-up

- Aplicar después de archivar `add-score-tab-editor`; al archivar, comprobar que el requisito del tresillo de esa capacidad y el selector de subdivisiones de esta no se contradicen.
- Probar la selección por arrastre y el diálogo en un iPhone real antes de archivar.
