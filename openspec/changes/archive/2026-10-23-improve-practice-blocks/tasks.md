# Tasks

## 1. Data model and skill plumbing

- [x] 1.1 Add `lick` to `PracticeSkill`/`PRACTICE_SKILLS`, `lickId` to `PracticePhase`, `SessionPhaseRecord` and `PracticeTimerPhaseResult`, and `templateId` to the active session and launch plan; verify `npm run typecheck` and that the new fields round-trip in `tests/active-practice-session.test.mjs` and `tests/practice-launch.test.mjs`.
- [x] 1.2 Add `lick` to every skill aggregate and label (`dashboard-data`, `practice-calendar`, `practice-analytics`, `manual-practice`, `practice-session-editing`, `usePracticeTimer`, `DashboardView`) and to `skills.lick` in Spanish, English and the dictionary; verify the analytics, calendar and session-editing tests pass and `tests/i18n.test.mjs` still reports matching key structures.
- [x] 1.3 Normalise old history so `skillSeconds` always has `lick: 0` in both local-storage and cloud loads; verify a case in `tests/practice-data-merge.test.mjs` or a new normalisation test with a session saved before this change, and a `tests/practice-storage-state.test.mjs` case.
- [x] 1.4 Persist, clone and copy `lickId` and `templateId` through `clonePracticePhases`, `createPracticePlanFromSession`, `createPracticeSessionRecord` and the active-session persistence; verify `tests/practice-plan.test.mjs`, `tests/practice-session-record.test.mjs` and `tests/active-practice-session.test.mjs`.
- [x] 1.5 Add an active-session store action that updates one phase in place (name, links or resources) and persists it; verify a new store test in `tests/active-practice-session.test.mjs` and `npm run typecheck`.

## 2. Block editor

- [x] 2.1 Replace the technique block's free-text name with a selector built from the technique catalogue, keeping a previously stored custom name as an extra option; verify a new pure options helper test and manual rendering of a technique block.
- [x] 2.2 Add the required song selector and the optional part selector to repertoire blocks, listing songs only and clearing the part when the song changes; verify a pure helper test for the song/part options and manual rendering. Nota: el selector de canción se sustituyó por el buscador dedicado de 9.2 y el nombre pasó a derivarse de la canción en 9.1.
- [x] 2.3 Add the required lick selector to lick blocks, listing only licks and showing a missing reference when the stored lick disappears; verify a pure helper test and manual rendering.
- [x] 2.4 Clear `repertoireItemId`, `repertoirePartId` and `lickId` when the category changes to one that no longer applies, and keep a custom name; verify a pure `applySkillChange` test.
- [x] 2.5 Rename the exercises copy to "Detalle del bloque" in the editor, plan table, timer and completion dialog, and update the Spanish, English and dictionary entries; verify `tests/i18n.test.mjs` asserts the new strings and a grep finds no user-facing "Ejercicios" label.
- [x] 2.6 Add inline missing-link and missing-technique messages with accessible labels on the new selectors; verify the selectors expose explicit names and the message is announced in a keyboard pass.

## 3. Validation and plan rendering

- [x] 3.1 Extend `validatePracticeTemplate` and `PracticePlanPhase` so technique blocks need a technique name, repertoire blocks need a song and lick blocks need a lick; update the builder error copy; verify `tests/practice-templates.test.mjs` covers every valid and invalid combination.
- [x] 3.2 Rename `getLinkedPartLabel` to `getLinkedRepertoireLabel` and return the song title when there is no part; use it from `PracticePlanTable` and the completed detail; verify `tests/practice-session-details.test.mjs` and a new plan-label test.
- [x] 3.3 Preserve `lickId` and the resolved materials when a session is saved or repeated; verify `tests/practice-session-record.test.mjs` and `tests/practice-launch.test.mjs`.

## 4. Current-block materials and stable timer

