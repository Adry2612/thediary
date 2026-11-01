# Design

## Context

Ver `proposal.md` para la motivación. Estado actual relevante:

- **Modelo.** `RepertoireTab` (`src/types/practice.ts`) es `{ tuning, measures, subdivision, notes[] }`; cada nota es `{ string, fret, column, ...técnicas }` y su duración es implícita (hasta la siguiente columna). No existen pulsos, duraciones, silencios, compás ni tempo guardado. Se normaliza en `normalizeTab` (`src/utils/repertoire-tab.ts`, 1103 líneas) y vive en `RepertoireItem.tab` y `GuitarLick.tab`; los licks conservan además `tabContent` (texto antiguo).
- **Editor.** `TabEditor.tsx` (617 líneas) dibuja una rejilla de botones HTML con una capa SVG para los enlaces; `useTabEditorSelection` gestiona selección y búfer de traste; no hay deshacer ni portapapeles. La bandera `NEXT_PUBLIC_TAB_EDITOR` oculta el editor de canciones en producción; el de licks no pasa por ella.
- **Audio.** `useTabPlayback` solo mueve un cursor visual. El sintetizador con SoundFont se retiró en el refactor de capas (`86ad94f`); existió un conversor de la rejilla a AlphaTex (`683894d`, `src/lib/tab-alphatex.ts`) que sirve de referencia: tuvo que corregir el mapeo de cuerdas y trasladar `legato` de la nota de destino a la de origen, porque AlphaTex marca los ligados en el origen.
- **alphaTab.** `@coderline/alphatab` 1.8.4 ya está instalado y solo lo usa `GuitarProViewer` (`useWorkers: false`, fuentes Bravura en `public/alphatab/font/`, reproductor desactivado). alphaTab dibuja, reproduce, genera eventos de ratón sobre notas y pulsos (`noteMouseDown`, `beatMouseDown`, con `includeNoteBounds`) y expone `boundsLookup`, pero **no edita**: no detecta cambios en su modelo y volver a dibujar es un nuevo cálculo completo. Entiende y exporta AlphaTex (`tempo`, `ts`, `pm`, `lr`, `b`, `v`, `dy`, `cre`, `bu`/`bd`…).
- **Convenciones del repositorio.** La lógica pura vive en `src/utils` (lo único que importan los tests, con rutas relativas y extensión `.ts`), lo externo en `src/services`, los hooks en `src/hooks` y los tipos de dominio en `src/types`.
- **Restricciones de specs que no cambian.** `lick-practice` prohíbe reproducir o sintetizar la tab durante un bloque de lick; `app-accessibility` fija el tamaño mínimo de los controles; el resto de la app guarda un único documento `practice_data` y la app iOS trata los licks como JSON opaco.

## Goals / Non-Goals

**Goals:**

- Un modelo de partitura propio, pequeño, normalizable y fácil de probar, que sea la única fuente de verdad.
- Dibujar y reproducir con alphaTab sin reimplementar notación ni síntesis.
- Edición con selección, teclado, paleta, deshacer y portapapeles como en el vídeo, utilizable con teclado y táctil.
- Migrar las tabs de rejilla sin perder notas ni técnicas y sin poder dañar los datos originales.

**Non-Goals:**

- Varias pistas, voces, letra, armadura, palanca de vibrato, importar/exportar Guitar Pro.
- Dinámicas, repeticiones, secciones, texto, acordes, púa, rasgueo, apoyaturas y calderón (`add-score-tab-notation-extras`); el modelo deja sitio para ellos sin cambiar de versión.
- Convertir el texto antiguo de los licks a partitura.
- Reproducción durante la práctica (la prohíbe `lick-practice`).

## Decisions

### 1. El modelo propio manda; alphaTab dibuja y reproduce desde AlphaTex

El editor guarda y edita un `TabScore`. Cada cambio genera un texto AlphaTex determinista (`buildAlphaTex(score)`) que alphaTab carga con `api.tex(...)`. Los eventos de alphaTab (nota o pulso pulsado, pulso reproducido) se traducen de vuelta a `(compás, pulso, cuerda)` por posición, no por identidad de objeto.

