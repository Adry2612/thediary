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

## Añadir una técnica

1. Añade el campo a `TabNote` en `src/types/tab-score.ts`.
2. Normalízalo en `src/utils/tab-score/model.ts`.
3. Añade la operación o el `patch` en `operations.ts` / `editor-state.ts`.
4. Emite la etiqueta correcta en `alphatex.ts`; si la técnica afecta a la nota
   anterior (ligaduras y deslizamientos), va en `transitionTags`.
5. Añade la opción a `TAB_PALETTE` con su clave de traducción y un atajo único.
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
