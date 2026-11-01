# Design

## Context

Ver `proposal.md`. La selección ya es un `TabSelection` con `anchor` y `getRangeBeats` devuelve los pulsos del tramo; la paleta aplica duración y técnicas a ese tramo. El lienzo selecciona en `pointerdown`, y el menú de la nota usa pulsación larga y doble toque. El pulso guarda `tuplet?: 3` y `getBeatTicks` lo multiplica por 2/3; AlphaTex emite `{tu 3}`. El compás se compara en ticks enteros y se marca si no cuadra.

## Goals / Non-Goals

**Goals:**

- Marcar un tramo arrastrando, con ratón y con dedo, sin romper el desplazamiento vertical ni los gestos del menú.
- Subdividir cada pulso seleccionado en 3, 5, 6, 7, 9, 10 o 12 huecos iguales conservando su duración total.
- Dibujar y reproducir la subdivisión con su número.
- Cargar los tresillos ya guardados sin migración.

**Non-Goals:**

- Subdivisiones anidadas.
- Proporciones n:m personalizadas.
- Agrupar notas ya escritas bajo un corchete.
- Quitar o convertir una subdivisión creada (se deshace).
- Cambiar el tamaño de la selección por cuerdas: el tramo sigue siendo de pulsos.

## Decisions

### 1. `tuplet` pasa a ser el número de la subdivisión

`TabBeat.tuplet` admite `3 | 5 | 6 | 7 | 9 | 10 | 12`. Una tabla `TUPLET_RATIOS` guarda la proporción de cada una —3:2, 5:4, 6:4, 7:4, 9:8, 10:8 y 12:8— y `getBeatTicks` multiplica por `entran / n`.

- AlphaTex emite `{tu n}`; alphaTab admite esas variantes simples.
- La normalización acepta solo los siete números; un valor desconocido se descarta y el pulso conserva su duración base. Los datos con `tuplet: 3` siguen valiendo.
- Alternativa descartada: guardar `{ n, m }`. Las siete subdivisiones tiene proporción fija y un objeto complica la normalización sin aportar nada hasta que se admitan n:m.

### 2. La subdivisión tiene dos modos: partir un pulso o agrupar notas

La acción nueva `divideBeat` recibe la selección y el número `n`.

**Con un solo pulso seleccionado (antes de escribir las notas):**

1. Calcula `T = getBeatTicks(pulso)`.
2. Calcula la figura base con `T / entran`; tiene que ser una duración entera de las admitidas (1–64). Si no lo es, la opción se desactiva con el motivo `cannotSubdivide`.
3. Sustituye el pulso por `n` pulsos de esa figura, todos con `tuplet: n`; el primero conserva notas, silencio y demás; los demás nacen como silencios.
4. Comprueba el tope de 64 pulsos por compás (`beatLimit`) antes de insertar.
5. Deja seleccionado el primer hueco, para escribir las N notas con el avance automático.

**Con exactamente `n` pulsos seleccionados (después de escribir las notas):**

1. Si hay más de `n`, se toman los `n` primeros y el resto se queda como está.
2. Exige que estén en el mismo compás (`tupletAcrossBars`), que todos tengan la misma figura (`tupletDifferentValues`) y que ninguno esté subdividido ni tenga puntillo (`alreadySubdivided` / `cannotSubdivide`).
3. A cada pulso le pone `tuplet: n` conservando su figura: los N notas pasan a ser un solo grupo de N en el tiempo de M, no N grupos independientes.
4. El tiempo liberado, `figura × (n − m)`, se añade como silencios **al final del compás**. El resto de notas no cambia de figura y el compás sigue sumando lo mismo.
5. Comprueba el tope de 64 pulsos y deja seleccionado el primer pulso del grupo.

Ejemplo: tres corcheas seleccionadas y tresillo → las tres corcheas se convierten en un tresillo de corcheas (960 ticks) y se añade una corchea de silencio al final; el compás mide lo mismo. Lo mismo con tres negras y un silencio de negra.

- Alternativa descartada (era el primer comportamiento y el usuario lo rechazó): dividir cada pulso seleccionado en N huecos. Con tres notas seleccionadas salían nueve huecos, no un tresillo.
- Alternativa descartada: mover las notas siguientes para absorber el tiempo liberado sin añadir silencios. Cambia la posición de notas que el usuario no ha tocado; el silencio al final es más predecible.
- Alternativa descartada: mantener el interruptor antiguo. Acorta el pulso, deja el compás descuadrado y no sirve para agrupar.

