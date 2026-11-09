# Design

## Context

See `proposal.md` - Why. Current state that shapes the approach:

- `PracticeSession` reads the active phases from `useActivePracticeSessionStore` and updates them through `updatePhase`. The store persists the whole active session, so changing a phase survives a reload.
- `TimerCard` already shows a small song-picker control beside the current block title for repertoire blocks and owns the practice-settings dialog.
- `PracticePhaseEditor` is the inline editor used by the routine builder; it already composes `SongPickerDialog`, `TechniquePickerDialog`, `TheoryPickerDialog`, `PracticeExerciseEditor` and `PracticeResourceEditor`.
- `SessionEditor` edits a saved practice through `EditableSessionBlock` and renders a free-text name for every category.
- `PracticePlanBuilder` keeps one `selectedTemplateId`; `handleSaveTemplate` treats any non-empty value as "update this template". The template dropdown and the `initialTemplateId` effect both set it, so selecting a template while creating a new routine turns the save into an overwrite.
- `PracticeCompletionDialog` starts with empty `phaseNotes`; `PracticeTimerPhaseResult` carries no notes.
- `usePracticeTimer` accumulates `skillElapsedMs` by the phase skill at each tick and copies it into the result at completion.

## Goals / Non-Goals

**Goals:**

- Edit the current block from the running practice without interrupting it.
- Reuse the existing catalogue pickers and block-detail editor instead of duplicating their logic.
- Make "new routine from a template" and "edit existing routine" unambiguous.
- Keep the session and template shapes backward compatible.

**Non-Goals:**

- Editing upcoming blocks or the whole plan from the running practice.
- Adding a year option to the tempo card or changing the dashboard.
- Extending the routine-update offer beyond the existing link changes.
- Editing a saved practice's exercises or resources (only the catalogue pickers are added there).

## Decisions

### D1 - One current-block editor dialog, reusing the shared pickers

Add `PracticeBlockEditDialog` with a local draft of the current `PracticePhase`. It renders the category selector, the category-specific content field (song picker for repertoire, technique picker, theory picker, lick select or free name), the planned minutes, `PracticeExerciseEditor` for details and a notes textarea. On save it returns a `Partial<PracticePhase>` to `PracticeSession`, which calls `updatePhase(currentPhase.id, changes)`.

- The dialog owns the draft, so Cancel discards and does not touch the active session.
- The existing quick song control stays; the edit control is added beside the title for every category.
- `applySkillChange`, `getRepertoireSongChanges`, `getCatalogSongChanges` and the existing part/lick option helpers are reused, so link clearing and name rules stay in one place.
- Validation mirrors the routine editor: a repertoire, technique, theory or lick block needs its linked content; the planned duration stays within the accepted minutes range.

Alternative considered: reuse `PracticePhaseEditor` directly inside the dialog. Rejected because it also renders remove/resource controls and is coupled to the builder's layout; a focused dialog is smaller and easier to keep accessible.

### D2 - Editing does not restart the timer

The editor only replaces the phase object in the active store. The timer keeps its own runtime (elapsed, current index, waiting/overtime state) keyed by phase id and duration, so the running practice continues. A shorter planned duration is picked up by the next tick and follows the existing waiting/overtime rules. The metronome and the recorder are independent of the phase object and keep running.

### D3 - Category changes attribute the whole block to the final category

`usePracticeTimer` currently splits a block's seconds across skills if the skill changes mid-block. That would leave the saved block with one category but the session totals split between two. Change completion to derive `skillSeconds` from `phaseElapsedTotalsMs` and the final `phasePlan` skills, so a block's whole elapsed time belongs to the category it has when the practice ends. `skillElapsedMs` stays in the runtime because the timer storage validates against it.

Alternative considered: keep the split and document it. Rejected because the saved phase and the session totals would disagree, which the dashboard would surface as two different stories for the same practice.

### D4 - Block notes travel with the phase and pre-fill the completion dialog

Add `notes?: string` to `PracticePhase` and `notes?: string` to `PracticeTimerPhaseResult`. `usePracticeTimer` copies the phase notes into the result, and `PracticeCompletionDialog` seeds its `phaseNotes` state from the result when it opens. `createPracticeSessionRecord` already stores `phaseNotes`, so the saved practice keeps the edited notes. Older templates and sessions simply have no `notes`.

### D5 - Routine save target is explicit

`PracticePlanBuilder` separates the picker value from the save target:

- `selectedTemplateId` remains the template shown in the dropdown.
- `editingTemplateId` is the routine a save updates; it starts as `initialTemplateId` and stays `null` while a new routine has never been saved.
- Selecting a template while `editingTemplateId` is `null` copies its content and keeps `editingTemplateId` empty. Selecting one while editing an existing routine switches the edited routine, as before.
- `getRoutineSaveTarget(editingTemplateId, newId)` returns `{ id, isUpdate }`; saving a new routine creates a new id and then stores it in `editingTemplateId`, so a second save updates the routine created by the first.
- The delete action is rendered only when `editingTemplateId` is set, so a loaded source template cannot be deleted from the new-routine editor.

Alternative considered: always create a new routine when the builder was opened as new, even after the first save. Rejected because "save twice updates the same routine" is the expected behaviour and avoids accidental duplicates.

### D6 - Saved-practice editor adopts the catalogue pickers

`SessionEditor` replaces the free-text name field for technique and theory with the same picker buttons and dialogs used by the routine editor. The stored name is passed as `selectedTechnique` / `selectedTheory`, so a custom stored name remains selectable and is displayed as stored. Repertoire keeps its existing song picker (saved repertoire + catalog search); lick and improvisation keep free text.

## Risks / Trade-offs

- **A dialog open while the timer runs can distract** → Keep the dialog compact, show the current elapsed/remaining time in it, and never auto-pause; the user can close it at any moment.
- **Category reattribution changes skill totals for edited blocks** → Intended; cover it with timer tests and a note in `docs/practice.md`.
- **Adding `notes` to the phase shape touches templates and sessions** → The field is optional, cloning already spreads the phase, and old data decodes without it.
- **The template dropdown after the first save still switches the edited routine** → Document the behaviour and verify that the source template is never deleted or overwritten before the first save.
- **UI-only paths have no component test harness** → Extract the save target and block-change rules into pure helpers with unit tests, and verify the dialogs manually at phone and desktop widths.

## Migration Plan

No data migration. New optional `notes` fields are backward compatible; existing templates and sessions keep working. If rolled back, the extra note field is ignored by older clients.
