# Tasks

## 1. Catálogo

- [x] 1.1 Add `src/data/guitar-strings.json` with the main electric, acoustic and classical sets: id, brand, model, name, family, unit and six gauges.
- [x] 1.2 Add `src/utils/guitar-strings.ts` with the typed catalogue, the filter by family, the gauge formatter, the display formatter and the draft-to-snapshot conversion.
- [x] 1.3 Import the JSON with a type attribute so it ships in the bundle and needs no request.

## 2. Datos

- [x] 2.1 Add `stringSet` to `GuitarEntry` as an optional snapshot of brand, model, family, gauges, unit and free gauge text.
- [x] 2.2 Normalise that snapshot in `src/utils/equipment.ts`, requiring brand and model and discarding invalid gauges.
- [x] 2.3 Keep older entries without a set readable.

## 3. Interfaz

- [x] 3.1 Add `StringSetFields`: family buttons, the filtered set list and the free brand, model and gauge fields.
- [x] 3.2 Add `StringChangeDialog` with date, set and notes, and open it from the string change button.
- [x] 3.3 Add the same selector to the string form of `GuitarHistoryDialog`.
- [x] 3.4 Show the mounted set in the history and keep the notes underneath.
- [x] 3.5 Add the copy to `src/i18n/es.ts` and `src/i18n/en.ts`.

## 4. Verificación

- [x] 4.1 Cover the catalogue, the formatters, the draft conversion and the normalisation in `tests/guitar-strings.test.mjs`.
- [x] 4.2 Run `npm test`, `npm run typecheck` and `npm run build`; all three finish without failures.
- [x] 4.3 In the browser, register a string change from the catalogue and another typed by hand, then open the history and verify both show their set and gauges.
- [x] 4.4 Reload and return to Tools: verify the two changes and their sets are still there.

## Workflow follow-up

- Archive the change after the browser check passes and verify `guitar-maintenance` keeps its existing requirements and gains the two new ones.
