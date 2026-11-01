# Proposal

## Why

El editor de tablatura actual es una rejilla cuerda × columna: una nota ocupa una celda y su duración es implícita. No hay duraciones, silencios, ligaduras, compás ni tempo, así que no se puede escribir una canción tal como suena ni leerla como se lee en un editor de tablaturas de verdad. El vídeo de referencia (Songsterr) muestra lo que se espera: tablatura con su ritmo dibujado, notas que se seleccionan con un clic y se cambian tecleando el traste, una paleta flotante con duraciones y técnicas, compases que se avisan cuando no cuadran con su compás, y reproducción con sonido.

Además, la reproducción con audio se retiró en el refactor de capas y hoy solo hay un cursor visual, de modo que no se puede oír lo que se escribe.

## What Changes

- **Nuevo modelo de tablatura por compases y pulsos.** Una tab es una lista de compases, cada uno con su compás (por defecto 4/4) y una lista de pulsos con duración (de redonda a semifusa, con puntillo y tresillo), silencios, notas por cuerda, ligaduras y técnicas. Sustituye a la rejilla de columnas.
- **Dibujo de partitura con alphaTab.** La tab se dibuja con tablatura, ritmo bajo las cuerdas, números de compás y marca de tempo; se puede añadir la notación estándar. Los compases se reparten en sistemas sin scroll horizontal.
- **Edición como en el vídeo.**
  - Clic o toque en una nota o en un pulso lo selecciona y lo resalta; las flechas lo mueven; Mayús amplía la selección.
  - Teclear dígitos escribe el traste; sobre un silencio lo convierte en nota.
  - Una **paleta flotante** junto a la selección ofrece duraciones, silencio, ligadura, técnicas y acciones de compás, muestra lo que ya está activo y explica por qué una opción no está disponible.
  - Compases: añadir, insertar, duplicar y borrar; compás y tempo por compás. Un compás cuyos pulsos no suman su compás se marca, pero sigue siendo editable y guardable.
  - **Deshacer y rehacer**, y **copiar, cortar, pegar y borrar** nota, pulso o compás.
  - **Dividir un pulso** en dos de la mitad de duración para crear un hueco nuevo dentro de un compás lleno, sin tener que borrar ni rehacer el compás.
- **Menú por iconos con descripción.** La paleta muestra cada opción como un icono; al pasar el cursor o al enfocar con el teclado aparece su nombre, su atajo y el motivo por el que no está disponible, y en táctil la descripción queda visible en la propia hoja.
- **Tutorial del editor.** Un botón de ayuda abre una guía breve de cómo añadir notas, cambiar la duración, moverse, usar los gestos y los atajos.
- **Técnicas:** las que ya existen (ligado, deslizamiento, bend, vibrato, palm mute, let ring, tapping, armónicos, nota muerta, trémolo, trino, slap y pop) más **nota fantasma** y **acento** (normal y fuerte).
- **Reproducción con sonido** con el SoundFont de alphaTab, cargado bajo demanda: desde el principio o desde la selección, con cursor, tempo ajustable y vista previa de la nota al escribirla.
- **Migración sin pérdida.** Las tabs de rejilla existentes se abren como partitura conservando cuerda, traste, posición y técnicas de cada nota. Los licks con solo texto antiguo siguen mostrándose como texto.
- **Accesible sin ratón:** todo es operable con teclado, el estado de la selección se anuncia a lectores de pantalla y en móvil la paleta pasa a una hoja inferior con un teclado de trastes.

Fuera del alcance (se cubre en `add-score-tab-notation-extras`): dinámicas, crescendo, repeticiones y finales, secciones, texto, diagramas de acorde, púa arriba/abajo, rasgueo, apoyaturas y calderón.

Fuera del alcance de ambos cambios: varias pistas o voces, letra, cambio de armadura, palanca de vibrato, importar o exportar Guitar Pro (ya existe un visor de adjuntos aparte) y edición colaborativa.

## Capabilities

### New Capabilities

- `tab-score-editor`: modelo de tablatura por compases y pulsos, su dibujo, la selección y edición de notas, duraciones, silencios, ligaduras, compases, técnicas, deshacer y portapapeles, la reproducción con sonido, la migración de las tabs de rejilla, la accesibilidad y el comportamiento en pantallas pequeñas.

### Modified Capabilities

- `repertoire-song-editor`: se retiran los requisitos del editor de rejilla (rejilla de celdas, resolución y número de compases, ajuste en sistemas, técnicas sobre celdas y su dibujo, carga de tabs antiguas y marco en pantallas pequeñas), que pasan a `tab-score-editor`.
- `licks-library`: la tablatura de un lick deja de describirse como texto plano; es una partitura, y el texto antiguo se conserva solo como respaldo de lectura.

## Impact

- **Código nuevo:** `src/utils/tab-score/` (modelo, operaciones, historial, portapapeles, validación de compases, migración y generación de AlphaTex), `src/components/tab-score/` (vista, editor, paleta, barra de reproducción), `src/hooks/useTabScoreEditor.ts` y `src/services/tab-score-player.ts` (alphaTab, SoundFont).
- **Código reemplazado:** `TabEditor`, `TabView`, `TabTechniquePicker`, `TabPlaybackBar`, `useTabEditorSelection` y `useTabPlayback`, junto con la parte de rejilla de `src/utils/repertoire-tab.ts`, tras actualizar sus puntos de uso: `LickEditorModal`, `LickCard`, `LickTab`, `licks/[id]/page.tsx`, `PracticeSession`, `RepertoireSongForm`, `RepertoireSongEditor` y `useRepertoireSongDraft`.
- **Datos:** campo nuevo `score` junto al `tab` existente en licks y en ítems de repertorio; `tab` queda intacto como copia de seguridad de solo lectura durante una versión. No cambia el contrato con la app iOS, que trata los licks como JSON opaco.
- **Dependencias y recursos:** `@coderline/alphatab` ya está instalado (v1.8.4); se vuelve a servir `public/alphatab/soundfont/sonivox.sf2` (~1,3 MB, Apache-2.0) cargado solo al reproducir.
- **Tests:** nuevos para modelo, operaciones, historial, portapapeles, validación, AlphaTex y migración; `tests/repertoire-tab.test.mjs` y `tests/tab-playback.test.mjs` se reducen a lo que sobrevive.
- **Riesgo principal:** alphaTab dibuja pero no edita; la selección y la paleta son una capa propia sobre sus coordenadas (ver `design.md`).