- Alternativa descartada: usar el `Score` de alphaTab como fuente de verdad. Obliga a mutar su modelo y llamar a `render`, ata el formato guardado a sus clases internas y complica el deshacer.
- Alternativa descartada: guardar AlphaTex como formato. Para editar habría que parsearlo en cada operación; un JSON estructurado se normaliza y se prueba mejor.
- Alternativa descartada: dibujo SVG propio. Dibujar ritmo, barras de corchea, ligaduras y técnicas es lo difícil, y alphaTab ya lo hace y está instalado.

### 2. Forma de los datos

```ts
type TabScore = {
  version: 2;
  tuning: string;        // "EADGBE"
  tempo: number;         // tempo inicial, 30..300
  bars: TabBar[];        // 1..64
};
type TabBar = {
  id: string;
  timeSignature?: { numerator: number; denominator: 2 | 4 | 8 | 16 }; // hereda del anterior si falta
  tempo?: number;        // cambio de tempo desde este compás
  beats: TabBeat[];
};
type TabBeat = {
  id: string;
  duration: 1 | 2 | 4 | 8 | 16 | 32 | 64;
  dots?: 1;
  tuplet?: 3;
  rest?: boolean;
  notes: TabNote[];      // vacío si es silencio
};
type TabNote = {
  string: number;        // 0 = grave … 5 = aguda, como hoy
  fret: number;          // 0..24
  tie?: boolean;         // continúa la nota anterior de la misma cuerda
  ghost?: boolean; dead?: boolean; accent?: "normal" | "heavy";
  /* técnicas existentes: legato, slide, bend, vibrato, palmMute, letRing,
     tapping, harmonic, tremoloPicking, trill, slap, pop */
};
```

- Las duraciones se calculan en **ticks enteros** con 960 por negra (la resolución de alphaTab): una semifusa son 60 ticks, con puntillo 90, en tresillo 40. No hay fracciones flotantes y la comparación con el compás es exacta.
- `legato` y `slide` siguen significando «desde la nota anterior de la misma cuerda», como hoy; el generador los traslada a la nota de origen, que es donde AlphaTex los espera.
- Los campos de `add-score-tab-notation-extras` son opcionales y se añaden sin subir `version`; un lector que no los conoce los descarta sin perder la nota.
- `id` solo sirve para claves de React y para fijar la selección tras un cambio; los tests no dependen de su valor.
- El tope es de 64 compases, el mismo de hoy. El editor actual limita a 16; se deja en 64 y se mide el coste (ver riesgos).

### 3. Almacenamiento: campo `score` junto a `tab`

Ítems de repertorio y licks ganan `score?: TabScore`. `tab` no se toca nunca. Reglas de lectura: si hay `score`, se usa; si no, y hay `tab` con notas, se migra **en memoria**; si no, un `score` vacío. El editor guarda solo `score`.

- La migración no se ejecuta al cargar la app ni reescribe `practice_data` por su cuenta: la tab migrada se persiste la primera vez que el usuario guarda tras editarla. Así abrir una canción no cambia nada guardado.
- `tab` se conserva una versión como copia de seguridad: si hay que revertir, los datos antiguos siguen ahí. Retirarlo es un cambio posterior.
- Alternativa descartada: reutilizar `tab` con un `version` nuevo. Un cliente antiguo en caché lo normalizaría como rejilla y lo vaciaría; con un campo nuevo, un cliente antiguo ve la rejilla anterior (desactualizada pero íntegra).
- Compatibilidad iOS: licks y ítems de repertorio viajan como JSON opaco y se fusionan por `id`, así que `score` se conserva sin tocar el contrato. Se comprueba al verificar (tarea 11.4), porque la rama iOS no está en este árbol.

### 4. Operaciones puras, historial por instantáneas

Todo cambio es una función pura `(score, selection, …) => { score, selection } | { error }` en `src/utils/tab-score/`: escribir traste, fijar duración, alternar silencio y ligadura, alternar técnica, insertar/duplicar/borrar compás, compás y tempo, borrar nota/pulso, pegar. `error` lleva una clave de motivo (`needsPreviousNote`, `barLimit`, `emptyBeat`…) que la paleta muestra como explicación de por qué una opción está desactivada.

