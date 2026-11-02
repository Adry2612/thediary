# Design

## Context

Ver `proposal.md` para el porqué. El estado actual que condiciona el diseño:

- `TabBeat` (`src/types/tab-score.ts`) tiene `rest: boolean` y `notes: TabNote[]`.
- `normalizeBeat` (`src/utils/tab-score/model.ts`) fuerza `rest = value.rest === true || notes.length === 0`, así que un pulso sin notas no puede ser otra cosa que un silencio.
- `deleteNote` (`src/utils/tab-score/operations.ts`) pone `rest: notes.length === 0`; `divideOneBeat` rellena los huecos nuevos con `createRestBeat`; `groupBeats` coge `positions.slice(0, tuplet)` y añade silencios al final del compás.
- `renderContent` (`src/utils/tab-score/alphatex.ts`) dibuja `r` cuando `rest` o cuando no hay tokens.
- `getSelectedNotes` (`src/utils/tab-score/selection.ts`) distingue arrastre horizontal y diagonal; el lienzo pinta una caja por nota y el `hitTest` pega la pulsación a la nota más cercana dentro de 12 px.
- `moveSelection` usa `up → string − 1`, pero el lienzo dibuja `string 0` abajo (`y = (stringCount − 1 − string) · altoFila`), de ahí la inversión.
- El requisito base de `tab-score-editor` y `tab-score-range-editing` vive aún en los cambios `add-score-tab-editor` y `add-tab-multi-select-and-tuplets`, sin archivar. Este cambio se aplica y archiva después de ellos.

## Goals / Non-Goals

**Goals:**

- Distinguir pulso vacío de silencio en modelo, dibujo, texto, anuncio y reproducción, sin romper datos antiguos.
- Hacer que una subdivisión no toque ni un pulso más de los seleccionados.
- Corregir la dirección de las flechas verticales y el texto que la describe.
- Un solo rectángulo verde para el tramo seleccionado y selección de nota solo por impacto exacto.

**Non-Goals:**

- Subdivisiones anidadas, proporciones n:m libres o convertir/quitar un grupo ya creado.
- Cambiar el reparto de ticks, la tolerancia de compases subdivisionados o el modelo de técnicas.
- Rehacer la paleta o el tutorial más allá de las cadenas afectadas.
- Notación avanzada de `add-score-tab-notation-extras`.

## Decisions

### 1. El pulso vacío es un estado explícito, no una inferencia

Se añade `empty?: true` a `TabBeat`. Reglas de normalización:

- `rest: true` → silencio, con `notes: []` y sin `empty`.
- `empty: true` y sin notas → vacío.
- notas no vacías → pulso con notas, sin `rest` ni `empty`.
- sin notas y sin ninguna de las dos marcas → **silencio**, para que los datos guardados por versiones anteriores no cambien de significado.

Un pulso vacío conserva `duration`, `dots` y `tuplet`, así que sigue ocupando su tiempo y el compás no se marca como incompleto. Se dibuja con `()` en AlphaTex y no produce sonido.

El importador de alphaTab no conserva el pulso vacío: `()` llega como un silencio con `isRest`. Para que no se dibuje la figura, el lienzo ya no llama a `api.tex` directamente: importa el AlphaTex, marca los pulsos vacíos con `isEmpty` y pone transparente el color de `GuitarTabRests`/`StandardNotationRests` antes de `api.renderScore`. El hueco sigue ocupando su ancho y su tiempo; solo desaparece la figura. Lo cubre `tests/tab-score-render.test.mjs`.

Alternativa descartada: inferir vacío desde `notes.length === 0`. Convertiría silencios antiguos en vacíos de forma invisible y rompería la compatibilidad. Alternativa descartada: sustituir `rest` por un `kind` de tres valores; obliga a migrar todos los datos y todos los consumidores para ganar claridad que el marcador opcional ya da.

### 2. Borrar la última nota deja el pulso vacío; el silencio es una acción

`deleteNote` pone `empty: true`, `rest: false` y `notes: []` cuando no quedan notas. Si quedan notas en el pulso, solo quita la nota. `deleteBeat` no cambia: sigue eliminando el pulso y marcando el compás si deja de sumar.

La opción **Silencio** de la paleta pasa a ser un interruptor: si todos los pulsos seleccionados son silencios, la desactiva y los deja vacíos; si no, los convierte en silencios. `getPaletteState` ya calcula el estado activo con `beats.every(beat => beat.rest === true)`, así que solo hay que añadir la operación inversa (`clearRest`) y su cadena.

Alternativa descartada: una acción nueva «Vaciar» separada de «Silencio». Añade una opción a la paleta para un gesto que el interruptor ya expresa.

### 3. Los huecos de una subdivisión nacen vacíos

