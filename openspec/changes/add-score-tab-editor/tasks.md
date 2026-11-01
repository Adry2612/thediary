# Tasks

## 1. Spike de alphaTab como superficie de edición

- [x] 1.1 Dibujar en una página temporal (no se commitea) una partitura AlphaTex de 16 y de 64 compases con `includeNoteBounds` y medir el tiempo de dibujo. Verificar que 16 compases quedan por debajo de 150 ms en un móvil medio (o con CPU limitada ×4) y anotar las cifras en `design.md`.
- [x] 1.2 Comprobar `boundsLookup`: obtener los límites de un pulso, de un silencio y de la pauta de tablatura de su compás, y confirmar que la cuerda se deduce de la altura del clic. Verificar con clics sobre una nota, un silencio y una posición vacía, y anotar las propiedades exactas en `design.md` (Open Questions).
- [x] 1.3 Comprobar el reproductor: activar `player` con el SoundFont desde `public/`, arrancar desde un pulso y leer la posición reproducida; fijar el valor de `useWorkers` que funciona con `npm run build` + `npm start`. Verificar sonido en Chrome y en Safari de iPhone y anotar la propiedad usada para arrancar desde una posición.
- [x] 1.4 Copiar `sonivox.sf2` desde `node_modules/@coderline/alphatab/dist/soundfont/` a `public/alphatab/soundfont/` con su `LICENSE` y `README.md`. Verificar que el archivo se sirve (~1,3 MB) y que ninguna pantalla lo pide hasta que se reproduce (pestaña Red del navegador).

## 2. Modelo y normalización

- [x] 2.1 Definir `TabScore`, `TabBar`, `TabBeat` y `TabNote` en `src/types/` (reutilizando los tipos de técnica existentes) y `normalizeTabScore` en `src/utils/tab-score/` (límites de traste, cuerdas, 1–64 compases, al menos un compás, descarta valores inválidos, conserva la nota si solo falla una técnica). Verificar con `tests/tab-score-model.test.mjs`: entrada vacía, traste 25, cuerda 6, 65 compases, técnica desconocida y bend fuera de rango.
- [x] 2.2 Implementar `getBeatTicks` y `getBarFill` en ticks enteros (960 por negra) para duraciones 1–64, puntillo y tresillo, y compases 4/4, 3/4, 6/8 y 7/8. Verificar con tests de cada duración, de un compás exacto, uno corto y uno largo.
- [x] 2.3 Implementar `createEmptyScore(tuning)` (un compás 4/4 con silencio de redonda, tempo 90) y `scoreToText` como alternativa textual con compases, pulsos, notas y técnicas. Verificar con tests de partitura vacía, de acordes y de técnicas, y que la salida no depende de ids.

## 3. Operaciones de edición

- [x] 3.1 Implementar escribir traste (silencio → nota, cambiar traste, añadir nota a un pulso), borrar nota, borrar pulso y alternar silencio. Verificar con `tests/tab-score-operations.test.mjs`: nota sobre silencio, dos cuerdas en un pulso, borrar la única nota deja silencio con la misma duración, borrar pulso marca el compás como corto.
- [x] 3.2 Implementar fijar duración, puntillo y tresillo sobre un pulso o un rango, sin reajustar otros pulsos. Verificar con tests de rango, de compás que deja de sumar y de que ningún otro pulso cambia.
- [x] 3.3 Implementar ligadura y técnicas con sus precondiciones (ligado y deslizamiento necesitan nota anterior en la cuerda; cantidad y tipo de bend; fantasma; acento normal y fuerte) y la regla de retirar una ligadura cuya nota de origen desaparece. Verificar con tests de cada error (`needsPreviousNote`, etc.), de alternar sobre un rango y de conservar técnicas al cambiar el traste.
- [x] 3.4 Implementar insertar, duplicar y borrar compás (mínimo uno), compás desde un compás y tempo desde un compás, con el tope de 64. Verificar con tests de cada operación, de borrar el último compás y de superar el tope.
- [x] 3.5 Implementar la navegación de la selección (flechas entre pulsos, cuerdas y compases, Mayús para rango, límites). Verificar con tests de cruce de compás, primera y última posición y ampliación de rango.

## 4. Historial y portapapeles

- [x] 4.1 Implementar el historial por instantáneas (tope 200, `coalesceKey` para los dos dígitos del traste, rehacer se descarta tras una edición nueva, restaura la selección). Verificar con `tests/tab-score-history.test.mjs`.
- [x] 4.2 Implementar copiar, cortar y pegar pulsos y compases con ids nuevos y un portapapeles en memoria compartido entre editores, con error al superar 64 compases. Verificar con tests de pegado dentro de la misma tab, entre dos tabs y de desbordar el tope.

