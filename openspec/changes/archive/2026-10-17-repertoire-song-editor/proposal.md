# Proposal

## Why

Crear una canción del repertorio se hace hoy en un formulario incrustado en la lista, que solo guarda datos básicos. No hay forma de anotar la armonía de la canción (qué acorde va en cada palabra) ni de escribir la música sin recurrir a texto. Eso obliga a salir de la app para lo más útil: entender y estudiar la canción.

## What Changes

- Mover el alta de repertorio a una **página propia** (`/repertoire/new`) a la que se navega desde un botón **Añadir nuevo elemento**. El formulario incrustado desaparece de la lista.
- Añadir a la ficha de la canción una **letra con acordes**: se edita como un único texto y se ancla un acorde en cualquier posición de la línea (entre palabras, a mitad de palabra, al final…).
- Añadir un **selector visual de acordes**: un mástil en vertical que solo dibuja los trastes usados más 1 o 2 de contexto, con una librería de acordes y la forma editable traste a traste.
- Añadir un **editor de tablatura real**: una rejilla de cuerdas por tiempos (no texto) donde se colocan las notas con el ratón y el teclado, usando la afinación de la canción.

## Capabilities

### New Capabilities

- `repertoire-song-editor`: edición musical de una canción del repertorio en el navegador: alta en página propia, letra con acordes, selector de acordes sobre el mástil y editor visual de tablatura.

### Modified Capabilities

- Ninguna. `RepertoireItem` gana los campos opcionales `chordChart` y `tab` sin cambiar el formato persistido.

## Impact

- `src/types/practice.ts`: tipos `ChordShape`, `RepertoireChord`, `RepertoireChordChart`, `RepertoireTab`; campos nuevos en `RepertoireItem`.
- Librerías puras nuevas: `src/lib/chords.ts`, `src/lib/repertoire-chord-chart.ts`, `src/lib/repertoire-tab.ts` (con pruebas).
- Componentes nuevos: `FretboardDiagram`, `ChordPicker`, `ChordChartEditor`, `TabEditor`, `RepertoireSongForm`, `RepertoireSongEditor`.
- Rutas: nueva `src/app/(workspace)/repertoire/new/page.tsx`; el detalle `[id]` reutiliza el editor.
- `RepertoireView` cambia el formulario por el botón de alta; se elimina `RepertoireItemForm`.

## Notes

Los datos viajan como JSON (local y Supabase), así que los campos nuevos se persisten sin migración y las canciones antiguas siguen funcionando con una letra y una tablatura vacías.