- `divideOneBeat` crea los N − 1 huecos con `createEmptyBeat(duration)` en vez de `createRestBeat`, y copia `tuplet`. El contenido actual se queda en el primero.
- `groupBeats` exige `positions.length === tuplet`; con más o menos devuelve un motivo nuevo (`tupletExactCount`) que la paleta traduce como «selecciona exactamente N pulsos». Desaparece el `slice(0, tuplet)`.
- El tiempo liberado se escribe con `createEmptyBeats(freed)` al final del compás, no con silencios. Si no se puede representar con las figuras disponibles, se mantiene el rechazo `cannotSubdivide`.
- El compás conserva su suma porque los huecos vacíos siguen aportando ticks.
- Al agrupar notas ya escritas, la selección pasa al pulso siguiente al grupo (o al primer hueco liberado si el grupo acaba el compás), nunca al primero del grupo: así seguir escribiendo no sobrescribe ni amplía el tresillo. Al dividir un solo pulso, en cambio, se queda en el primer hueco para escribir las N notas.
- Si las N notas tienen figuras distintas y el tiempo liberado no se puede escribir con las figuras disponibles, todas pasan a la figura más corta del grupo; así el hueco liberado es siempre un múltiplo exacto de esa figura y el compás conserva su total.

Alternativa descartada: no añadir nada y dejar el compás corto. Contradice el requisito de que el compás mantenga su total y obliga a rellenarlo a mano. Alternativa descartada: seguir añadiendo silencios. Es exactamente lo que el usuario no quiere.

### 4. La selección es un tramo, no una lista de notas

- `getSelectedNotes` devuelve todas las notas de los pulsos del tramo, sin distinguir horizontal y diagonal. El ancla y el foco siguen fijando el pulso y la cuerda del cursor, pero no recortan las notas seleccionadas.
- El lienzo dibuja un único bloque desde `x` del primer pulso hasta el borde derecho del último, con la altura completa de la pauta (`bar.y` a `bar.y + bar.h`), relleno verde y borde. El foco de una nota suelta conserva su caja con borde.
- `hitTest` deja de pegar a 12 px: una nota solo cuenta si el punto cae dentro de su caja (`x` e `y` dentro). Fuera de una nota, se usa la fila y el punto pulsados, y se conserva el `selectAt` con fracción para escribir en cualquier punto.
- Un clic sin arrastre sigue seleccionando un solo pulso; el bloque verde cubre la columna de ese pulso a toda altura.
- Pulsar o abrir el menú de una nota **dentro** del tramo ya marcado no colapsa la selección: el tramo se conserva para que la subdivisión siga viendo las N notas. Para colapsar a una nota se pulsa fuera del tramo (o se limpia con Escape).

Alternativa descartada: mantener el imán y ampliar solo el color. El imán es justamente lo que hace que «se coja» una nota sin pulsarla, y el recorte por cuerdas impide ver el tramo completo.

### 5. Flechas verticales según la pauta

En `moveSelection`, `up` suma 1 al índice de cuerda y `down` resta 1. La cuerda 0 (la más grave) se dibuja abajo, así que subir en pantalla es sumar índice. Se actualizan la ayuda del tutorial y `docs/tab-score.md`.

Alternativa descartada: invertir el dibujo. Cambiar el orden de las cuerdas en el modelo rompe AlphaTex, la migración y todos los tabs guardados.

## Risks / Trade-offs

- **[AlphaTab convierte `()` en silencio]** → confirmado con el importador: el lienzo marca los pulsos vacíos y oculta su figura con el color de las rests antes de dibujar; el test de `render.ts` cubre las posiciones y el color transparente.
- **[Datos antiguos con `notes: []` sin `rest`]** → la normalización los trata como silencio, no como vacío; el test de migración cubre un tab anterior y un tab nuevo con pulso vacío.
- **[La selección de todas las notas del tramo aplica técnicas a más notas que antes]** → las acciones de la paleta ya trabajan sobre pulsos; se documenta que un arrastre marca el tramo completo y que la nota suelta se selecciona con un clic exacto.
- **[El compás sigue «exacto» al borrar una nota]** → es intencionado: el hueco ocupa su tiempo. El usuario ve que no hay figura, y el texto y el anuncio dicen «vacío».
- **[Dependencia de cambios sin archivar]** → `openspec archive` rechaza esta delta mientras no existan las specs principales; el follow-up de `tasks.md` obliga a archivar antes `add-score-tab-editor` y `add-tab-multi-select-and-tuplets`.

## Migration Plan

1. Añadir `empty` al tipo y a la normalización manteniendo la inferencia antigua como respaldo.
2. Desplegar el editor nuevo; los tabs guardados se leen igual y solo cambian al editarlos.
3. Rollback: una versión anterior ignora `empty` y vuelve a leer los pulsos sin notas como silencios; no se pierde contenido, solo se recupera el dibujo antiguo.
4. No se sube `version` del formato.

## Open Questions

Ninguna. El importador de AlphaTex convierte `()` en silencio; se resolvió marcando el pulso vacío y ocultando su figura antes de dibujar.