El historial guarda instantáneas inmutables `{ score, selection }` con compartición estructural (cada operación copia solo el compás tocado). Tope de 200 entradas; una `coalesceKey` agrupa los dos dígitos de un traste en una sola edición. No se persiste.

- Alternativa descartada: comandos con `do/undo`. Doblan el código de cada operación y es fácil que se desincronicen.
- El portapapeles es un módulo en memoria compartido por todos los editores de la sesión (permite pegar entre tabs); no usa el portapapeles del sistema porque el contenido no es texto.

### 5. Validación de compases

`getBarFill(bar, timeSignature)` devuelve `under | exact | over`. La interfaz marca los compases `under`/`over`, pero la edición nunca reajusta pulsos ajenos. El AlphaTex de un compás desajustado se genera tal cual: alphaTab lo dibuja y lo reproduce con su longitud real, lo que coincide con el aviso rojo del vídeo.

### 6. Selección como datos; capa de ratón superpuesta

La selección es `{ bar, beat, string, anchor? }` y vive en el modelo del editor, no en el DOM. El teclado la mueve sin consultar el dibujo, así que funciona antes del primer dibujo y se prueba sin navegador.

Sobre el contenedor de alphaTab hay una capa transparente propia que:

1. traduce un clic a un pulso con `boundsLookup` (nota si cae sobre una cabeza o número; si no, el pulso por posición horizontal);
2. calcula la cuerda a partir de la altura dentro de los límites de la pauta de tablatura del compás, dividida en tantas cuerdas como tenga la afinación;
3. dibuja el resaltado (contorno + fondo) en un `div` posicionado con las coordenadas de `boundsLookup`, recalculado tras cada `renderFinished` y al cambiar el tamaño.

Cambiar la selección **no** vuelve a dibujar la partitura; solo mueve la capa. Solo se vuelve a dibujar cuando cambia el modelo.

- Alternativa descartada: resaltar vía estilos del `Score` de alphaTab. Cada cambio de selección costaría un nuevo cálculo completo de la maqueta.

### 7. Paleta declarativa

Un catálogo (`TAB_PALETTE`) lista grupos y opciones: duraciones, puntillo, tresillo, silencio, ligadura, técnicas, acciones de compás, deshacer/rehacer, portapapeles. Una función pura `getPaletteState(score, selection)` devuelve, para cada opción, `active`, `disabled` y el motivo. El componente solo pinta ese estado, así que los avisos del tipo «la ligadura necesita una nota anterior» se prueban sin interfaz.

- En escritorio es un popover anclado al resaltado (se coloca encima o debajo para no tapar el pulso) con navegación por flechas.
- Con puntero táctil (`(pointer: coarse)`) es una hoja inferior con una fila de trastes 0–24 que sustituye al teclado numérico. Se prefiere a un diálogo para no tapar el pulso seleccionado.
- Los atajos de teclado salen del mismo catálogo, para que paleta y atajos no diverjan.

### 8. Reproducción

`src/services/tab-score-player.ts` encapsula una instancia de alphaTab con el reproductor activado y el SoundFont servido desde `public/alphatab/soundfont/sonivox.sf2` (el mismo que viene en `node_modules/@coderline/alphatab/dist/soundfont/`, licencia Apache-2.0 con su `LICENSE` y `README`). Se carga con `import()` dinámico y el SoundFont solo se descarga al primer pedido de sonido.

- Empezar desde la selección: se fija la posición de reproducción en el inicio del pulso seleccionado (a confirmar la propiedad exacta en el spike).
- Velocidad: razón de reproducción de alphaTab; no modifica `tempo` guardado.
- Vista previa de la nota al escribir: interruptor, desactivado por defecto, para no descargar 1,3 MB sin que el usuario lo haya pedido.
- La vista de solo lectura de la práctica no monta el reproductor (`playback={false}`), lo que cumple `lick-practice`.
- Si falla la carga se muestra un mensaje y el editor sigue funcionando.

### 9. Migración de la rejilla

