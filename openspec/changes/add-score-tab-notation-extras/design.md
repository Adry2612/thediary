# Design

## Context

Ver `proposal.md` para la motivación y `add-score-tab-editor/design.md` para el modelo, la capa de edición, la paleta declarativa y la reproducción sobre las que se apoya este cambio. Se aplica después de aquel.

Estado heredado del cambio base:

- `TabScore` → `TabBar[]` → `TabBeat[]` → `TabNote[]`, con `version: 2`, normalización que descarta valores inválidos y conserva la nota, y operaciones puras que devuelven `{ score, selection } | { error }`.
- AlphaTex determinista generado por `buildAlphaTex`, con prueba de ida y vuelta contra el importador de alphaTab.
- La paleta se pinta desde un catálogo y desde `getPaletteState`, que explica por qué una opción no está disponible.
- Existe una biblioteca de acordes (`src/utils/chords.ts`, `customChords`) con formas y nombres.
- alphaTab entiende en AlphaTex las marcas que se necesitan: dinámicas (`dy`), reguladores (`cre`), repeticiones (`\ro`, `\rc n`, `\ae`), apoyaturas (`gr`), acordes (`\chord` + `ch`), púa (`bd`, `bu`), rasgueo, calderón y texto (`txt`).

## Goals / Non-Goals

**Goals:**

- Añadir las marcas sin cambiar `version` ni invalidar partituras guardadas.
- Reutilizar la mecánica del cambio base: operaciones puras, estado de paleta declarativo, mapeo a AlphaTex con prueba de ida y vuelta.
- Que la reproducción respete las marcas, no solo el dibujo.

**Non-Goals:**

- Voces, pistas, letra, armadura, palanca de vibrato, 8va, staccato, ritardando.
- Un modelo propio de reproducción: se delega en alphaTab.

## Decisions

### 1. Campos opcionales en el modelo existente

```ts
type TabBar = {
  /* …campos del cambio base… */
  section?: string;                         // ≤ 30 caracteres
  repeat?: { start?: true; end?: number };  // end = veces totales, 2..99
  endings?: number[];                       // pasadas en las que suena, p. ej. [1] o [2,3]
  pickup?: true;                            // solo en el primer compás
};
type TabBeat = {
  /* …campos del cambio base… */
  dynamic?: "pp" | "p" | "mp" | "mf" | "f" | "ff";
  hairpin?: "crescendo" | "decrescendo";    // marca cada pulso del regulador
  text?: string;                            // ≤ 40 caracteres
  chord?: string;                           // nombre de acorde
  stroke?: "down" | "up" | "rasgueado";
  fermata?: true;
  grace?: { fret: number; timing: "before" | "on" };  // sobre la primera nota del pulso
};
```

- El normalizador descarta valores no reconocidos y conserva el pulso y sus notas (mismo criterio que las técnicas), así que una partitura sin estos campos se abre idéntica y un cliente del cambio base que lea una partitura con estos campos los ignora.
- Un regulador es un conjunto de pulsos contiguos con el mismo `hairpin`; al borrar la marca de uno de ellos, el resto se mantiene. Se prefiere a guardar «inicio y fin» porque sobrevive sin reglas extra a insertar, borrar y pegar pulsos.
- `dynamic` se guarda en el pulso donde aparece y rige hasta el siguiente, como en una partitura.
- Un cierre de repetición sin apertura repite desde el primer compás, que es la convención de la notación y el comportamiento de alphaTab.

### 2. Mapeo a AlphaTex

| Marca | AlphaTex |
| --- | --- |
| `dynamic` | `{dy mf}` en el pulso |
| `hairpin` | `{cre}` / `{dec}` por pulso del regulador |
| `repeat.start` / `repeat.end` | `\ro` / `\rc n` en el compás |
| `endings` | `\ae (n …)` en el compás |
| `section` | `\section "texto"` en el compás |
| `text` | `{txt "texto"}` |
| `chord` | `\chord ("nombre" …)` en la cabecera si la biblioteca la conoce, y `{ch "nombre"}` en el pulso |
| `stroke` | `{bd}`, `{bu}` y `{rasg ii}` |
| `fermata` | `{fermata medium 0}` |
| `grace` | pulso de apoyatura previo `:32 2.6 {gr}` / `:32 2.6 {gr ob}` |
| `pickup` | `\ac` en el compás |

