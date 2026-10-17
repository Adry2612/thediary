# Tasks

## 1. Modelo y lógica pura

- [x] 1.1 Añadir a los tipos `ChordShape`, `RepertoireChord`, `RepertoireLyricLine`, `RepertoireChordChart`, `RepertoireTabNote` y `RepertoireTab`; ampliar `RepertoireItem`.
- [x] 1.2 Crear `chords.ts` con librería de acordes, normalización, ventana de trastes, edición de la forma y lectura de afinación; cubrir con pruebas.
- [x] 1.3 Crear `repertoire-chord-chart.ts` con carga de letra, reanclaje por contenido (subsecuencia común), asignación y borrado de acordes; cubrir con pruebas.
- [x] 1.4 Crear `repertoire-tab.ts` con creación, normalización, notas, compases y resolución; cubrir con pruebas.
- [x] 1.5 Aceptar `chordChart` y `tab` al crear un elemento del repertorio.

## 2. Componentes del editor

- [x] 2.1 `FretboardDiagram`: mástil vertical con ventana de trastes, marcadores de al aire/muteada y modo interactivo.
- [x] 2.2 `ChordPicker`: librería de acordes, nombre editable y mástil interactivo, con asignar y quitar.
- [x] 2.3 `ChordChartEditor`: letra como un único texto editable y vista en rejilla monoespaciada donde cada carácter es un punto de anclaje para los acordes.
- [x] 2.4 `TabEditor`: rejilla de cuerdas por tiempos con ratón y teclado, compases, resolución y campo de traste.

## 3. Página de alta y detalle

- [x] 3.1 `RepertoireSongForm` reúne los datos de la ficha con la letra y la tablatura.
- [x] 3.2 Nueva página `/repertoire/new` y botón "Añadir nuevo elemento" en la lista; retirar el formulario incrustado.
- [x] 3.3 `RepertoireSongEditor` añade la letra y la tablatura al detalle de la canción.

## 4. Idiomas y verificación

- [x] 4.1 Añadir todas las etiquetas nuevas en español e inglés.
- [x] 4.2 Ejecutar `npm run typecheck`, `npm test` y `npm run build`.
