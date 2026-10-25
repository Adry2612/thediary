# Tasks

## 1. Annual calendar floating preview

- [x] 1.1 Add a `preview` mode to `usePracticeDayTooltip` that opens immediately, never marks the card as hovered, does not attach card-entry behaviour, and closes on pointer leave, scroll, resize and Escape; verification: the weekly summary still opens, switches days and scrolls its own list as before, and `npm run typecheck` passes.
- [x] 1.2 Add a `compact` variant to `PracticeDaySummary` that shows the date, count, total time and at most three sessions, then a "+N" line using the existing singular/plural session keys; verification: a day with five sessions renders three rows and "+2 sesiones"/"+2 sessions", with no new copy keys.
- [x] 1.3 Restore the portal preview in `YearPracticeCalendar`, remove the inline summary panel and its selected-day state, and wire pointer enter, focus, blur, grid leave and Escape; verification: no panel below the grid remains, hovering or focusing a day opens the card next to it, and `npm run typecheck` passes.
- [x] 1.4 Render the preview card with `pointer-events-none` and no pointer handlers while the weekly card keeps its interactive wrapper; verification: hovering or clicking a day covered by the open card still reaches that day and updates the card.
- [x] 1.5 Keep the touch two-tap rule with the preview: the first tap opens and arms, the second tap on the same day navigates, and a tap outside closes the card and clears the armed day; verification: all three cases behave as described on an emulated touch viewport at 390 px.

## 2. Timer and metronome heights

- [x] 2.1 Make the timer wrapper and the timer card fill their grid row so they match the metronome's height; verification: at 1024 px both cards start and end at the same vertical position, with no empty gap under the timer, and at 390 px they stack at full width.
- [x] 2.2 Check the matching height with the timer displaying a long song title and with the song picker open; verification: the metronome still matches the timer, and neither card overflows horizontally.

## 3. Block detail part label

- [x] 3.1 Remove the "Parte:" prefix from `PracticePlanTable` so a linked part renders on its own line, and remove the unused `partShort` copy from both languages and `tests/i18n.test.mjs`; verification: `node --test tests/i18n.test.mjs` and `npm run typecheck` pass, and the home plan shows the part without a prefix.
- [x] 3.2 Remove the "Parte:" prefix from `PracticeSessionPhases` while keeping "Lick:" and "Material:"; verification: a saved practice whose block links a song and a part shows the part name on its own line with no prefix.
- [x] 3.3 Check long part names in both detail tables at 390 px; verification: the text wraps inside its cell without horizontal overflow and remains readable.

## 4. Home repertoire cards

- [x] 4.1 Extend `CoverArt` with a card-sized square variant that keeps the reserved space and the neutral fallback; verification: a song with artwork shows the cover, a missing or failing URL shows the placeholder, and neither shifts the layout.
- [x] 4.2 Rewrite `RecentRepertoire` as a two-column card grid with up to four songs, each linking to its detail and showing cover, title, artist, album/year when known, learned-parts text and a decorative progress bar; verification: `npm run typecheck` passes, the four most recent songs appear, and cards open the right detail.
- [x] 4.3 Add the no-parts message to `home` in both languages and extend the i18n parity test; verification: `node --test tests/i18n.test.mjs` passes and both languages keep the same keys.
- [x] 4.4 Keep and check the loading, empty and "Ver repertorio" states, the absence of parts message, long-title wrapping, and the layout at 390 px, 1024 px and a wide viewport; verification: no horizontal overflow, the grid stays readable, and the empty state still links to the repertoire.

## 5. Integration verification

- [x] 5.1 Run `npm run typecheck`, `npm test` and `npm run build`; verification: all pass with no new warnings.
- [x] 5.2 In the browser, check the annual preview with pointer, keyboard and touch at 390 px and 1024 px, the equal card heights, and the home card grid with and without artwork; verification: the behaviours in the specs hold in every case.
- [x] 5.3 Record the verification results in this file and run `openspec validate refine-calendar-and-home-cards --strict`; verification: the change validates and the notes match what was observed.

## Verification notes

Fecha: 2026-10-25. Comprobado con Playwright contra `http://localhost:3000` en viewports de 390 × 844 (táctil), 1024 × 800/900 y 1440 × 900, con contextos aislados para no tocar los datos locales del navegador.

- **5.1** `npm run typecheck` sin errores, `npm test` con 626/626 y `npm run build` correcto.
- **Calendario anual · tarjeta** el panel `practice-day-summary` ya no existe; la tarjeta vuelve como portal `practice-day-tooltip` junto al día. Su `pointer-events` calculado es `none` y no tiene manejadores de entrada/salida.
- **Calendario anual · puntero** al pasar por el 24 de octubre la tarjeta se abre al instante. Un punto dentro de la tarjeta resuelve con `elementFromPoint` a un botón de la cuadrícula (23 de agosto); al mover allí el ratón la tarjeta cambia a ese día. Al hacer clic sobre un día cubierto con práctica (18 de octubre) se navega a `/dashboard/practice/2026-10-18`.
- **Calendario anual · teclado** enfocar un día abre la tarjeta y el día queda descrito por `practice-day-tooltip`; al salir el foco se cierra.
- **Calendario anual · compacta** con cinco sesiones la tarjeta muestra tres filas y `+2 sesiones`; a 390 px ocupa de x 90 a 378 y de y 442 a 775, dentro del viewport, sin scroll horizontal.
- **Calendario anual · cierre** hacer scroll en la página, pulsar Escape o redimensionar cierra la tarjeta. Tras redimensionar no reaparece hasta que el puntero se mueve.
- **Calendario anual · táctil (390 px)** el primer toque en el 24 abre la vista previa sin navegar; el segundo toque en el mismo día abre `/dashboard/practice/2026-10-24`; tocar fuera cierra la tarjeta y desarma el día, y un toque posterior vuelve a abrirla.
- **Resumen semanal** conserva su tarjeta interactiva: se abre con diez sesiones, la lista tiene scroll interno (508 px de contenido en 267 px), cambia de día tras la intención de hover, permanece abierta al entrar en la tarjeta, el scroll interno no la cierra y el scroll de la página sí.
- **Contador y metrónomo** a 1024 px ambas tarjetas empiezan en y 353 y terminan en 1012 (659 px de alto); con un título largo y el selector de canción abierto siguen igualadas. A 390 px se apilan a 350 px de ancho, sin overflow horizontal.
- **Etiqueta «Parte»** el plan de hoy y el detalle de la sesión guardada muestran el nombre de la parte sin `Parte:`; se conservan `Material:` y `Lick:`. Con un nombre largo, el texto ocupa cinco líneas, su borde derecho (275 px) queda dentro de la celda (287 px) y no hay scroll horizontal a 390 px.
- **Repertorio de inicio** aparecen las cuatro canciones más recientes con sus enlaces (`/repertoire/s1`…), portada cargada, marcador neutro cuando falta o falla la imagen, progreso 2/4 → 50 %, 0/1 → 0 %, 1/1 → 100 %, mensaje «Sin partes todavía», artista/álbum/año y fecha de actualización. La rejilla usa dos columnas a 390 px y 1440 px y cuatro a 1024 px (la sección ocupa todo el ancho); no hay overflow horizontal en ningún caso. Al pulsar una tarjeta se abre `/repertoire/s1`; el estado vacío conserva el enlace `/repertoire`.

## Workflow follow-up

- Archive `refine-practice-banner-and-calendar` first, then `refine-home-calendar-and-next-blocks`, then this change. This change's `MODIFIED` home-plan requirement only exists in the main spec after the second archive.
- Rebuild and restart the production server before testing from the phone.