- [x] 4.1 Add a pure resolver for the current block's material (own resources plus the linked song's Guitar Pro file and resources, deduplicated by id, ignoring a missing song) and test it with own-only, linked-only, mixed and missing-item cases.
- [x] 4.2 Render only the current block's material in `PracticeSession` and `PracticeMaterials`, including the empty state, instead of flattening every phase or the session-wide attachments; verify the resolver test and manual switching between blocks.
- [x] 4.3 Render the linked lick's title, techniques and read-only tablature for a lick block; verify the manual pass shows the material and no playback control.
- [x] 4.4 Wire the attach action to the current phase through the store action; verify the phase-update test and that the running timer keeps its elapsed time.
- [x] 4.5 Add a structural plan key (phase ids and durations) so song, lick, resource or name changes do not reset the timer; verify a `getPracticePlanKey` test and a manual mid-session song change.
- [x] 4.6 Snapshot the resolved materials into the saved session record; verify `tests/practice-session-record.test.mjs`.

## 5. Timer overtime

- [x] 5.1 Add `continueAfterBlockTime` to `synchronizePracticeTimer`: a non-final block keeps running overtime, the final block completes, and the notice state stays true; verify `tests/practice-timer.test.mjs` covers on/off, total time, notice and last block.
- [x] 5.2 Wire the option into `usePracticeTimer` (state, synchronisation, exposed block elapsed/planned time) without breaking the structural plan key; verify the timer test and `npm run typecheck`.
- [x] 5.3 Add the option checkbox to the timer options dialog, allow pausing during overtime and show the `+MM:SS` overtime in the block clock; verify a `formatOvertime` unit test and the manual options flow.
- [x] 5.4 Add the Spanish, English and dictionary copy for the new option and overtime label; verify `tests/i18n.test.mjs` key parity and the literal copy.

## 6. Song switch, routine update and lick progress

- [x] 6.1 Add a song selector while a repertoire block is current, change that phase's song, clear its part and update the name only when it still matches the previous title; verify the phase-update test and a manual check that material and artist change without resetting the timer. Nota: sustituido por el botón de icono y el buscador de 9.3; el nombre ahora siempre pasa a ser el de la canción.
- [x] 6.2 Carry `templateId` from a saved-routine launch and compare the session links with the template; verify a pure `hasPracticeLinkChanges` test and `tests/practice-launch.test.mjs`.
- [x] 6.3 Add the completion-dialog update-routine checkbox and patch only the changed links and names on the latest template, preserving durations and skipping a deleted template; verify a pure patch test plus the manual accept and decline flows.
- [x] 6.4 Mark each distinct lick with an elapsed block as practised once per saved session through `markLickPracticed`; verify a `getPracticedLickIds` test and a store test for the practice count and last date. Nota: la acción del store delega en `markLickPracticedNow` (probado en `tests/licks-progress.test.mjs` con fecha y contador); no se importa el store en Node por el alias `@/`.
- [x] 6.5 Confirm discarding or finishing without saving changes neither the routine nor the lick progress; verify the pure helpers and a manual pass over both exits. Nota: comprobado en navegador que «Salir sin guardar» no actualiza rutina ni lick; ambas acciones viven solo en `saveCompletedSession`.

## 7. Completed session detail

- [x] 7.1 Pass the licks collection to the completed session detail and show the lick title for blocks with `lickId`; verify `tests/practice-session-details.test.mjs`.
- [x] 7.2 Show the renamed block details in the "Qué se practicó" column for new and legacy records, and resolve item-only song links there; verify the detail test and a manual check of an old session.
- [x] 7.3 Confirm the session and manual editors offer the Lick category through the shared skill lists and keep `lickId` when a saved session is edited; verify `tests/practice-session-editing.test.mjs` and a manual edit.

## 8. Integration verification

