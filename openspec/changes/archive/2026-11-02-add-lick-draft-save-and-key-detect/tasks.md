# Tasks

## 1. Guardado de tablatura

- [x] 1.1 Extraer en `LickEditor` un `buildLick({ strict })` que comparta la construcción del lick entre el guardado completo y el de tablatura, con título provisional `licks.untitled` e ignorando un BPM inválido sin borrar el existente. Verificar con `npm run typecheck` y el recorrido de guardar un lick sin título.
- [x] 1.2 Añadir a `LickEditorPage` el guardado de borrador sin navegar y el estado `draftId` en el editor para que los guardados siguientes actualicen el mismo lick. Verificar en el navegador creando un lick nuevo, guardando dos veces y comprobando que la biblioteca tiene un solo registro.
- [x] 1.3 Añadir el botón **Guardar tablatura** en la cabecera de la tablatura, el aviso «Tablatura guardada» y las cadenas en `es.ts`, `en.ts` y `dictionary.ts`. Verificar con `node --test tests/i18n.test.mjs` y en el navegador que el foco y la selección no se pierden.
- [x] 1.4 Documentar en `docs/licks.md` el guardado de tablatura, el título provisional y la diferencia con Guardar lick. Verificar que el documento coincide con 1.1 y 1.2.

## 2. Tonalidad desde la partitura

- [x] 2.1 Exportar `tuningToMidi(tuning, stringCount)` desde `alphatex.ts` reutilizando la tabla de afinaciones estándar. Verificar con un test de afinación estándar, DADGAD y una afinación inválida.
- [x] 2.2 Extraer `estimateKey` de `detectTabKey` y añadir `detectScoreKey(score)` que aplane las notas de la partitura, ignore las muertas y use la afinación. Verificar en `tests/licks-key-detection.test.mjs` con una frase en La menor, una afinación alternativa, notas muertas y menos de tres notas o clases.
- [x] 2.3 Usar `detectScoreKey(score)` en `LickEditor` para que la detección siga a la partitura que se edita. Verificar en el navegador escribiendo una frase y viendo «Detectada» sin tablatura antigua.
- [x] 2.4 Mantener el automático: aplicar la tonalidad detectada mientras `keyIsAuto`, desactivarlo al elegir a mano y reactivarlo con «Usar esta tonalidad». Verificar en el navegador escribiendo, eligiendo una tonalidad y volviendo al automático.
- [x] 2.5 Actualizar `docs/licks.md` con la detección desde la partitura y el automático. Verificar que cada afirmación coincide con 2.2 y 2.4.

## 3. Verificación final

- [x] 3.1 Ejecutar `npm run typecheck`, `npm test` y `npm run build`; verificar que los tres terminan sin fallos nuevos.
- [x] 3.2 Recorrer en el navegador a 1440 y 375 px: crear una tablatura sin título ni BPM, guardarla, seguir editando, guardar otra vez, comprobar un solo lick en la biblioteca, abrirlo, ver la tonalidad detectada y aplicar el guardado completo. Anotar el resultado.


- Recorrido en navegador (2 nov 2026): un lick nuevo sin título ni BPM se guarda como «Sin título», el editor sigue en /licks/new, dos guardados seguidos dejan un solo lick y «Guardar lick» completa el mismo registro; la tonalidad pasa a Am al escribir la frase, elegir C a mano la fija y «Usar esta tonalidad» vuelve a Am; probado a 375 px sin desbordamiento.

## Workflow follow-up

- Archivar después de `fix-tab-editor-interactions`, que modifica la partitura y el editor.
