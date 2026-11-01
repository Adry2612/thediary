# Tablaturas por partitura

Una tablatura se guarda como **partitura**: compases ordenados con pulsos
temporizados. El editor, el visor, la reproducción y la exportación a AlphaTex
comparten ese modelo.

## Modelo

`src/types/tab-score.ts` define:

- `TabScore`: `version: 2`, `tuning` (p. ej. `"EADGBE"`), `tempo` inicial y de 1
  a 64 `bars`.
- `TabBar`: `beats` y, opcionalmente, `timeSignature` y `tempo`. Si faltan, se
  heredan del compás anterior.
- `TabBeat`: `duration` (`1`, `2`, `4`, … `64`), `dots` (`1`), `tuplet` (`3`),
  `rest` y `notes`.
- `TabNote`: `string` (0 = cuerda más grave), `fret` (0–24) y las técnicas.

Los ticks son enteros y la negra vale 960 (`TAB_TICKS_PER_QUARTER`). Un compás
4/4 suma 3840 ticks. Los helpers de `src/utils/tab-score/ticks.ts` calculan la
duración de cada pulso, resuelven el compás heredado y marcan si un compás se
queda corto (`under`) o largo (`over`).

Las operaciones de edición son puras (`operations.ts`), igual que la selección
(`selection.ts`), el historial (`history.ts`), el portapapeles (`clipboard.ts`)
y el reductor del editor (`editor-state.ts`). La interfaz no modifica el modelo
a mano: despacha acciones y el reductor aplica esas funciones.

## Migración de la rejilla

`src/utils/tab-score/migration.ts` convierte la tablatura antigua
(`RepertoireTab`, con columnas y sin duraciones) en partitura:

- las notas de una misma columna forman un pulso;
- cada nota dura hasta la siguiente columna ocupada o el final del compás;
- los huecos se rellenan con silencios de la mayor duración posible;
- se conservan las técnicas y se descartan los valores desconocidos.

`src/utils/tab-score/resolve.ts` decide qué mostrar: si el elemento tiene
`score` válido, manda; si no, se migra `tab` en memoria. **Nunca se reescribe
`tab`**: el campo antiguo se conserva para que la sincronización y los clientes
antiguos sigan funcionando, y para poder volver atrás.

## AlphaTex

`src/utils/tab-score/alphatex.ts` es el único punto que conoce la sintaxis de
alphaTab. Reglas que no son obvias:

| Concepto | AlphaTex |
| --- | --- |
| Pauta solo de tablatura | `\staff {tabs}` |
| Tablatura + notación | `\staff {score tabs}` |
| Duración | `:4`, `:8`, … |
| Puntillo | `{d}` tras el contenido del pulso |
| Tresillo | `{tu 3}` antes del contenido |
| Silencio | `r` |
| Acorde | `(0.6 2.5)` |
| Cuerda | `fret.string`, con la cuerda 6 como la más grave |
| Técnica | `{pm}`, `{lr}`, `{v}`, `{vw}`, `{hac}`, `{nh}`, `{ph 5}`, … |
| Ligadura | `{t}` en la nota **anterior** |
| Ligado | `{h}` en la nota anterior |
| Deslizamiento | `{sl}` / `{ss}` en la nota anterior |
| Bend | `{b (0 2)}`, con liberación `{b (0 2 0)}` |

El mapeo de cuerdas es el punto más fácil de romper:

- modelo: `0` = grave … `5` = aguda;
- AlphaTex: `6 - modelString`;
- alphaTab interno: `modelString + 1`.

`tests/tab-score-alphatex.test.mjs` comprueba el ida y vuelta contra el
importador real de alphaTab.

## Editor

El editor de un lick es una pantalla propia, no un diálogo:

- `/licks/new` crea un lick;
- `/licks/[id]/edit` edita uno existente;
- al guardar se vuelve a `/licks/[id]`.

La partitura ocupa todo el ancho de la columna. Dentro del lienzo:

- un clic o un toque seleccionan la cuerda y el punto horizontal; si el punto
  cae lejos de una nota, la primera cifra crea el hueco justo ahí;
- las flechas mueven la selección, Mayús la extiende y los dígitos escriben el
  traste (0–24, con dos cifras);
- un doble clic, un clic derecho o una pulsación larga abren la paleta de esa
  posición sin pasar por el botón «Opciones»; desde ahí se elige la duración,
  el silencio, las ligaduras y las técnicas de la selección;
- en táctil la paleta es una hoja inferior con los trastes 0–24 y se coloca
  por debajo del pulso, reservando espacio para poder subirlo.

### Escribir en cualquier punto

Al hacer clic en un hueco, el editor guarda la fracción horizontal del clic. La
primera cifra del traste parte el pulso en mitades hasta una fusa (32) y escribe
la nota en la mitad más cercana; la suma del compás no cambia. Si el clic cae
sobre una nota ya dibujada, solo la selecciona (o permite añadir otra cuerda del
acorde). Si cae en el primer 18 % del pulso, se escribe al inicio sin partir.

