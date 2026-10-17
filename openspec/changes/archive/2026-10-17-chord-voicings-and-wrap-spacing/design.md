# Design

## Context

Ver `proposal.md` para la motivación. El estado que condiciona el enfoque:

- `src/lib/repertoire-chord-layout.ts` ya envuelve la letra y devuelve filas visuales (`WrappedRow`) que solo distinguen fila normal de línea en blanco (`isBlank`); no sabe si una fila continúa la frase anterior.
- `ChordChartEditor` pinta todas las filas con el mismo hueco (`gap-1`) y las líneas en blanco como separadores.
- `src/lib/chords.ts` tiene formas movibles con la raíz en la 6ª y la 5ª cuerda, y el generador devuelve **una** forma; `resolveChordShape` aplica la prioridad guardado → librería → generado.
- `RepertoireChord.shape` guarda una única forma por acorde, así que elegir un voicing no necesita cambios de modelo.

## Goals / Non-Goals

**Goals:**

- Distinguir visualmente una continuación de una frase nueva o una estrofa.
- Ofrecer varias posiciones tocables por acorde y permitir elegir la que se guarda.

**Non-Goals:**

- No se cura a mano un conjunto de voicings por acorde más allá de las plantillas movibles.
- No se guardan varios voicings por acorde: solo la forma elegida.
- No se añade la forma con raíz en la 2ª cuerda (Do) por ahora.
- No cambia ni migra ningún dato persistido.

## Decisions

### Marcar la continuación en la fila

`WrappedRow` gana `isContinuation: boolean`, verdadero cuando la fila no es la primera de su línea lógica. *Alternativa descartada:* deducirlo en el componente comparando filas consecutivas, que se rompe al cruzar de una línea a otra.

### Hueco por tipo de fila

El componente sustituye el `gap` uniforme por un margen según la fila: continuación → mínimo, frase nueva → el hueco normal, estrofa → el separador que ya existe. El hueco entre bloques no toca el sitio del acorde (la fila de acordes va dentro de cada bloque). *Alternativa descartada:* un único hueco intermedio, que no distingue los tres casos que el usuario pidió.

### El generador devuelve candidatos

`getGeneratedChordVoicings(pitchClass, type)` devuelve una lista ordenada de formas: raíz en la 6ª cuerda (forma de Mi), en la 5ª (forma de La) y en la 4ª (forma de Re), ordenadas por el traste de la raíz y sin duplicados. `getChordVoicings(name, saved)` las combina con la prioridad guardado → librería → generado y elimina duplicados. *Alternativa descartada:* crear a mano varios voicings por acorde de la librería, que da mejores formas pero muchísimo más trabajo y no cubre las 84 combinaciones.

### Persistir solo la forma elegida

El voicing elegido se guarda en `RepertoireChord.shape`, que ya existe. El control de posición es puramente de la caja. *Alternativa descartada:* un array de formas por acorde, que complicaría el modelo sin que el usuario lo haya pedido.

### Control de posición compacto

La caja muestra un control anterior/siguiente con `posición k/n`, visible solo si hay más de un voicing. *Alternativa descartada:* un `SelectField` para las posiciones, que ocupa más y compite con los selectores de Nota y Tipo.

## Risks / Trade-offs

- [Formas de Re con la 5ª y la 6ª muteadas] → suenan más finas; son una opción más y el usuario elige.
- [Hueco de continuación demasiado apretado] → el acorde de la fila siguiente se acerca al texto anterior; se ajusta a ojo.
- [Voicings generados poco idiomáticos] → la librería y los acordes guardados van primero.
- [Orden por traste de la raíz] → posiciones altas pueden quedar lejos; se ordenan de cómoda a aguda y el usuario decide.

## Migration Plan

1. Lógica pura: `isContinuation` en la fila y `getGeneratedChordVoicings`/`getChordVoicings`, con pruebas.
2. Hueco por tipo de fila en `ChordChartEditor`.
3. Control de posición en `ChordPicker` y etiquetas nuevas.
4. Verificación: typecheck, pruebas, build y comprobación visual.

Sin migración: la forma elegida usa un campo que ya existe y las canciones antiguas se ven igual.
