# Tasks

## 1. Modelo y normalización

- [x] 1.1 Añadir los campos opcionales de `TabBar` (`section`, `repeat`, `endings`, `pickup`) y `TabBeat` (`dynamic`, `hairpin`, `text`, `chord`, `stroke`, `fermata`, `grace`) a los tipos de `src/types/` y a `normalizeTabScore`, con límites de texto (30 y 40 caracteres), veces de repetición 2–99, `pickup` solo en el primer compás y finales solo dentro de una repetición. Verificar con `tests/tab-score-notation-model.test.mjs`: valores válidos, valor desconocido (se descarta y se conserva el pulso), texto largo, final fuera de repetición y partitura sin marcas idéntica a la guardada.
- [x] 1.2 Hacer que `getBarFill` no marque como incompleto el compás anacrúsico pero sí como excedido. Verificar con tests de un compás corto, uno excedido y uno con `pickup` en un compás que no es el primero.

## 2. Operaciones de edición

- [x] 2.1 Implementar dinámica (en el primer pulso de la selección) y reguladores como marca por pulso, con quitar parcial. Verificar con tests de poner, mantener, quitar y de un regulador al que se le borra un pulso intermedio.
- [x] 2.2 Implementar texto, nombre de acorde, nombre de sección, dirección de púa y rasgueo, calderón y apoyatura (con la razón `graceOnRest` sobre un silencio y `strokeNeedsChord` con una sola nota). Verificar con tests de cada operación y de cada razón.
- [x] 2.3 Implementar repeticiones (apertura, cierre con veces), finales alternativos (con la razón `endingOutsideRepeat`) y compás anacrúsico (con la razón `pickupNotFirstBar`). Verificar con tests de repetición simple, cierre sin apertura, final fuera de repetición y quitar la repetición.
- [x] 2.4 Hacer que copiar, cortar, pegar, borrar y deshacer conserven y quiten las marcas con su pulso o compás. Verificar con tests de pegar un pulso con dinámica y texto, borrar un compás con sección y apertura de repetición, y deshacer un calderón.

## 3. AlphaTex

- [x] 3.1 Ampliar `buildAlphaTex` con la tabla del diseño (`dy`, `cre`/`dec`, `\ro`, `\rc`, `\ae`, `\section`, `txt`, `\chord` + `ch`, `bd`/`bu`/`rasg`, `f`, `gr`, anacrusis), resolviendo el acorde con la biblioteca de acordes. Verificar con tests de instantánea de una partitura que use cada marca y de un acorde conocido y otro desconocido.
- [x] 3.2 Verificar con el importador de AlphaTex de alphaTab, una marca por vez, que cada marca llega al modelo de alphaTab (dinámica del pulso, repetición, final, sección, texto, acorde, púa, calderón, apoyatura, anacrusis). Para cualquier sintaxis que el importador rechace, ajustar la tabla de `design.md` o retirar esa marca del dibujo y documentarlo.

## 4. Paleta y entradas

- [x] 4.1 Añadir al catálogo `TAB_PALETTE` y a `getPaletteState` los grupos de dinámicas, reguladores, repetición y finales, sección, texto, acorde, púa y rasgueo, apoyatura, calderón y anacrusis, con sus atajos únicos. Verificar con tests de opciones activas, de cada razón de desactivación y de atajos sin duplicados.
- [x] 4.2 Crear los diálogos pequeños de texto, sección y acorde (con sugerencias de la biblioteca) y los controles de veces de repetición y de pasadas de cada final. Verificar en el navegador que los campos aceptan hasta el límite y no más, y que Escape cierra sin cambiar nada.
- [x] 4.3 Comprobar la paleta con todos los grupos en 375 px y en táctil: la hoja inferior se desplaza sin tapar el pulso seleccionado. Verificar con capturas.

## 5. Reproducción y lectura

- [ ] 5.1 Verificar en el navegador que la reproducción respeta repeticiones y finales (los compases suenan el número de veces previsto), dinámicas y reguladores (volumen), calderón (alarga el pulso), púa (orden de cuerdas) y apoyaturas, y que el cursor sigue la pasada real. Anotar el resultado por marca.
- [x] 5.2 Ampliar `scoreToText` y el texto de anuncio de la selección con cada marca. Verificar con tests del texto («compás 3, abre repetición», «pulso 2, mf, texto: let it ring») y con VoiceOver.
- [x] 5.3 Verificar que la vista de solo lectura dibuja todas las marcas en las tarjetas, el detalle del lick y la práctica (sin reproducción en la práctica). Verificar con una partitura de prueba que las use todas.

## 6. Textos, documentación e integración

- [x] 6.1 Añadir las cadenas nuevas a `src/i18n/es.ts`, `en.ts` y `dictionary.ts`. Verificar con `npm run typecheck` y con el test que compara las claves entre idiomas.
- [x] 6.2 Ampliar `docs/tab-score.md` con las marcas, su mapeo a AlphaTex y cómo añadir otra. Verificar que cada afirmación coincide con el código y los tests.
- [x] 6.3 Ejecutar `npm run typecheck`, `npm test` y `npm run build`. Verificar que los tres terminan sin fallos nuevos.
- [ ] 6.4 Reproducir en una tab real las marcas del vídeo (dinámica, regulador, repetición con final, sección, acorde, púa, apoyatura, calderón) y reproducirla. Verificar cada una contra los escenarios de `tab-score-notation` y anotar el resultado.

## Workflow follow-up

- Aplicar y archivar este cambio solo cuando `add-score-tab-editor` esté archivado.
- Al archivar, sincronizar `tab-score-notation` en las specs principales.
