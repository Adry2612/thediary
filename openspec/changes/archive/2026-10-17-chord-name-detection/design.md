# Design

## Context

Ver `proposal.md` para la motivación. El estado que condiciona el enfoque:

- `src/lib/chords.ts` ya sabe descomponer un nombre (`parseChordName`) y construir formas (`getChordShape`, `getGeneratedChordVoicings`), pero no al revés: no hay nada que mire una forma y diga el nombre.
- El vocabulario es cerrado: 12 fundamentales y 7 calidades (`major`, `minor`, `7`, `maj7`, `m7`, `sus2`, `sus4`).
- Las formas del diagrama están en afinación estándar (`FretboardDiagram` usa `getFretWindow` y `STRING_COUNT`, sin afinación configurable) y los trastes son absolutos.
- El campo de nombre tiene 188 px de texto y el placeholder "Nombre del acorde" necesita 220 px: se corta. "Acorde" necesita 83 px.
- `ChordPicker` guarda la forma dibujada en `manualShape` y el nombre por separado; escribir el nombre resetea `manualShape` (la forma pasa a seguir al nombre).

## Goals / Non-Goals

**Goals:**

- Poner nombre al acorde que forman los trastes dibujados.
- Que el placeholder del campo de nombre se lea entero.

**Non-Goals:**

- No se amplía el vocabulario de acordes.
- No se detectan inversiones como nombre propio: si la nota más grave no es la fundamental, se usa la mejor coincidencia disponible.
- No se toca el guardado, el modelo de datos ni la detección de acordes por afinaciones alternativas.

## Decisions

### Intervalos por calidad

Cada calidad se describe por sus semitonos respecto a la fundamental: mayor {0,4,7}, menor {0,3,7}, 7 {0,4,7,10}, maj7 {0,4,7,11}, m7 {0,3,7,10}, sus2 {0,2,7}, sus4 {0,5,7}. La detección pide que todas las notas pertenezcan a la fórmula y que estén las esenciales (fundamental y tercera, o la séptima cuando la hay); **la quinta puede faltar**, porque muchas formas la omiten (el Do7 abierto, `x32310`, solo tiene fundamental, tercera y séptima). Así no se confunde un maj7 con un 7 ni un sus2 con un sus4, pero sí se reconocen las formas reales.

### Fundamental candidata y desempate por la nota más grave

Se prueban las clases de altura presentes como fundamental. Cuando dos nombres encajan con las mismas notas (p. ej. do sus4 y fa sus2), se elige el que tiene la fundamental en la nota más grave, que es lo que se espera al ver el mástil. Sin coincidencia en posición fundamental, se toma la primera del vocabulario.

### Afinación estándar

`detectChordName` usa la afinación estándar (E A D G B E), que es la del resto del vocabulario y la del diagrama. La nota más grave se calcula por altura MIDI, no por el orden de las cuerdas, para no equivocarse con trastes altos.

### Grafía canónica

El nombre detectado usa la grafía canónica de la librería (`getCanonicalRoot`), igual que los acordes generados: `C#` y no `Db`. *Alternativa descartada:* conservar la grafía escrita previamente por el usuario, que complica el caso en el que no había ninguna.

### El dibujo manda y solo se escribe si hay coincidencia

Al marcar un traste o una cuerda, se guarda la forma dibujada y, si hay coincidencia, se escribe el nombre **sin** resetear la forma (a diferencia de escribir a mano, que sí la resetea). Si no hay coincidencia, el nombre se queda como estaba para no borrar lo que el usuario había escrito. *Alternativa descartada:* vaciar el nombre cuando no se reconoce, que obliga a reescribirlo al probar formas.

### Placeholder corto

El texto visible del campo pasa a "Acorde" (83 px, cabe sobrado incluso en pantallas estrechas) y el nombre accesible sigue siendo "Nombre del acorde". *Alternativa descartada:* dejar el texto largo quitando parte del hueco de la lupa, que sigue cortándose en pantallas estrechas.

## Risks / Trade-offs

- [Acordes con la fundamental invertida] → pueden recibir el nombre de la mejor coincidencia; el vocabulario es corto y el caso es raro.
- [Escribir el nombre al dibujar puede sorprender] → solo ocurre cuando las notas forman un acorde conocido; si no, no se toca el nombre.
- [Notas repetidas a la octava] → se deduplican por clase de altura antes de comparar.

## Migration Plan

1. `detectChordName` en `src/lib/chords.ts` con pruebas (mayor, m7, el empate sus4/sus2 y una forma desconocida).
2. Enlazarlo con los manejadores del mástil en `ChordPicker`.
3. Acortar el placeholder con una etiqueta nueva de i18n.
4. Verificación: typecheck, pruebas, build y comprobación en el navegador (dibujar un acorde y ver aparecer el nombre).

Sin migración: no cambia ningún dato guardado.

## Further Notes

La detección es la operación inversa de `getChordShape`, así que conviene mantenerla en el mismo módulo y con el mismo vocabulario.
