# Tasks

## 1. Floating bar transition

- [x] 1.1 Add `src/hooks/useAnimatedPresence.ts` with mount/visibility state, an enter frame, an exit timeout and cleanup; verification: `npm run typecheck` passes and the hook is used only from the bar.
- [x] 1.2 Wire the bar to the presence hook with opacity and small vertical movement, mark it inert and non-clickable while leaving, and reset the state when the route or timer visibility changes; verification: leaving `/practice` fades the bar in, returning fades it out, scrolling past the timer animates it, and a click during the exit does nothing.
- [x] 1.3 Make the presence hook read `prefers-reduced-motion` and skip both the movement and the delay; verification: with reduced motion emulated, showing and hiding the bar is immediate and has no transition.

## 2. Annual calendar summary below the grid

- [x] 2.1 Extract the summary body from `PracticeDayTooltip` into a presentational `PracticeDaySummary` and make the tooltip render it inside its existing fixed wrapper; verification: the weekly summary's floating card looks and behaves as before, including its internal scroll.
- [x] 2.2 Replace the annual calendar's portal/tooltip with an inline summary panel below the grid, initialised to the latest practised day (or today), updating on pointer enter and keyboard focus, and keeping the last day when the pointer leaves; verification: no card overlaps a day, hovering a neighbouring day still works, focusing a day updates the panel, and scrolling the page keeps it visible.
- [x] 2.3 Keep the touch two-tap and outside-tap rules with the inline panel: the first tap updates it, the second tap on the same day navigates, and tapping outside clears the armed day without hiding the panel; verification: the three cases behave as described on an emulated touch viewport, and the panel still scrolls its own session list.
- [x] 2.4 Stop the annual calendar from using the floating-tooltip hook while leaving the weekly summary on it; verification: no annual-calendar hover-intent, hide timer or portal remains, and the weekly summary still opens and closes its card normally.

## 3. Home practice plan

- [x] 3.1 Remove the long `Detalle del bloque` and `Parte del repertorio` prefixes from `PracticePlanTable`, list each detail entry on its own line and keep `Parte:` and `Material:`; verification: a block with several details shows them without the repeated label and the short labels remain where they add context.
- [x] 3.2 Add `hyphens-auto` and word-breaking to the plan table cells and the routine title so long text wraps with hyphens instead of overflowing; verification: at 390 px a long word breaks at the end of a line, the table has no horizontal overflow, and no text is truncated or hidden.
- [x] 3.3 Move the new short copy into `src/i18n/es.ts` and `src/i18n/en.ts` and extend `tests/i18n.test.mjs` with the affected keys; verification: `node --test tests/i18n.test.mjs` passes and both languages keep the same keys.

## 4. Remaining blocks timeline

- [x] 4.1 Add `src/components/practice/UpcomingBlocks.tsx` that renders every block after the current one as an ordered timeline with title, skill, planned duration and detail entries, marks the immediate next block and shows an empty state when none remain; verification: `npm run typecheck` passes and the component is driven only by its props.
- [x] 4.2 Render the timeline from `PracticeSession` in place of the single `nextPhasePanel`, hidden once the practice is completed; verification: advancing the timer removes the block that started, the next one becomes marked, the last block shows the empty state, and the completion dialog hides the section.
- [x] 4.3 Add the timeline copy (`Próximos bloques`, `Siguiente`, empty state) to both languages and remove the unused single-next keys; verification: `node --test tests/i18n.test.mjs` passes and no component references the removed keys.
- [x] 4.4 Check the timeline at 390 px and 1024 px with a long block name and details; verification: it stays inside the viewport, wraps long text, and keeps the next-block marker readable.

## 5. Integration verification

- [x] 5.1 Run `npm run typecheck`, `npm test` and `npm run build`; verification: the three exit 0.
- [x] 5.2 Walk the real flows at 390 px and 1024 px: show and hide the bar with and without reduced motion, hover and focus days on the annual calendar, tap a day twice on touch, open the home plan with a long routine, and advance a practice to the last block; verification: observations are recorded in the verification notes.
- [x] 5.3 Add the verification notes at the end of this file; verification: each check is listed with its result.