Todas las propiedades de un pulso van en un solo bloque `{…}`: el importador rechaza dos bloques seguidos. El calderón necesita tipo y longitud (`{fermata medium 0}`), no `{f}`. La tabla se verifica con la misma prueba de ida y vuelta del cambio base, una marca por vez; la tarea 3.2 ya confirmó estas sintaxis contra alphaTab 1.8.4.

### 3. Diagramas de acorde desde la biblioteca

Al generar AlphaTex, para cada nombre de acorde distinto de la partitura se busca en la biblioteca de acordes (la del usuario primero, después la integrada); si existe se emite su `\chord (...)` con los trastes por cuerda. Si no existe solo se emite el nombre. El nombre se guarda como texto libre: no se enlaza por id para que renombrar o borrar un acorde de la biblioteca no rompa la tab.

- Alternativa descartada: guardar la forma del acorde en la tab. Duplica datos que ya viven en la biblioteca y quedaría desactualizada.

### 4. Estado de paleta y razones

`getPaletteState` gana los grupos nuevos y sus razones de desactivación, con la misma forma que las del cambio base: `graceOnRest` («una apoyatura no se puede añadir a una nota vacía», el aviso que muestra el vídeo), `strokeNeedsChord` (púa con una sola nota), `endingOutsideRepeat`, `pickupNotFirstBar`. Las razones se prueban sin interfaz.

### 5. Entradas de texto

Texto del pulso, nombre de sección y nombre de acorde usan un diálogo pequeño de un campo con el contador de caracteres (`TextField` del sistema de campos existente), no un campo dentro de la paleta: la paleta se cierra con Escape y un campo de texto dentro pelearía con el teclado de la rejilla. El nombre de acorde ofrece los nombres de la biblioteca como sugerencias.

### 6. Repeticiones y reproducción

alphaTab ya expande repeticiones y finales al reproducir; el cursor sigue la reproducción real. El modelo no expande nada: los pulsos se guardan una sola vez. La velocidad, la reproducción desde la selección y el cursor siguen siendo los del cambio base.

### 7. Texto alternativo y anuncios

`scoreToText` y el texto de anuncio de la selección incluyen cada marca en palabras («compás 3, abre repetición», «pulso 2, mf, texto: let it ring»). Así las marcas no dependen de verlas.

## Risks / Trade-offs

- **Sintaxis de AlphaTex no verificada en algunos casos** (`dec`, rasgueo, sección, anacrusis) → La prueba de ida y vuelta por marca falla si el importador no la entiende; en ese caso la marca se descarta del dibujo o se cambia de forma antes de ofrecerla.
- **Reguladores como marca por pulso** → Dos reguladores contiguos del mismo tipo se leen como uno. Aceptado: en la notación real también se dibujarían juntos.
- **Compleja interacción de repeticiones y finales** → Se normalizan para evitar finales fuera de repetición; un final sin repetición se descarta al cargar y se explica en la paleta al editar.
- **Más opciones en la paleta** → Se agrupan por categoría y la hoja inferior táctil tiene desplazamiento propio; se comprueba en 375 px.
- **Dependencia de orden** → Si `add-score-tab-editor` cambia la forma del modelo, este cambio se rehace sobre la forma final. Se aplica solo cuando aquel está archivado.

## Migration Plan

No hay migración de datos. Los campos son opcionales; revertir el cambio deja los campos en el JSON sin efecto y las partituras siguen abriéndose.

## Open Questions

Ninguna que cambie las specs, el enfoque o el desglose de tareas. La sintaxis exacta de algunas marcas se fija en la tarea 3.2.
