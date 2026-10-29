# Proposal

## Why

Al centrar los pulsos del metrónomo se cambió también su separación: ahora forman un grupo de 48 px por pulso, más juntos que antes, y con 4/4 la fila ya no ocupa el ancho de la tarjeta. La idea era conservar el reparto original y centrar solo los compases de 2 y 3 pulsos.

Por otro lado, el catálogo de cuerdas se elige por marca y modelo, pero dos juegos del mismo calibre se parecen demasiado en una lista de texto. Ver el paquete ayuda a reconocer el que montaste.

## What Changes

- La fila de pulsos recupera el **ancho de columna de 4/4** y el mismo hueco entre puntos. Con 2 o 3 pulsos, el grupo se centra conservando ese reparto.
- Cada juego de cuerdas puede llevar una **imagen del paquete**, mostrada como miniatura en el selector, en el historial y en la fila de cuerdas de la guitarra.
- El catálogo gana un campo `image` opcional; sin imagen se muestra un marcador neutro con la inicial de la marca.
- Las fotos **no se embarcan por defecto**: el repositorio queda sin material de terceros y se documenta cómo añadirlas en local o con permiso del fabricante.

Fuera del alcance:

- Descargar o cachear fotos desde la web del fabricante.
- Cambiar el modelo de datos del historial más allá de la imagen del catálogo.
- Rediseñar el selector de juegos.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `practice-tools`: la fila de pulsos mantiene el reparto de 4/4 y centra los compases con menos pulsos.
- `guitar-maintenance`: un juego de cuerdas puede mostrar la imagen de su paquete.

## Impact

- `src/components/practice/MetronomeCard.tsx`: ancho de columna y centrado.
- `src/data/guitar-strings.json`: campo `image` opcional por juego.
- `src/utils/guitar-strings.ts`: lectura y formato de la imagen.
- `public/string-sets/`: las 20 fotos oficiales en WebP, versionadas con el catálogo.
- `src/components/tools/StringSetFields.tsx`, `StringChangeDialog.tsx`, `GuitarHistoryDialog.tsx`, `GuitarRow.tsx`: miniaturas.
- Textos: `src/i18n/es.ts` y `src/i18n/en.ts`.
- Pruebas: las del catálogo y las del metrónomo.
