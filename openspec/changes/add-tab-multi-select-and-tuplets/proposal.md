# Proposal

## Why

Para cambiar varias notas a la vez solo existe Mayús + clic o Mayús + flechas, que en táctil no se puede usar, y el tresillo actual es un interruptor por pulso que acorta la nota y deja el compás descuadrado. No hay forma de escribir un tresillo como en Guitar Pro —partir el pulso en tres huecos iguales y escribir las tres notas— ni de elegir quintillos, seisillos ni otras subdivisiones.

## What Changes

- **Seleccionar un tramo arrastrando.** Pulsar sobre la pauta y arrastrar en horizontal marca todos los pulsos intermedios, con ratón o con el dedo; el tramo se resalta mientras se arrastra y Mayús + clic o flechas sigue funcionando. En táctil, el arrastre vertical sigue desplazando la página.
- **Selector de subdivisión.** El grupo Ritmo abre un selector con tresillo, quintillo, seisillo, septillo, nonillo, decimillo y doceavo (3, 5, 6, 7, 9, 10 y 12).
- Al elegir una subdivisión, **cada pulso seleccionado se parte en N huecos iguales sin cambiar la suma del compás**: el contenido actual queda en el primer hueco, los demás nacen como silencios y el cursor se coloca en el primero para escribir las N notas seguidas.
- Si ya hay notas escritas, **seleccionar exactamente N pulsos los agrupa en una sola subdivisión**, una nota por hueco, y el tiempo liberado se añade como silencio al final del compás. Seleccionar tres notas y elegir tresillo forma un tresillo, no tres tresillos.
- El modelo del pulso guarda el número de subdivisión (3, 5, 6, 7, 9, 10 o 12) y AlphaTex lo dibuja y lo reproduce con `{tu n}`. Los tresillos ya guardados siguen abriéndose.
- En las subdivisiones de 7 y 9 el reparto en ticks no es entero; el compás tolera esa diferencia de redondeo y no se marca como incompleto.
- **Fuera de alcance:** subdividir un pulso que ya está subdividido (subdivisiones anidadas), proporciones n:m personalizadas, agrupar notas ya escritas bajo un mismo corchete y quitar o convertir un grupo creado (se deshace).

## Capabilities

### New Capabilities

- `tab-score-range-editing`: marcar un tramo de pulsos arrastrando sobre la pauta y dividir los pulsos seleccionados en subdivisiones irregulares —tresillo, quintillo, seisillo, septillo, nonillo, decimillo y doceavo— conservando la duración total del compás.

### Modified Capabilities

Ninguna. Depende de que `add-score-tab-editor` esté archivado; cuando lo esté, el selector de subdivisiones sustituye al botón de tresillo de esa capacidad.

## Impact

- **Código:** `src/types/tab-score.ts` (el campo `tuplet`), `src/utils/tab-score/ticks.ts`, `model.ts`, `operations.ts`, `alphatex.ts`, `palette.ts`, `TabScoreEditor.tsx`, `TabScoreCanvas.tsx` y un diálogo nuevo de subdivisiones.
- **Datos:** el número de subdivisión se guarda en el pulso; sin subir `version`, los datos antiguos con `tuplet: 3` se siguen leyendo.
- **Textos:** cadenas nuevas en `tabPalette`, `tabScore` y `tabTutorial` de `es.ts`, `en.ts` y `dictionary.ts`.
- **Tests:** normalización de las siete subdivisiones, cálculo de ticks, división del pulso, tolerancia del compás, AlphaTex y paleta; recorrido en navegador con ratón y a 375 px.