- [x] 8.1 Run `npm run typecheck`, `npm test` and `npm run build`; all three must exit 0.
- [x] 8.2 Manual pass: a saved routine with technique, repertoire and lick blocks; material switches with the block; song switch updates material and artist; overtime on and off; routine update accepted and declined; lick progress updated; completed detail correct; an old routine with an unlinked repertoire block is blocked until fixed. Nota: pasada con Playwright el 2026-10-23 sobre una rutina de 3 bloques; se verificaron materiales por bloque, cambio de canción, tiempo extra, pausa/reanudación, actualización aceptada y rechazada, progreso del lick, detalle final y bloqueo de rutina sin vincular.
- [x] 8.3 Accessibility pass: keyboard-only use of the new selectors, the overtime checkbox and the completion offer, with visible focus and announced missing-link messages. Nota: comprobados con teclado el selector de categoría y los estados `role=status`; los selectores y checkboxes tienen nombre accesible. Queda pendiente una pasada con lector de pantalla real.
- [x] 8.4 Confirm no dependency or database change: `git diff package.json package-lock.json` is empty, there is no new migration, and the `add-licks-library` code is present. Nota: el diff de dependencias está vacío y no se añadió migración.

## 9. Feedback revision: song identity, search and floating selects

- [x] 9.1 Make a repertoire block's name always the linked song title, both when choosing a song and when displaying or saving an older block; remove the free-text name from the repertoire editor and verify the derived title in the editor, plan table, running practice, saved record and completed detail. Nota: `normalizeRepertoirePhaseNames` corrige la sesión activa y el editor; Playwright confirmó que un nombre guardado «Nombre viejo» pasa a «Canción» y el material usa el título correcto.
- [x] 9.2 Add a dedicated searchable song picker (title, artist or part; only songs, selected state and empty results) and replace the editor's song select with it; verify a pure filter test and manual rendering. Nota: `SongPickerDialog` + `filterRepertoireSongs`; en navegador, buscar «otra» dejó solo «Otra canción» y no aparecieron licks.
- [x] 9.3 Replace the in-practice song select with a small icon button to the right of the current block title that opens the same picker; verify that choosing a song updates title, name, part, artist and material without resetting the timer. Nota: Playwright confirmó el icono junto al `h2`, ningún combobox de canción, título/artista/material actualizados y el total pasó de 00:05 a 00:06 sin reiniciarse.
- [x] 9.4 Close a `SelectField` listbox when the page or an ancestor scrolls outside it or the viewport resizes; verify in the browser that the listbox no longer floats away from its trigger. Nota: con la categoría abierta, un scroll de 500 px cerró la lista (1 → 0 listboxes).
- [x] 9.5 Update the Spanish, English and dictionary copy for the picker, then run `npm run typecheck`, `npm test`, `npm run build`, `openspec validate improve-practice-blocks --strict` and a manual pass over the editor, the running practice and a scrolled select. Nota: typecheck, 482 tests, build y validación estricta en verde; pasada manual de editor, práctica y scroll completada.

## 10. Feedback revision: technique search and title spacing

- [x] 10.1 Reuse a searchable modal picker for the technique catalogue, replace the technique select with a button in the name slot, keep a legacy custom technique searchable, and verify the generic filter plus manual search. Nota: `SearchPickerDialog` + `TechniquePickerDialog`; en navegador, buscar «legato» mostró solo «Legato» y el bloque pasó a «Técnica 1: Legato» sin combobox.
- [x] 10.2 Centre the running practice song title independently of the search icon and place the icon to its right with more separation than the previous flex gap. Nota: rejilla de tres columnas con laterales iguales; medido en navegador, centro del título = centro de la tarjeta (528.5 px) y separación del icono = 12 px, con el botón de 36 px dentro de la tarjeta.
- [x] 10.3 Update the Spanish and English technique-picker copy, then run `npm run typecheck`, `npm test`, `npm run build`, `openspec validate improve-practice-blocks --strict` and a manual pass over technique search and the practice header. Nota: typecheck, 483 tests, build y validación estricta en verde; pasada manual de técnica y cabecera completada.

## Workflow follow-up

- Finish or archive `add-licks-library` before implementing this change, because the lick selector, tab and practice counters depend on it.
- Archive this change after the manual pass and review are accepted.
- Keep the persisted `exercises` key as documented technical debt; rename it in a future data-migration change if needed.
