# Tasks

## 1. Modelo y selector compartido

- [x] 1.1 Add `stringKind?: GuitarStringKind` to `Guitar` in `src/types/equipment.ts` and read it in `normalizeGuitar` with `isGuitarStringKind`, dropping unknown values. Cover valid and invalid values in `tests/equipment.test.mjs`. Verify `node --test tests/equipment.test.mjs` passes.
- [x] 1.2 Extract the three-button group from `src/components/tools/StringSetFields.tsx` into `src/components/tools/StringKindPicker.tsx` and use it from there. Verify `npm run typecheck` passes and the change dialog still shows the three types and filters the catalogue as before.

## 2. Alta y edición de guitarra

- [x] 2.1 Add the picker to `src/components/tools/GuitarDialog.tsx`, load the guitar's stored type when editing and include it when saving. Verify a new guitar keeps the chosen type after reopening the form, and that editing switches it.

## 3. Cambio de cuerdas

- [x] 3.1 Give `StringSetFields` a `fixedKind` prop that hides the picker and locks the catalogue to that type, and start the draft from `guitar.stringKind` in `StringChangeDialog`. Verify a guitar with a type shows no selector and only its kind of sets.
- [x] 3.2 Persist the first choice: pass `onRememberKind` from `StringChangeDialog` and save the guitar with the chosen type in `StringsPanel`. Verify a guitar without a type shows the selector once, and after saving the change the next open shows no selector and the right catalogue.
- [x] 3.3 Remove the details field, its state and its id from `StringChangeDialog`. Verify the form shows only date, set and save, and that a note can still be added from the history.

## 4. Cierre

- [x] 4.1 Run `npm test`, `npm run typecheck` and `npm run build`, and check Tools at 320, 375, 768 and 1280 px. Verify the shorter dialog fits without overflow and the type survives a reload.
