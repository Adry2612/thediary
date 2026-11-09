# Tasks

## 1. Current-block editor

- [x] 1.1 Add a `PracticeBlockEditDialog` with a local draft of the current `PracticePhase`: category selector, category-specific content field (song, technique, theory, lick or free name), planned minutes, details and notes; verify it reuses `applySkillChange`, `getRepertoireSongChanges`, `getCatalogSongChanges` and the existing picker dialogs.
- [x] 1.2 Add validation for missing repertoire/technique/theory/lick content and for an invalid planned duration, showing the error inside the dialog without applying the change; verify with a block that has no linked content.
- [x] 1.3 Add an edit control beside the current block title for every category, keep the existing repertoire song control, and wire the dialog's save to `updatePhase(currentPhase.id, changes)`; verify the dialog opens from the keyboard and announces its result.
- [x] 1.4 Verify Cancel discards the draft and that saving changes only the current block; verify the other blocks keep their category, links, duration, details and notes.
- [x] 1.5 Verify the timer, elapsed time, metronome and an active recording keep running while the dialog is open, that a shorter planned duration follows the waiting/overtime rules, and that a reload keeps the edited block; record the checks in `docs/practice.md`.

## 2. Skill attribution and block notes

- [x] 2.1 Change `usePracticeTimer` completion to derive `skillSeconds` from `phaseElapsedTotalsMs` and the final phase skills, so a category change attributes the whole block to its final category; update `tests/practice-timer.test.mjs` and `tests/practice-session-record.test.mjs`.
- [x] 2.2 Add `notes?: string` to `PracticePhase` and `PracticeTimerPhaseResult`, copy the phase notes into the result, and seed `PracticeCompletionDialog`'s `phaseNotes` from the result when it opens; verify a note pre-fills once and can still be edited.
- [x] 2.3 Verify a cleared note is not stored and that edited notes survive a page reload while the practice is active; add the case to `tests/active-practice-session.test.mjs`.

## 3. Saved-practice editor pickers

- [x] 3.1 Replace the free-text name with the searchable technique picker for technique blocks and the theory picker for theory blocks in `SessionEditor`, passing the stored name as the selected value; verify a custom stored name remains selectable and displayed as stored.
- [x] 3.2 Keep the saved-repertoire and catalog song search for repertoire blocks, keep free text for lick and improvisation, and clear song, part and catalog links when the category leaves repertoire; verify with `tests/practice-session-editing.test.mjs`.
- [x] 3.3 Verify a saved practice opens, edits a technique block, a theory block and a repertoire block and saves without changing the practice identity; confirm the totals and per-category split reflect the edit.

## 4. New routine from a template

- [x] 4.1 Separate the template picker value from the save target in `PracticePlanBuilder` and add `getRoutineSaveTarget(editingTemplateId, newId)`; verify with unit tests for new-routine, first-save and second-save cases.
- [x] 4.2 Make selecting a template while creating an unsaved routine copy its content without marking it as the routine being edited, and keep the delete action bound to the edited routine only; verify the source template is never deleted or overwritten before the first save.
- [x] 4.3 Verify saving the new routine creates a new identity, the template and the new routine both appear in the list, editing an existing routine still updates it, and a second save updates the routine created by the first.
- [x] 4.4 Confirm the name is kept as an editable starting point and that no automatic suffix or rename is applied; verify two routines with the same name are allowed and listed separately.

## 5. Documentation and integration

- [x] 5.1 Update `docs/practice.md` with the current-block editor, its timer behaviour, the category attribution rule, block notes, the saved-practice pickers and the template-copy semantics; verify every statement matches the built screens.
- [x] 5.2 Run `npm test`, `npm run typecheck` and `npm run build`; verify all three finish green.
- [x] 5.3 Review the running-practice editor at 390 and 1280 px with every category, with a recording and the metronome active, and review the saved-practice editor and the new-routine flow; verify no overflow, no lost edits and no template overwrite.

## Workflow follow-up

- Archive the change after the project's review requirements are satisfied.
- Verify the archived spec no longer describes technique and theory as free text in the saved-practice editor.
