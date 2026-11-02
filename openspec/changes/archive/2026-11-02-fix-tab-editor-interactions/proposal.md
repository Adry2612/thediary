# Proposal

## Why

El editor de tablatura ya permite escribir, seleccionar y subdividir, pero cuatro comportamientos se sienten mal y frenan el uso diario: borrar una nota la convierte en un silencio que el usuario no pidió, la subdivisión se aplica a pulsos que no estaban seleccionados, las flechas verticales mueven la selección al revés de lo que se ve y la selección se dibuja nota a nota en vez de sobre el tramo completo. Son fallos de interacción, no de alcance: la tablatura es el material desde el que se practica en los licks y en las partes del repertorio.

## What Changes

- **Borrar deja un hueco vacío, no un silencio.** Un pulso sin notas y sin marca de silencio ocupa su tiempo pero no dibuja figura de silencio, no se anuncia como silencio y no suena. El silencio solo aparece cuando se pide con la paleta. **BREAKING** para datos guardados que dependían de inferir el silencio al quedarse sin notas.
- **La subdivisión se aplica exactamente a las notas seleccionadas.** Con N notas seleccionadas y una subdivisión de N se agrupan esas N y ninguna más; con menos o más se rechaza con un motivo. Se elimina el «agrupa las primeras N» y el añadido automático de silencios al final del compás: el tiempo liberado queda como huecos vacíos.
- **Dividir un pulso sigue disponible** cuando hay un solo pulso seleccionado, pero los huecos nuevos nacen vacíos en lugar de silencios.
- **Las flechas verticales siguen la pauta.** `ArrowUp` mueve a la cuerda dibujada encima y `ArrowDown` a la de abajo.
- **La selección se ve como un tramo verde continuo.** El arrastre pinta un rectángulo verde a toda la altura de la tablatura entre el primer y el último pulso; una nota suelta solo se selecciona si el puntero cae dentro de su caja, sin imán de 12 px. Mayús + clic y Mayús + flechas siguen extendiendo el tramo.
- **Fuera de alcance:** cambiar el modelo de ticks, las técnicas, la reproducción o el formato AlphaTex más allá del pulso vacío `()`; rediseñar la paleta o el tutorial; tocar la notación avanzada de `add-score-tab-notation-extras`.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `tab-score-editor`: el pulso admite estar vacío además de ser nota o silencio; borrar la última nota deja el pulso vacío; dividir un pulso crea huecos vacíos; las flechas verticales recorren las cuerdas en el orden en que se dibujan.
- `tab-score-range-editing`: la selección se dibuja como un tramo continuo sobre la pauta y la subdivisión agrupa exactamente las notas seleccionadas, sin recortar la selección ni inventar silencios.

## Impact

- **Código:** `src/types/tab-score.ts`, `src/utils/tab-score/model.ts` (normalización del pulso vacío), `operations.ts` (`deleteNote`, `divideBeat`, `groupBeats`), `alphatex.ts` (`()` para el pulso vacío), `selection.ts` (sin imán y con tramo), `TabScoreCanvas.tsx` (rectángulo verde, hit test exacto), `TabScoreEditor.tsx` (flechas), `palette.ts` (motivos de rechazo), `text.ts` y `announce.ts` (texto del pulso vacío).
- **Datos:** sin subir `version`; los pulsos guardados con `rest: true` siguen siendo silencios y un pulso antiguo sin notas y sin marcas se sigue leyendo como silencio. El pulso vacío nuevo se guarda con `empty: true`.
- **Textos:** cadenas nuevas o corregidas en `tabScore`, `tabPalette` y `tabTutorial` de `es.ts`, `en.ts` y `dictionary.ts`.
- **Tests:** modelo y migración del pulso vacío, borrado, subdivisión exacta, selección sin imán, AlphaTex con `()`, texto y anuncio; recorrido en navegador con ratón y a 375 px en táctil.
- **Dependencia:** aplicar después de archivar `add-score-tab-editor` y `add-tab-multi-select-and-tuplets`, que crean los requisitos que este cambio modifica.
