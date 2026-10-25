# Tasks

## 1. Activation rules for the calendar

- [x] 1.1 Add `src/utils/practice-calendar-touch.ts` with `resolveDayActivation({ pointer, isKeyboard, armedDate, dateKey })` returning `"arm"` or `"navigate"`: keyboard/AT always navigates, a fine pointer always navigates, a coarse pointer arms a new day and navigates only when that day is already armed; verification: `npm run typecheck` passes.
- [x] 1.2 Cover it in `tests/practice-calendar-touch.test.mjs` with the first tap, the second tap, a different day, a day without practice, keyboard activation and mouse activation; verification: `node --test tests/practice-calendar-touch.test.mjs` passes.

## 2. Finish flow shared by the timer and the bar

- [x] 2.1 Extract the confirmation dialog out of `TimerCard.tsx` into `src/components/practice/FinishPracticeDialog.tsx` (title, description, keep practicing, exit without saving, finish and save), render it once from `PracticeSession`, and replace `TimerCard`'s `onDiscard` with `onRequestFinish`; verification: the timer card's "Finalizar sesión" still opens the dialog and the three actions behave as before.
- [x] 2.2 Make "finish and save" call `timer.finish()` and, when the current route is not `/practice`, push `/practice` so the completion dialog is visible; verification: stopping from `/repertoire` ends the session and lands on the practice screen with the completion dialog open.

## 3. The floating bar

- [x] 3.1 Rebuild the bar in `PracticeSession.tsx` as a relative card with a full-size overlay link (off `/practice`) or scroll button (on `/practice`), content with `pointer-events-none` and controls with `pointer-events-auto`; verification: clicking the name navigates, clicking either control does not navigate, and the accessible name includes the practice name.
- [x] 3.2 Replace the hover surface tint with a border/contrast change scoped to `@media (hover: hover)` and no opacity, and add the reduced-motion guard on any movement; verification: at 390 px and 1024 px the bar text keeps its contrast while hovered, and a simulated touch tap leaves no washed-out state.
- [x] 3.3 Add the play/pause control wired to `timer.resume`/`timer.pause` with the same disabled conditions as the timer card, and the stop control that opens `FinishPracticeDialog`; verification: pausing from `/repertoire` stops the clock and the control becomes play, and the stop confirmation cancels and confirms correctly.
- [x] 3.4 Add `useElementVisibility` (`IntersectionObserver`) and wrap the timer card in a ref; render the bar when the route is not `/practice` or when the timer card is out of view, and make the overlay scroll the card into view instead of navigating; verification: on `/practice`, scrolling past the timer shows the bar, clicking it returns to the timer, and the bar hides when the timer is visible again.
- [x] 3.5 Give the bar a `max(0.75rem, env(safe-area-inset-bottom))` bottom offset and translate its hardcoded Spanish `aria-label` plus the new control names to `src/i18n/translations.ts` and `src/i18n/dictionary.ts` for `es` and `en`; verification: `node --test tests/i18n.test.mjs` passes and the bar has no literal user-facing Spanish in the component.

## 4. Calendar touch

- [x] 4.1 Use `resolveDayActivation` in `YearPracticeCalendar`'s click handler with an armed-date ref, opening the summary on the first coarse-pointer tap and navigating on the second; verify a mouse click still navigates immediately and a keyboard activation does too.
- [x] 4.2 Clear the armed date when the summary closes or the year changes, and close an open summary on a coarse pointer when the user taps outside the grid and the summary; verification: after scrolling or tapping elsewhere, the next tap on the same day arms again instead of navigating.
- [x] 4.3 Confirm the month heatmap and the weekly summary keep their current behaviour; verification: no click handler or hover wiring changes in `PracticeHeatmap.tsx` or the weekly summary.

## 5. Integration verification

- [x] 5.1 Run `npm run typecheck`, `npm test` and `npm run build`; verification: the three exit 0.
- [x] 5.2 Check the real flow at 390 px and 1024 px: hover the bar, pause and resume from another screen, stop and cancel, stop and confirm, scroll past the timer inside `/practice`, return with the bar, and tap a calendar day twice on a touch viewport; verification: observations recorded in the verification notes.
- [x] 5.3 Add the verification notes at the end of this file; verification: each check is listed with its result.

## Workflow follow-up

- Archive the change once the manual checks pass.

## Verification notes

Fecha: 2026-10-25. Comprobado en el build de desarrollo (`http://localhost:3000`) con Playwright, viewport de 1024 px y emulación táctil de 390 × 844 (CDP `mobile`, 5 puntos táctiles, `hover: none`).

- **5.1** `npm run typecheck` sin errores, `npm test` con 624/624 y `npm run build` correcto.
- **Barra · hover (1024 px)** el texto conserva `rgb(236, 235, 232)` y `opacity: 1`; el fondo sigue en `rgb(25, 25, 24)` y solo cambia el borde a blanco al 25 %. No hay lavado de la tarjeta.
- **Barra · pausa/reanudar desde otra pantalla** en `/dashboard` la pausa detiene el reloj, cambia la etiqueta a «Reanudar la práctica» y no navega; reanudar vuelve a «Pausar la práctica».
- **Barra · stop y cancelar** abre «¿Terminar práctica?» con las tres acciones; «Seguir practicando» cierra el diálogo y conserva el tiempo y el scroll.
- **Barra · stop y confirmar desde otra pantalla** «Terminar y guardar» en `/dashboard` termina la práctica, navega a `/practice` y deja visible el diálogo de resumen con el tiempo registrado.
- **Barra · dentro de `/practice`** con el temporizador fuera del viewport aparece la barra con el mismo nombre, reloj y controles; al activarla se vuelve al temporizador (`scrollY` 1034 → 400) y la barra se oculta.
- **Barra · 390 px** ocupa 366 px dentro del viewport, no genera scroll horizontal (`scrollWidth` 390) y los dos controles de 40 × 40 quedan dentro de la tarjeta. El toque en el área grande vuelve al temporizador sin navegar; el toque en stop abre la confirmación (los controles no quedan tapados por el overlay).
- **Calendario · táctil** primer toque en un día con práctica abre el resumen sin navegar; segundo toque en ese mismo día abre el detalle. Tocar otro día mueve el resumen; un día sin práctica muestra su estado vacío y no navega aunque se toque dos veces. Tocar fuera de la cuadrícula y del resumen lo cierra.
- **Calendario · teclado** con emulación táctil, activar el día con Enter abre el detalle directamente (sin el toque extra).
- **Calendario · ratón** con puntero fino el primer clic navega directamente; el hover y el resumen se mantienen como antes.
- **Calendario · ajuste necesario** la tira anual se recolocaba al abrir el resumen porque `useLatestPracticeScroll` dependía de un `cells` recreado en cada render; se memoizó `cells` y el desplazamiento de la propia tira se excluye del cierre del resumen (`ignoreScrollRef`). Así el día no se mueve bajo el dedo entre el primer y el segundo toque.
- **Calendario · sin cambios** `PracticeHeatmap.tsx` y `WeeklyPracticeSummary.tsx` conservan su cableado; el resumen semanal usa el hook sin la nueva opción.
- **Traducciones** las nuevas etiquetas viven en `src/i18n/es.ts` y `src/i18n/en.ts` (las secciones `practice` de `dictionary.ts` son `Record<string, string>`, así que no requieren cambios de tipo) y `node --test tests/i18n.test.mjs` pasa.

