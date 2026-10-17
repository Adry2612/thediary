# Design

## Context

Ver `proposal.md` para la motivación. El estado que condiciona el enfoque:

- La letra se pinta como una rejilla monoespaciada **por línea lógica**, con `overflow-x-auto`; cada carácter es un punto de anclaje y `RepertoireChord.position` es el índice de carácter dentro de la línea.
- La caja del acorde es un `SelectField` plano con las 55 formas de un mapa estático (`src/lib/chords.ts`) más un nombre en un campo de texto aparte.
- El anclaje se mantiene al editar la letra alineando por subsecuencia común (ya resuelto en el cambio archivado).
- Los datos viajan como un **único documento JSON por usuario** (`PersistedPracticeState` en `practice_data`) y se fusionan por `id` en `mergePracticeData`. Añadir campos opcionales no necesita migración.

Restricción central: la alineación acorde↔carácter exige mantener la retícula monoespaciada aunque la línea se parta.

## Goals / Non-Goals

**Goals:**

- Envolver la letra por palabra conservando la alineación exacta con los acordes.
- Caja con nombre editable como fuente de verdad y selectores estructurados (nota + tipo).
- Disponer de una forma para toda combinación de nota y tipo del vocabulario.
- Acordes propios por usuario, reutilizables y sincronizados, sin migración.

**Non-Goals:**

- No cambia el modelo persistido de `RepertoireChordChart`: la envoltura es de vista.
- No se interpreta armonía avanzada (tonalidad, cifrado funcional, enarmonía dependiente del contexto).
- No se cubren acordes fuera del vocabulario salvo como nombre/forma libres o personalizados.
- No se añade una tabla nueva en Supabase ni se migra nada.

## Decisions

### La envoltura es de vista, no de modelo

`RepertoireChordChart` sigue guardando líneas con posiciones absolutas. Se añade una función pura `wrapLyricLine(line, columns) -> filas`, que reparte la línea en filas visuales cortando por palabra y traduce cada posición absoluta a (fila, columna). *Alternativa descartada:* persistir las filas envueltas, porque duplicaría el modelo y rompería el reanclaje por contenido que ya funciona.

### El ancho en columnas se mide del contenedor

El número de columnas de cada fila sale de medir el contenedor (un `ResizeObserver` y una anchura de columna conocida), no de breakpoints fijos. La función pura recibe `columns` como parámetro, así que la medición es un adaptador fino y el algoritmo queda total y testeable. *Alternativa descartada:* columnas fijas por tamaño de pantalla, que dejan huecos y cortan de forma rara en pantallas anchas.

### Corte por palabra con casos límite explícitos

- Una palabra más larga que la fila se parte por carácter.
- Un acorde anclado en un espacio que el salto consume se pega al final de la fila anterior.
- Una etiqueta de acorde que no cabe al final de la fila cae al principio de la siguiente, sin cambiar su anclaje (misma invariante que el empuje actual).
- Líneas en blanco consecutivas se colapsan en un único salto de estrofa.

### El nombre editable es la fuente de verdad

`parseChordName(name) -> { root, type } | null` sobre un vocabulario acotado (12 fundamentales × 7 tipos). Si el nombre se descompone, los selectores y la forma se derivan de él; si no, los selectores quedan vacíos y el nombre se respeta como texto libre. *Alternativa descartada:* que los selectores sean la fuente de verdad, porque no dan cabida a lo personalizado.

### Identidad frente a grafía

`Db` y `C#` son el mismo acorde en el mástil —misma forma— pero no la misma grafía, y la grafía la dicta la tonalidad (`Db` en Fa menor, `C#` en Do# menor). Se separa la **clave de identidad** (clase de altura + tipo) del **nombre mostrado**: la identidad manda en la forma, el generador, la prioridad y los duplicados; el nombre conserva lo que escribió el usuario. Como la clave de identidad hace falta igualmente para dar forma a `Db7`, respetar la grafía no cuesta nada. El selector de Nota muestra los enarmónicos donde existen (`C#/Db`, `D#/Eb`, `F#/Gb`, `G#/Ab`, `A#/Bb`). *Alternativa descartada:* reescribir el nombre a la grafía canónica de la librería, correcto en física pero ajeno a la tonalidad y una sorpresa para quien escribe.

### Tres fuentes de forma con prioridad

`resolveChordShape(name, saved)`: guardado → librería → generado. El generador usa formas movibles por tipo (raíz en la 6ª o la 5ª cuerda), eligiendo la posición más cómoda. La forma resuelta se guarda en `chord.shape` (campo que ya existe), de modo que queda congelada aunque el generador cambie. *Alternativa descartada:* solo librería (deja 29 combinaciones sin forma).

### Los acordes del usuario viven en el documento por usuario

Campo nuevo `customChords` en `PersistedPracticeState` (`UserChord = { id, name, shape }`), fusionado por `id` en `mergePracticeData` y expuesto con acciones propias en el store. *Alternativa descartada:* una tabla de Supabase dedicada, que añadiría RLS, una migración y un segundo camino de sincronización para un dato que ya viaja con el usuario.

### Grupos en `SelectField`

Se extiende la primitiva con opciones agrupadas: una cabecera no seleccionable que el teclado salta. *Alternativas descartadas:* un componente de lista nuevo (duplica la primitiva) o listar los personalizados fuera del selector (contradice la petición de tenerlos "en el mismo selector").

## Risks / Trade-offs

- [Medir el ancho en el cliente] → primera pintura sin medición: se usa un número conservador y se reajusta en cuanto el `ResizeObserver` responde; el editor ya es de cliente.
- [Palabra que no cabe en una fila] → se parte por carácter; es el único corte posible en monoespaciado.
- [Vocabulario del parser acotado] → los nombres fuera de él no mueven los selectores; se cubren como personalizados.
- [Formas generadas poco idiomáticas] → la librería tiene prioridad y la forma es editable y se guarda con el acorde.
- [Fusión por `id` sin borrado] → un acorde guardado borrado podría reaparecer si el remoto aún lo tiene, igual que ocurre hoy con el repertorio; se acepta por ahora.
- [Sombreado de la librería] → tu acorde con el mismo nombre gana; la etiqueta "personalizado" lo hace visible en vez de silencioso.

## Migration Plan

1. Modelo y lógica pura: `UserChord`, `customChords`, envoltura de la letra, parser, generador y resolución por prioridad (con pruebas).
2. Envoltura en `ChordChartEditor`.
3. Caja nueva en `ChordPicker` y grupos en `SelectField`.
4. Acordes del usuario: store, sincronización y grupo en el selector.

Rollback: los campos nuevos se ignoran y la app vuelve al comportamiento anterior; no hay migración que deshacer.
