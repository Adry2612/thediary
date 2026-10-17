# Proposal

## Why

Dos detalles frenan el uso natural del editor. Al envolver una frase, todas las filas se ven igual y cuesta distinguir dónde sigue la misma frase y dónde empieza otra o una estrofa. Y un acorde solo tiene una forma: el mismo acorde suena distinto en otras posiciones del mástil y no hay manera de elegirlo.

## What Changes

- **Interlineado según el tipo de fila**: las filas de continuación de una frase envuelta se dibujan más juntas; una frase nueva y una estrofa mantienen su aire. Solo cambia el hueco entre bloques, no el sitio de los acordes.
- **Varios voicings por acorde**: para un mismo acorde se ofrecen varias formas tocables (raíz en la 6ª, la 5ª y la 4ª cuerda), ordenadas de la más cómoda a la más aguda, y el usuario elige la que quiera.
- **Selector de posición en la caja del acorde**: un control para recorrer los voicings (`1/n`, anterior/siguiente); la forma elegida es la que se asigna y se guarda con el acorde.

No hay cambios rotundos: los datos siguen guardando una forma por acorde (la elegida) y las canciones existentes no cambian.

## Capabilities

### New Capabilities

- `chord-voicings`: ofrecer varias formas tocables para un mismo acorde y dejar que el usuario elija la posición.

### Modified Capabilities

- `repertoire-song-editor`: las filas de continuación de una frase envuelta se separan menos que una frase nueva o una estrofa, y la caja del acorde añade el selector de voicing.

## Impact

- Librería de acordes: el generador pasa a devolver una lista ordenada de formas (raíz en la 6ª, 5ª y 4ª cuerda) en vez de una sola, y se expone un resolutor de voicings.
- Envoltura de la letra: cada fila visual marca si es continuación de la frase anterior.
- Componentes: `ChordChartEditor` ajusta el hueco por tipo de fila; `ChordPicker` añade el control de posición.
- i18n en español e inglés y pruebas nuevas para la lógica pura.

## Notes

Se puede abordar en dos pasos independientes (interlineado y voicings); juntos son un cambio pequeño.