## 5. AlphaTex

- [x] 5.1 Implementar `buildAlphaTex(score)` (tempo, compás, duraciones, puntillo, tresillo, silencios, ligaduras, técnicas y acentos), trasladando `legato` y `slide` a la nota de origen y con una tabla explícita de cuerdas. Verificar con tests de instantánea sobre una partitura que use cada técnica.
- [x] 5.2 Verificar el mapeo con el importador de AlphaTex de alphaTab ejecutado en Node: cuerda, traste, duración y silencio de cada pulso coinciden con el modelo para las partituras de prueba. Si alphaTab no se puede cargar en Node, dejarlo documentado en `design.md` y sustituirlo por una comprobación en el navegador con la misma partitura.

## 6. Migración y persistencia

- [x] 6.1 Implementar `migrateGridTab` según el diseño (duración hasta la siguiente nota, relleno con silencios, compases vacíos, notas en la misma columna como un pulso, resoluciones 4, 8 y 16, afinación, tempo 90, técnicas conservadas y valores desconocidos descartados). Verificar con `tests/tab-score-migration.test.mjs`, incluidos tres tabs reales anonimizadas de licks existentes.
- [x] 6.2 Añadir `score?: TabScore` a `RepertoireItem` y a `GuitarLick` y leerlo en `src/utils/licks/normalize.ts`, `src/utils/repertoire-item.ts` y la normalización de `practice_data`, con la precedencia del diseño (`score` manda; si falta, migrar `tab` en memoria; `score` inválido cae a `tab`) y sin escribir nunca `tab`. Verificar con tests de cada precedencia y de que un guardado conserva `tab` byte a byte.

## 7. Vista de solo lectura

- [x] 7.1 Crear `TabScoreView` (alphaTab con importación dinámica, `fontDirectory`, pauta de tablatura con ritmo, notación estándar opcional guardada por dispositivo, compases en sistemas sin scroll horizontal, esqueleto de carga y alternativa textual si falla, `playback` apagado por defecto). Verificar a 375, 768 y 1280 px que no hay scroll horizontal y que, con la red cortada, aparece el texto.
- [x] 7.2 Sustituir `LickTab`/`TabView` por `TabScoreView` en `LickCard`, `licks/[id]/page.tsx` y `PracticeSession`, manteniendo el texto antiguo cuando solo hay `tabContent`. Verificar con un lick con rejilla, uno con partitura, uno con texto y uno vacío, y comprobando que el bloque de lick de la práctica no ofrece ningún control de reproducción.

## 8. Editor: selección y entrada

- [x] 8.1 Crear `useTabScoreEditor` (estado de partitura, selección, historial, portapapeles y búfer de dígitos del traste) que enlaza las operaciones puras. Verificar con `npm run typecheck` y con un test del reductor puro que reproduce una secuencia escribir, deshacer y rehacer.
- [x] 8.2 Crear la capa superpuesta de ratón (clic a pulso y cuerda, resaltado por contorno y fondo, recolocación tras `renderFinished` y al cambiar el tamaño, scroll al pulso seleccionado). Verificar clicando una nota, un silencio y una posición vacía, y que cambiar la selección no vuelve a dibujar la partitura (contador de dibujos).
- [x] 8.3 Crear el manejador de teclado (flechas, Mayús, dígitos con dos cifras, Retroceso/Supr, Escape, Cmd/Ctrl+Z y Mayús+Z, C, X y V). Verificar escribiendo ocho notas solo con teclado.
- [x] 8.4 Añadir `role="application"`, la región `aria-live` con compás, pulso, cuerda, traste y duración, y la alternativa textual. Verificar con un test del texto del anuncio y con VoiceOver al mover la selección.

## 9. Paleta

- [x] 9.1 Crear el catálogo `TAB_PALETTE` y `getPaletteState` (activo, desactivado y motivo) y derivar de él los atajos. Verificar con `tests/tab-score-palette.test.mjs`: opciones activas de una corchea con puntillo y palm mute, ligadura sin nota anterior, atajos únicos.
- [x] 9.2 Crear la paleta de escritorio como popover anclado, con colocación para no tapar el pulso, navegación con flechas, foco de retorno y Escape. Verificar en el navegador que no cubre la selección en la primera y en la última fila.
- [x] 9.3 Crear la hoja inferior táctil con la fila de trastes 0–24 y los mismos grupos, activada con `(pointer: coarse)`. Verificar con emulación táctil y en un móvil real que no oculta el pulso seleccionado.
- [x] 9.4 Crear las acciones de compás (insertar, duplicar, borrar, compás, tempo) y el aviso de compás desajustado con símbolo y texto. Verificar acortando una nota hasta que el compás se marque y corrigiéndolo hasta que desaparezca.

