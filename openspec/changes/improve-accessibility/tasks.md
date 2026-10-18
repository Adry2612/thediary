# Tasks

## 1. Contraste del texto secundario

- [x] 1.1 Replace `text-zinc-500` and `text-zinc-600` with the app's muted tone in the start, the dashboard and the materials loader, and check every surface those texts sit on keeps 4.5:1 or more. Verify with `npm run typecheck` and by computing the ratios.
- [x] 1.2 Confirm no muted text ends up over a solid `zinc-800`, the one fill where the tone would fall short.

## 2. Nombre accesible del desplegable

- [x] 2.1 Compose the accessible name of `SelectField` from the name of the field and the label of the shown value, falling back to the field's name alone when there is no value. Verify with `npm run typecheck`.

## 3. Etiqueta del indicador de pulso

- [x] 3.1 Give the dot of each beat of the metronome a role that accepts its label. Verify with `npm run typecheck` and `npm run build`.

## 4. Objetivo de pulsación de los días del calendario

- [x] 4.1 Give the day button of `YearPracticeCalendar` a 24×24 px target and move the intensity fill to an inner 16 px square, so the calendar keeps painting the same squares. Drop the gap of the day grid, move its track and the weekday column from 16 to 24 px, and update the width the scroll to the latest practice assumes. Verify with `npm run typecheck` and by measuring the target (24×24) and the square (16×16) in the browser.

## 5. Orden de los encabezados

- [x] 5.1 Title `MetronomeCard` with the heading level that follows the title of each screen that renders it, which is 2 for `/metronome` and for `PracticeSession`. Verify with `npm run typecheck`.

## 6. Nombre accesible de los controles que se nombran solos

- [x] 6.1 Include the unit in the accessible name of `AdjustableNumber` right after the value, and leave a text node with a space between the value and the unit so the painted text and the name read the same words.
- [x] 6.2 Compose the accessible name of the day cell of `WeeklyPracticeSummary` from the weekday, the day of the month and the abbreviation the cell shows, stop spelling the whole word, and leave a text node with a space between the pieces of the cell for the same reason. Verify with `npm run typecheck`.

## 7. Verification

- [x] 7.1 Run `npm run build`, `npm run typecheck` and `npm test` together and verify all pass.
- [x] 7.2 Measure the contrast of every pair of tone and surface involved, and cross-check the formula against the 3.67:1 the audit had reported for the failing pair.
- [x] 7.3 Re-run the accessibility audit on `/`, `/dashboard`, `/repertoire`, `/repertoire/new` and `/metronome` and record the score of each one and the audits that still fail. Result of the last run (Lighthouse, desktop, navigation): the five reach **100** with **no failing audit**. Before the tasks of this change, `/dashboard` sat at 96 (`target-size`, 291 nodes, plus `label-content-name-mismatch`) and `/metronome` at 98 (`heading-order`).

## Workflow follow-up

- After the tasks pass, review the diff and validate with `openspec validate "improve-accessibility" --strict`.
