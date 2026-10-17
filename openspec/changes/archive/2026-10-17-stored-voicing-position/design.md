# Design

## Context

- `ChordPicker` guarda dos cosas: `manualShape`, que es la forma que se está viendo (la guardada al abrir, la que el usuario dibuja a mano, o `null` para usar la lista de posiciones), y `voicingIndex`, que es el índice de la lista que se está navegando. El dibujo sale de `manualShape ?? voicings[voicingIndex]`, pero el número sale siempre de `voicingIndex`, que empieza en 0.
- El acorde guardado almacena la forma (`shape`), no el número de posición.
- `getChordVoicings` deduplica las formas, así que dentro de la lista cada forma tiene un único índice y buscarla no es ambiguo.

## Goals / Non-Goals

**Goals:**

- Que el número que se ve corresponda siempre a la forma que se ve: al reabrir un acorde guardado y también al dibujar una forma que coincide con una posición.
- Que «‹» y «›» avancen desde ahí.

**Non-Goals:**

- No se guarda el número de posición ni cambia el formato de lo guardado.
- No cambia la lista de voicings ni su orden.

## Decisions

### Deducir el número de la forma, no inicializar el estado

Se descartó inicializar `voicingIndex` a partir de la forma guardada al montar el selector: eso arreglaría la reapertura, pero dejaría el mismo desajuste en cuanto la forma cambia por dibujarla (al dibujar una forma igual a la tercera posición, `applyDrawnShape` vuelve a poner el índice a 0 y el número mentiría otra vez). Deducirlo de la forma que se ve cubre los dos casos con una sola regla.

### Forma propia del usuario: se conserva el último índice

Cuando la forma dibujada no coincide con ninguna posición —un acorde propio— no hay número que mostrar, así que el contador conserva la última posición elegida y «‹»/«›» se mueven desde ahí. Es el comportamiento que ya había y deja siempre a mano la vuelta a una posición de la lista.

### Comparar por trastes, no por traste base

Dos formas son la misma si coinciden sus seis trastes. El traste base es derivado (se calcula de los trastes), así que compararlo añadiría ruido: una forma guardada antigua con un traste base distinto seguiría siendo la misma posición.