`migrateGridTab(tab)` es pura. Para cada compás de la rejilla (`subdivision` columnas, siempre 4/4): ordena las notas por columna, agrupa las que comparten columna en un pulso, y da a cada pulso la duración hasta la siguiente columna con nota o el final del compás. Una duración que no es representable (por ejemplo 5 semicorcheas) toma el valor representable mayor que cabe y el resto se rellena con silencios; los huecos iniciales y los compases vacíos se rellenan con silencios de la mayor duración posible. El tempo inicial es 90, el valor por defecto que ya usaba la reproducción visual.

- Cuerda, traste, orden y técnicas se conservan; los valores de técnica desconocidos se descartan y se mantiene la nota (como exigía el requisito retirado «Saved tabs without techniques keep loading»).
- Alternativa descartada: una nota por columna con la duración de la rejilla. Dibujaría decenas de silencios de semicorchea y la tab migrada sería ilegible.

### 10. Accesibilidad

El anfitrión del editor es un único elemento enfocable (`role="application"` con etiqueta y descripción de atajos) que gestiona el teclado; alphaTab dibuja en SVG y no es operable por sí mismo. Un `aria-live="polite"` anuncia compás, pulso, cuerda, traste y duración al cambiar la selección. `scoreToText` (puro; sustituye a `repertoireTabToText`) produce la alternativa textual, que también se muestra mientras el dibujo carga o si falla. Los compases desajustados se señalan con un símbolo y un texto, no solo con color.

### 11. Sustitución por fases, sin romper la app

El editor nuevo convive con el antiguo hasta el final. Primero se construyen los módulos puros y la vista de solo lectura; después el editor se integra en un único punto de uso (el diálogo de licks) y, una vez verificado, en las canciones; al final se borran `TabEditor`, `TabView`, `TabTechniquePicker`, `TabPlaybackBar`, `useTabEditorSelection`, `useTabPlayback` y la parte de rejilla de `repertoire-tab.ts`. La bandera `NEXT_PUBLIC_TAB_EDITOR` sigue controlando solo el editor de canciones.

### 12. Preferencias

La notación estándar y la vista previa de notas se guardan por dispositivo, como el resto de preferencias de la app (`src/services/*-storage.ts`, claves `thediary.tab-score-*`), y una clave desconocida vuelve al valor por defecto.

## Risks / Trade-offs

- **alphaTab no edita y su maqueta es costosa** → La selección no vuelve a dibujar; los cambios de modelo se agrupan con un *debounce* corto; se fija un presupuesto de 150 ms de redibujado para 16 compases en un móvil medio y se mide en el spike. Si 64 compases lo superan, el editor limita el número de compases visibles por sistema o avisa; el tope de modelo no cambia.
- **Elegir la cuerda por altura de clic** es menos preciso que una celda → La cuerda también se elige con ↑/↓ y, en táctil, con los controles de la hoja inferior; el resaltado muestra siempre la cuerda activa.
- **El reproductor de alphaTab con el empaquetador de Next** (hoy el visor usa `useWorkers: false`) → Spike inicial (grupo 1) antes de comprometer el resto; la síntesis ya funcionó en esta app (`683894d`).
- **Mapeo de cuerdas entre modelo y alphaTab** (error ya sufrido) → Tests de ida y vuelta con el importador de AlphaTex en Node y una tabla explícita cuerda↔número.
- **Datos antiguos tocados por un cliente antiguo** → Un cliente anterior que guarde un ítem puede descartar `score` y conservar la rejilla: se pierde la edición reciente, no los datos previos. Aceptado y mitigado por no tocar `tab`.
- **Tamaño del cambio** → Las tareas están por fases con comprobación cada una; el cambio gemelo (`add-score-tab-notation-extras`) queda aparte para no retrasar el cierre de este.
- **Peso de 1,3 MB de SoundFont** → Carga bajo demanda y la vista previa desactivada por defecto.

## Migration Plan

1. Desplegar con `score` ausente: todo se abre desde `tab` y migra en memoria; nada guardado cambia.
2. El primer guardado tras editar escribe `score`. A partir de entonces manda `score`.
3. Reversión: volver a la versión anterior deja `tab` intacto y utilizable.
4. Más adelante, un cambio aparte retira `tab` cuando no queden clientes antiguos.

## Open Questions

