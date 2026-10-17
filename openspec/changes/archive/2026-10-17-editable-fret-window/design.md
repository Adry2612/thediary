# Design

## Context

Ver `proposal.md` para la motivación. El estado que condiciona el enfoque:

- `FretboardDiagram` decide las filas con `getFretWindow(shape, context)`: si la forma no tiene trastes pisados devuelve `{ start: 1, count: 4 }` y, si los tiene, `start = al aire ? 1 : min - 1` y `end = max(max + 1, start + 2)`. Esas filas son también las celdas que se pueden pulsar.
- Consecuencia medida en el navegador: forma vacía → 24 celdas (trastes 1–4); tras marcar el traste 2 de la 5ª cuerda → 18 celdas (trastes 1–3) y el traste 4 deja de existir. Dibujar un B (`x24442`) es imposible.
- La librería llega al traste 8 (`Eb`, `Ebm`, `Eb7`) y las formas generadas al 15 (264 voicings comprobados).
- El detector de nombres (`detectChordName`) es correcto: sobre esas 264 formas solo falla el `Csus2` de la librería, que en realidad es un add9. No hay nada que tocar ahí.
- El diagrama solo se usa en el selector; el gráfico de la canción dibuja los nombres.

## Goals / Non-Goals

**Goals:**

- Que se pueda dibujar cualquier acorde, en cualquier traste, y que el nombre se asocie cuando la forma esté completa.
- Que la zona de dibujo no se mueva ni se encoja mientras se marca.

**Non-Goals:**

- No se cambia el vocabulario ni el detector de nombres.
- No se añade zoom, arrastre ni desplazamiento libre: la ventana se mueve con dos flechas.
- No se toca el dibujo de la canción ni el guardado.

## Decisions

### Ventana fija de cinco trastes

Mientras se edita, el diagrama muestra siempre cinco filas y el usuario las mueve por el mástil. Se descartó seguir ajustando la ventana a la forma: es justo lo que la encogía y lo que impedía llegar a los trastes altos. Cinco filas son las que ya cabían de sobra para un acorde (todas las formas de la librería y las generadas ocupan cuatro trastes o menos) y mantienen la caja compacta.

### Flechas verticales junto al mástil

Las flechas van en una columna a la izquierda del diagrama, con `▲` hacia los trastes graves y `▼` hacia los agudos, porque el mástil es vertical y el movimiento es a lo largo de él. Se descartaron las flechas `‹ ›`: el control de posiciones que ya vive encima del diagrama usa esos mismos símbolos para otra cosa. Se deshabilitan en los extremos (traste 1 y traste 15).

### La ventana sigue al acorde, no al dibujo

Al cambiar de nombre (a mano o desde el buscador) o al cambiar de posición, la ventana se recoloca sobre la forma nueva. Al marcar o desmarcar un traste **no se toca**: si la ventana siguiera a la forma dibujada, volvería a saltar y a encogerse. El encuadre inicial de un acorde abierto con forma guardada también sale de esa forma.

### Encuadre de la ventana

`getEditingWindowStart(shape)` toma el inicio que usaría el diagrama (`getFretWindow`) y lo baja lo justo para que se vea el traste más agudo de la forma, con el tope del traste 15. Así un `Eb` (trastes 6–8) se abre en 5–9 y una forma generada hasta el 15 se abre en 11–15.

### Puntos fuera de la ventana

Los puntos de trastes que quedan fuera de las cinco filas no se dibujan; si no, aparecerían por encima de la cejuela al desplazar la ventana. Las marcas de cuerda al aire o muteada siguen siempre visibles, porque no dependen del traste.

## Risks / Trade-offs

- [Una forma que ocupa más de cinco trastes] → la ventana no la muestra entera; se enseña su parte más aguda y el usuario la mueve. Solo pasa con formas dibujadas a mano, porque las del vocabulario ocupan cuatro trastes o menos.
- [Dos controles parecidos] → el de posiciones (‹ ›) cambia de forma y el de trastes (▲ ▼) mueve la vista; los símbolos y la posición son distintos.
- [Tope del traste 15] → dibujar por encima queda fuera; el vocabulario no llega ahí.

## Migration Plan

1. `EDITING_WINDOW_SIZE`, `MAX_EDITING_FRET`, `getEditingWindowStart` y `getMaxEditingWindowStart` en `src/lib/chords.ts`, con pruebas (ventana vacía, un acorde de la librería, uno con trastes altos y la propiedad de que todas las formas del vocabulario caben en la ventana).
2. `fretWindow` opcional en `FretboardDiagram` y ocultar los puntos fuera de la ventana.
3. Estado de la ventana en `ChordPicker`, flechas junto al diagrama y recolocación al cambiar de nombre o de posición.
4. Verificación: typecheck, pruebas, build y comprobación en el navegador (dibujar un B y un Eb, mover la ventana y ver que no se encoge).

Sin migración: lo que se guarda por acorde no cambia.

## Further Notes

El diagrama mantiene el ajuste automático cuando no se le pasa ventana, así que el resto de usos no cambia.