En táctil el punto se conserva al abrir el menú con doble toque o pulsación
larga: al elegir el traste en la hoja, la nota cae donde se tocó, no al inicio
del pulso.

### Mover una nota

El grupo **Posición** del menú tiene **Mover a la izquierda** y **Mover a la
derecha**: intercambian el pulso seleccionado con el de al lado dentro del mismo
compás, con sus notas y su duración. La suma del compás no cambia. En los
extremos del compás la opción se desactiva y la franja de descripción explica
por qué.

La paleta se cierra con Escape o al desplazar la partitura (rueda o
`touchmove`), pero no cuando un cambio de duración recompone la página: ese
desplazamiento es del anclaje del navegador, no del usuario. Los bloques con
animación de entrada usan `animation-fill-mode: backwards` para no conservar un
`transform` que rompa los elementos `fixed` que contiene la paleta.

### Crear un pulso nuevo

Un compás solo tiene los pulsos que ya existen. Para escribir una nota en un
compás lleno, selecciona un pulso y elige **Dividir pulso** en el grupo Ritmo:

- el pulso se parte en dos de la mitad de duración (una negra da dos corcheas);
- el contenido actual se queda en el primero y el segundo nace como silencio;
- el silencio nuevo queda seleccionado, listo para escribir el traste;
- el puntillo y el tresillo se copian en las dos mitades, así que la suma del
  compás no cambia.

`splitBeat` rechaza dividir una semifusa (`cannotSplit`) o un compás que ya
tiene 64 pulsos (`beatLimit`); la paleta explica el motivo. Deshacer recupera
el pulso original.

### Iconos, descripción y tutorial

Cada opción de la paleta se dibuja con `TabPaletteIcon`, que elige el icono por
el id (y cae al icono del grupo si la opción es nueva). Al pasar el cursor, al
tocar o al enfocar con el teclado, la franja bajo la cabecera muestra el nombre,
el atajo declarado y el motivo por el que la opción no está disponible. El
nombre accesible del botón es el texto completo, no el icono.

El botón **Tutorial** de la barra del editor abre `TabScoreTutorial`, una guía
interactiva sobre la partitura actual. Es una tarjeta fija, no un diálogo
modal: se puede seguir escribiendo y el lienzo no se bloquea. Cada paso
resalta su zona con `tour-highlight` y avanza solo cuando ocurre la acción:

1. clic o toque dentro de la pauta;
2. un traste escrito (se compara la identidad del `score`, así que también
   vale cambiar el traste de una nota que ya existía);
3. una segunda nota en el mismo pulso (acorde);
4. el menú de la nota abierto;
5. una duración distinta en el pulso seleccionado;
6. un pulso más en el compás, es decir, «Dividir pulso».

La detección usa una foto del estado tomada al entrar en cada paso, no valores
absolutos: una partitura que ya tenía notas no salta pasos sola. «Saltar paso»
avanza sin tocar nada, «Saltar tutorial» y Escape cierran la guía, y lo escrito
durante ella queda en la partitura (se deshace con ↶). Las cadenas viven en
`tabTutorial` (`es.ts` y `en.ts`).

## Añadir una técnica

1. Añade el campo a `TabNote` en `src/types/tab-score.ts`.
2. Normalízalo en `src/utils/tab-score/model.ts`.
3. Añade la operación o el `patch` en `operations.ts` / `editor-state.ts`.
4. Emite la etiqueta correcta en `alphatex.ts`; si la técnica afecta a la nota
   anterior (ligaduras y deslizamientos), va en `transitionTags`.
5. Añade la opción a `TAB_PALETTE` con su clave de traducción y un atajo único,
   y dibuja su icono en `TabPaletteIcon` (si falta, usa el del grupo).
6. Cubre el caso en `tests/tab-score-operations.test.mjs`,
   `tests/tab-score-alphatex.test.mjs` y `tests/tab-score-palette.test.mjs`.
7. Si la técnica debe sonar, revisa que alphaTab la reproduce en el navegador.

## Reproductor

`TabScoreCanvas` mantiene una sola instancia de `AlphaTabApi` y expone
`TabScorePlayerControls` (reproducir, desde un pulso, pausar, detener y
velocidad). El SoundFont (`public/alphatab/soundfont/sonivox.sf2`) se descarga
solo al primer sonido, con `fetch` propio para poder avisar del fallo sin
bloquear la edición. La velocidad cambia `playbackSpeed`, nunca el tempo
guardado en la partitura.

`configureAlphaTabEnvironment` (`src/services/alpha-tab-environment.ts`) debe
llamarse antes de crear cualquier API: Turbopack expone `import.meta.url` como
`file:///ROOT` y los workers de alphaTab no cargarían.

## Verificación

```bash
npm run typecheck
npm test
npm run build
```

Los tests de partitura viven en `tests/tab-score-*.test.mjs`. La verificación en
navegador se hace con el servidor HTTPS local y un iPhone cuando el cambio toca
entrada táctil o audio.