## 10. Reproducción

- [x] 10.1 Crear `src/services/tab-score-player.ts` y su hook (importación dinámica, descarga del SoundFont al primer sonido, reproducir/pausar/parar, desde el principio o desde la selección, cursor con scroll, velocidad sin tocar el tempo guardado). Verificar que no hay petición del SoundFont antes de pulsar y que reproducir desde un pulso empieza en él.
- [x] 10.2 Crear la barra de reproducción, el mensaje de fallo de carga y el interruptor de vista previa de nota (preferencia por dispositivo con su almacén y su test). Verificar con el SoundFont bloqueado en la red que el mensaje aparece y la edición sigue funcionando, y con el interruptor activo que cada nota escrita suena una vez.

## 11. Integración y datos

- [x] 11.1 Sustituir el editor del diálogo de licks (`LickEditorModal`) por el nuevo: abre la partitura migrada, guarda solo `score` y conserva `tab` y `tabContent`. Verificar con un lick con rejilla: editar, guardar, recargar y comprobar en el JSON guardado que `tab` no cambió.
- [x] 11.2 Sustituir el editor en `RepertoireSongEditor`, `RepertoireSongForm` y `useRepertoireSongDraft`, respetando `isTabEditorEnabled` y la afinación del ítem. Verificar con una canción con afinación alternativa y con la bandera apagada.
- [x] 11.3 Añadir las cadenas de toda la interfaz nueva a `src/i18n/es.ts`, `en.ts` y `dictionary.ts`. Verificar con `npm run typecheck` y con un test que compare las claves entre idiomas.
- [x] 11.4 Comprobar la sincronización y el contrato: guardar un ítem con `score`, recargar desde Supabase y verificar que vuelve igual; revisar con `git grep` en `feat/ios-native-app` que `GuitarLick` y los ítems de repertorio se decodifican como JSON opaco y anotar el resultado en `design.md`.

## 12. Retirada del editor antiguo

- [x] 12.1 Borrar `TabEditor`, `TabView`, `TabTechniquePicker`, `TabPlaybackBar`, `useTabEditorSelection`, `useTabPlayback` y la lógica de rejilla de `src/utils/repertoire-tab.ts`, conservando lo que la migración necesita (lectura y normalización de la rejilla). Actualizar o reemplazar `tests/repertoire-tab.test.mjs`, `tests/tab-playback.test.mjs`, `tests/licks-tab-text.test.mjs` y `tests/licks-tab-highlight.test.mjs`. Verificar con `grep` que no quedan importaciones rotas y con `npm run typecheck && npm test`.
- [x] 12.2 Documentar en `docs/tab-score.md` el modelo, la tabla de AlphaTex, cómo añadir una técnica y la regla de no tocar `tab`. Verificar que cada afirmación coincide con el código y con los tests.

## 13. Accesibilidad y pantallas pequeñas

- [x] 13.1 Pasada de teclado y lector de pantalla sobre el editor, la paleta y la barra de reproducción, con contraste del resaltado en tema claro y oscuro y tamaño de los controles según `app-accessibility`. Verificar con una lista de comprobación por escenario de la spec.
- [x] 13.2 Pasada a 375 y 768 px y en un móvil real: márgenes del diálogo, sin scroll horizontal, paleta inferior sin tapar el pulso. Verificar con capturas de cada estado.

## 14. Verificación e integración

- [x] 14.1 Ejecutar `npm run typecheck`, `npm test` y `npm run build`. Verificar que los tres terminan sin fallos nuevos.
- [x] 14.2 Reproducir en una tab real el recorrido del vídeo: seleccionar una nota, teclear traste, abrir la paleta, cambiar duración, ligar, añadir y duplicar compás, deshacer y rehacer, copiar y pegar, reproducir desde un pulso. Verificar cada paso contra los escenarios de `tab-score-editor` y anotar el resultado.
- [x] 14.3 Medir el redibujado con 64 compases en un móvil medio y anotar el resultado y la decisión tomada en `design.md`.

## Workflow follow-up

- Archivar `add-score-tab-editor` antes que `add-score-tab-notation-extras`, que la amplía.
- Al archivar, editar directamente el `Purpose` de `openspec/specs/licks-library/spec.md`, que sigue hablando de tablatura en texto plano (un delta no puede cambiar el `Purpose`).
- Planificar en un cambio aparte la retirada del campo `tab` cuando no queden clientes antiguos.