## Workflow follow-up

- Archive `refine-practice-banner-and-calendar` first, so the bar and touch requirements it introduces are in the main specs before this change is archived.
- Archive this change once the manual checks pass.

## Verification notes

Fecha: 2026-10-25. Comprobado con Playwright contra el servidor de desarrollo (`http://localhost:3000`) en viewports de 390 × 844 y 1024 × 800, con contextos aislados para no tocar los datos locales del navegador.

- **5.1** `npm run typecheck` sin errores, `npm test` con 625/625 y `npm run build` correcto.
- **Barra · entrada y salida (1024 px)** al salir de `/practice` la barra se monta con opacidad 0 y termina en 1; al volver a `/practice` se ve a mitad de la salida (`opacity` 0,42, `inert`) y desaparece a los ~300 ms. En `/practice`, al hacer scroll hasta el temporizador aparece, y al volver arriba se desvanece y se desmonta.
- **Barra · 390 px** el mismo comportamiento: aparece al salir el temporizador del viewport, se desvanece al volver (`opacity` 0,23 a mitad de salida) y desaparece. Mientras sale queda `inert`, así que no acepta clics.
- **Barra · movimiento reducido** con `prefers-reduced-motion: reduce` la barra aparece visible al cambiar de pantalla y desaparece al volver al temporizador sin esperar la animación; el hook omite el retardo y la clase `motion-reduce` anula la transición.
- **Calendario anual** el resumen es una región fija debajo de la cuadrícula; no hay portal ni tarjeta flotante. Su caja (top 916) queda por debajo de la cuadrícula (bottom 880), sin solaparse. Arranca en el último día practicado.
- **Calendario anual · puntero y teclado** pasar por otro día actualiza el panel al instante; al salir se mantiene el último día. Enfocar un día actualiza el panel y el día queda descrito por `practice-day-summary`. Al hacer scroll de la página el panel sigue visible con el mismo día.
- **Calendario anual · táctil (390 px)** el primer toque en el día 24 actualiza el panel sin navegar; tocar el 25 mueve el panel sin navegar; tocar fuera mantiene el panel y desarma el día; un toque posterior en el 24 vuelve a armar y el siguiente abre el detalle. La lista interna del panel es desplazable (508 px de contenido en 275 px visibles).
- **Resumen semanal** conserva su tarjeta flotante: al pasar por el día 24 aparece `practice-day-tooltip` con el mismo contenido y su comportamiento de siempre. El calendario anual ya no usa el hook de la ficha flotante.
- **Plan de hoy · etiquetas** cada detalle aparece en su propia línea sin `Detalle del bloque:`; el repertorio muestra `Parte: Riff principal`; `Material:` se mantiene. No aparece ningún `Parte del repertorio:` repetido.
- **Plan de hoy · textos largos** con una palabra de prueba larga, el detalle ocupa tres líneas, `hyphens` calcula `auto` y el borde derecho del texto (275 px) queda dentro de la celda (287 px). La página no tiene scroll horizontal a 390 px ni a 1024 px; el contenedor de la tabla mide 309/308 px por redondeo de porcentajes, pero el contenido no se sale de la celda.
- **Próximos bloques** con una rutina de cuatro bloques muestra los tres restantes, con el inmediato marcado como `Siguiente`. Al saltar bloques la lista pasa a dos, luego a uno y luego al estado vacío «No quedan más bloques en esta sesión». Al completar la práctica la sección desaparece y queda el diálogo de sesión completada. A 390 px y 1024 px no hay desbordamiento y el marcador `Siguiente` queda dentro del viewport.
- **Traducciones** `node --test tests/i18n.test.mjs` pasa con las claves nuevas y sin las antiguas `nextPhase` / `noNextPhase`.

