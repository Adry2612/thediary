# Design

## Context

`RepertoireItem` es un objeto plano que se persiste tal cual (localStorage + Supabase como JSON), así que se pueden añadir campos opcionales sin migrar. La lista de repertorio usaba un formulario inline y el detalle renderiza `RepertoireItemCard`. Las "tabs" existentes eran solo un recurso de texto.

## Goals / Non-Goals

**Goals:**

- Alta de canción en su propia página, con todo lo necesario en un solo flujo.
- Anotar la armonía sobre la letra de forma visual, sin escribir sintaxis.
- Ver y editar acordes sobre un mástil vertical recortado a los trastes usados.
- Escribir una tablatura clicando celdas, no escribiendo ASCII.

**Non-Goals:**

- No hay reproducción de audio de la tablatura ni del metrónomo dentro del editor.
- No hay detección automática de acordes a partir del audio.
- No se importan/exportan formatos Guitar Pro o MusicXML.
- El editor no interpreta el ritmo más allá de la columna (posición) de cada nota.

## Decisions

### Letra como un único texto con acordes anclados a una posición

`RepertoireChordChart` guarda líneas (`{ id, text, chords }`) y cada acorde guarda la posición de carácter dentro de la línea, entendida como "justo antes del carácter `position`". La UI muestra la letra **como un solo bloque** con un botón para alternar a un **área de texto única** donde se edita toda la letra de golpe, y en la vista cada carácter (incluido el hueco posterior al último) es un punto de anclaje clicable en una rejilla monoespaciada, de modo que el acorde puede ir a principio, a mitad o al final de una palabra, o entre dos palabras. Los nombres se dibujan en una fila superior alineada por columnas; si dos acordes quedan muy juntos, el segundo se desplaza lo mínimo para no pisarse (el anclaje no cambia). Al editar la letra, cada línea se **alinea por subsecuencia común** con la versión anterior, de modo que los acordes se desplazan con el texto (al insertar o borrar antes, se reanclan a la palabra siguiente) y solo se descartan cuando su palabra se ha reescrito y no queda una tirada de caracteres alineados que confirme el anclaje.

### Mástil vertical recortado

`FretboardDiagram` dibuja un diagrama de acorde clásico (cejuela arriba, cuerdas verticales de la 6ª a la 1ª) con una ventana de trastes calculada: los trastes usados más `context` arriba/abajo, con un mínimo de 3 filas. Si hay cuerdas al aire, la ventana empieza en la cejuela; si no, muestra la etiqueta `Nfr`. Es la misma pieza para el selector (interactiva, clic en celda y en el marcador de al aire/muteada) y para mostrar acordes pequeños en la letra.

### Librería de acordes + forma editable

`src/lib/chords.ts` incluye ~55 acordes comunes en afinación estándar. Elegir uno de la librería rellena la forma; la forma se puede ajustar traste a traste sobre el propio mástil y se guarda junto al acorde (`shape`), de modo que un acorde raro o una posición concreta queda registrada tal cual.

### Tablatura como notas dispersas sobre una rejilla

`RepertoireTab` guarda `tuning`, `measures`, `subdivision` y una lista de notas `{ string, column, fret }`. La rejilla se deriva de esos parámetros y la afinación sale de la ficha de la canción (`parseTuningNotes`). Colocar una nota es escribir en una celda; se admiten teclado (dígitos con buffer, flechas, retroceso, enter) y campo de traste para móvil. Cambiar la resolución reescala las columnas para conservar el tiempo, y quitar compases descarta las notas que quedan fuera.

## Risks / Trade-offs

- [Cambiar el reparto de columnas] → `setTabSubdivision` reescala proporcionalmente y fusiona colisiones; el resultado puede necesitar un retoque manual.
- [Acordes anclados a una posición de carácter] → El reanclaje se apoya en la alineación por subsecuencia común de la línea: si se reescribe la palabra del acorde se pierde y hay que volver a colocarlo, y dos ediciones a la vez en la misma línea pueden dar un anclaje discutible. La comprobación exige una tirada contigua de caracteres alineados para no dejar acordes colgando en un texto nuevo.
- [Rejilla con muchas celdas] → El alto número de medidas se limita a 16 en la UI y la resolución por defecto es 16 columnas por compás.

## Migration Plan

1. Añadir los campos opcionales a `RepertoireItem` y las librerías puras (con pruebas).
2. Introducir la página de alta y sustituir el formulario inline por el botón.
3. Añadir el editor al detalle. Rollback: los campos nuevos se ignoran y la app vuelve al comportamiento anterior sin migración.
