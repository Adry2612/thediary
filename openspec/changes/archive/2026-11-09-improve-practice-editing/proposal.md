# Proposal

## Why

Three frictions remain around editing practices:

- During a running practice only the song of a repertoire block can be changed. Correcting a block's name, category, planned time, technique, theory, details or notes means finishing the practice and editing it afterwards.
- The saved-practice editor treats technique and theory names as free text, so editing an old practice bypasses the searchable catalogue pickers used by the routine editor and the running practice.
- Creating a new routine from a saved template marks that template as the routine being edited, so saving the new plan overwrites the original template instead of creating a new routine.

## What Changes

- **Running practice: edit the current block on the fly.** Add an edit control beside the current block title that opens a block editor for the current block only. It edits the category, the linked content (repertoire song or catalog song, technique, theory, lick or free name), the planned duration, the block details and the block notes. Changes apply immediately, the timer, elapsed time, metronome and recording keep running, the other blocks stay untouched, and a planned duration below the elapsed time follows the existing overtime rules. The saved routine is only updated through the existing routine-update offer.
- **Saved practice editor: catalogue pickers.** Technique and theory blocks use the searchable technique and theory pickers instead of a free-text name, keeping a previously stored custom name selectable and displayed as stored. Repertoire blocks keep the existing saved-repertoire and catalog song search.
- **New routine from a template.** Loading a saved template while creating a new routine copies its blocks, name and guitar into the new plan; saving creates a new routine instead of updating the template. Editing an existing routine still updates that routine, and the delete action only targets the routine being edited.
- **Block notes.** Notes edited during a running practice pre-fill the completion dialog's block notes and are saved with the practice.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `practice-session-management`: editing the current block during a running practice, catalogue pickers in the saved-practice editor, template copy semantics when creating a routine, and block notes during practice.

## Impact

- **Code**: `src/components/practice/` (`PracticeSession`, `TimerCard`, a new current-block editor, `PracticeCompletionDialog`), `src/components/dashboard/SessionEditor.tsx`, `src/components/practice/PracticePlanBuilder.tsx`, `src/stores/useActivePracticeSessionStore.ts`, `src/types/practice.ts`, `src/utils/practice-block-editor.ts`, `src/utils/practice-plan.ts`, `src/i18n/es.ts` and `src/i18n/en.ts`.
- **Tests**: `tests/practice-block-editor.test.mjs`, `tests/practice-plan.test.mjs`, `tests/practice-session-editing.test.mjs` and new tests for the current-block edits and routine save target.
- **Docs**: `docs/practice.md`.
- **Unchanged**: stored templates keep their shape, sessions keep their stored shape, the routine-update offer stays opt-in and the dashboard is untouched.