Ninguna que cambie las specs, el enfoque o el desglose de tareas. El spike del
grupo 1 resolvió las tres que quedaban: la propiedad para arrancar desde una
posición (`playbackRange`/`tickPosition`), la forma de obtener los límites de la
pauta de tablatura (`MasterBarBounds.bars` con `\staff {tabs}`) y el coste de
dibujar 64 compases (ver «Spike results»).

## Spike results (alphaTab)

Medido en Chromium, viewport 1280×900, CPU limitada ×4 y `includeNoteBounds`
activado.

### Dibujo

- 16 compases: **28 ms** en caliente; **143 ms** el primer dibujo (incluye la
  carga de fuentes). Por debajo del presupuesto de 150 ms.
- 64 compases: **71 ms**. Se mantiene el tope de 64 compases sin limitar los
  compases visibles por sistema.

### Límites y selección

- `api.boundsLookup.getBeatAtPos(x, y)` devuelve el `Beat`; después,
  `getNoteAtPos(beat, x, y)` devuelve la `Note` de la cabeza o del número.
- Cada `MasterBarBounds.bars` contiene una `BarBounds` por pauta. Con
  `\staff {tabs}` hay una sola y su `realBounds` es la pauta de tablatura (alto
  ≈ 65 px para 6 cuerdas).
- La cuerda se deduce de la altura:
  `index = clamp(round((y - realBounds.y) / (realBounds.h / 6)), 0, 5)`, donde
  el índice 0 es la cuerda aguda. `modelString = 5 - index`.
- `beat.notes[].noteHeadBounds` da el rectángulo de cada nota para dibujar el
  resaltado.

### Mapeo de cuerdas

- Modelo: `0` = grave … `5` = aguda.
- AlphaTex usa el número inverso: `alphaTexString = 6 - modelString`.
- alphaTab interno usa `1` = grave … `6` = aguda:
  `note.string = modelString + 1`.

### Reproductor

- Funciona con `useWorkers: false` para el dibujo y un worker de síntesis
  directo.
- Turbopack expone `import.meta.url` como `file:///ROOT/...`; sin ajuste,
  alphaTab crea un worker blob que falla. `configureAlphaTabEnvironment`
  (`src/services/alpha-tab-environment.ts`) fuerza `webPlatform = BrowserModule`
  y una `alphaTabUrl` con base `/alphatab/`.
- `core.scriptFile = "/alphatab/alphaTab.worker.mjs"` y
  `player.outputMode = WebAudioScriptProcessor` (evita el worklet, que también
  resolvería mal su URL).
- Arrancar desde un pulso: `playbackRange = { startTick, endTick }` con
  `beat.absolutePlaybackStart`, o `tickPosition = beat.absolutePlaybackStart`, y
  después `api.play()`.
- El SoundFont se carga con
  `api.loadSoundFontFromUrl("/alphatab/soundfont/sonivox.sf2", false)` y solo se
  pide al pulsar reproducir; sin `player.soundFont` no hay descarga automática.
- `isReadyForPlayback` pasa a `true` tras cargar el SoundFont (~1 s en local).
- Verificado en Chromium; queda probar Safari de iPhone al integrar la barra de
  reproducción.

## Contrato de sincronización (11.4)

- El estado de práctica se guarda y sincroniza como un JSON completo: el campo
  `score` viaja dentro de cada elemento del repertorio y de cada lick, así que
  no hace falta tocar el esquema de Supabase ni el de la copia local.
- `normalizePracticeData` conserva el `score` válido y la rejilla original; hay
  un test de ida y vuelta por `JSON.stringify`/`parse` en
  `tests/tab-score-sync.test.mjs`.
- La app iOS (`feat/ios-native-app`) decodifica `RepertoireItem` y `GuitarLick`
  como un `JSONObject` opaco y lo vuelve a codificar sin interpretarlo
  (`apps/ios-native/TheDiary/Models/PracticeModels.swift`). Un `score` que no
  conoce se conserva intacto al sincronizar desde el móvil.
- La normalización de la rejilla reordena las claves de cada nota al hidratar
  (`normalizeTab`), pero no cambia ningún valor: `tab` sigue guardándose con los
  mismos trastes, cuerdas y columnas tras editar la partitura.