### 3. Tolerancia de redondeo en 7 y 9

Con 960 ticks por negra, un pulso de negra dividido en 7 o 9 no da ticks enteros. `getBeatTicks` redondea cada hueco y la suma puede quedar 1–3 ticks por debajo o por encima. `getBarFill` acepta una tolerancia de 4 ticks cuando el compás contiene subdivisiones; el resto de compases sigue comparando exacto.

- Alternativa descartada: subir la resolución de ticks. Cambia el modelo, AlphaTex y la reproducción para un caso raro.
- Alternativa descartada: rechazar 7 y 9. El usuario las pidió y alphaTab las dibuja.

### 4. Arrastrar para seleccionar notas

En el lienzo, `pointerdown` sigue seleccionando el pulso de origen. Si el puntero se mueve más de 8 px en horizontal, se marca `dragging` y cada movimiento despacha `select` con `extend` hacia el pulso y la cuerda actuales; `pointerup` termina y limpia el estado.

El tramo sigue siendo un rectángulo de pulsos por cuerdas, pero **lo que se resalta son las notas**: `getSelectedNotes` cruza los pulsos del tramo con el rango de cuerdas entre el ancla y el foco y devuelve solo las notas que existen. El lienzo dibuja una caja por nota; si el tramo no tiene notas (solo silencios), cae al resaltado por pulso para no perder la selección. Así el arrastre no marca bloques de pulso.

- El tuplet y las operaciones de ritmo siguen usando los pulsos de las notas seleccionadas; las técnicas pueden ampliarse a todas las cuerdas del rectángulo en otro cambio.
- `touch-action: pan-y` en la capa interactiva: el arrastre vertical lo sigue gestionando el navegador (desplaza la página) y el horizontal es nuestro.
- Un arrastre cancela la pulsación larga y no dispara el doble toque; soltar tras arrastrar no abre el menú ni escribe.
- Mayús + clic y Mayús + flechas se quedan como alternativa de teclado.
- Alternativa descartada: tocar el primero y el último. Necesita un modo o un intervalo y choca con el doble toque que ya abre el menú.

### 5. Selector de subdivisión en la paleta

El grupo Ritmo cambia el botón de tresillo por **Subdivisión**, que abre un diálogo pequeño con los siete números y su proporción. Cada opción muestra su nombre (tresillo, quintillo…) y, si no cabe, el motivo por el que está desactivada. Elegir una opción aplica la división y cierra el diálogo; Escape cierra sin tocar nada.

- Alternativa descartada: siete iconos más en la paleta. Crece la rejilla y no hay sitio para explicar el motivo de cada uno.
- El diálogo reutiliza el patrón de los de compás y tempo (`form` en `TabScoreEditor`).

### 6. Una sola edición por subdivisión

La división se calcula entera y se apila una vez en el historial; deshacer recupera el pulso original con su contenido y su duración. Los dos dígitos de un traste siguen compartiendo paso.

## Risks / Trade-offs

- [El redondeo de 7 y 9 deja el compás a pocos ticks] → Tolerancia de 4 ticks solo en compases con subdivisiones; los demás siguen exactos.
- [Arrastrar en táctil puede chocar con el desplazamiento o con la pulsación larga] → `touch-action: pan-y`, umbral de 8 px y cancelación de la pulsación larga al mover.
- [Un pulso ya subdividido no se puede volver a dividir ni convertir] → La opción se desactiva con el motivo; deshacer lo revierte. Se documenta como límite.
- [Al agrupar, el tiempo liberado se convierte en silencio al final del compás] → Es predecible y no mueve las notas que el usuario no ha seleccionado; el compás sigue sumando lo mismo.
- [Una selección con menos notas que la subdivisión no puede formar el grupo] → El diálogo pide un pulso o al menos N; con más de N agrupa los N primeros y deja el resto como estaba.

## Migration Plan

No hay migración ni subida de versión: `tuplet: 3` sigue siendo válido y los compases sin subdivisiones se leen igual. Si se revierte el cambio, los pulsos con 5, 6, 7, 9, 10 o 12 se cargarían descartando el número y conservando la figura base, sin perder el resto de la partitura.

## Open Questions

Ninguna.
