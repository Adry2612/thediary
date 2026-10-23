# Design

## Context

See `proposal.md` — Why. The current practice flow stores a block as a name, category, duration, free-text details, resources and an optional `repertoireItemId`/`repertoirePartId`. The editor offers a part selector for every category, the session flattens every phase's resources into one panel, and the timer resets when the `phases` array identity changes. This change builds on the in-flight `add-licks-library` collection (`GuitarLick`), which already has techniques, tablature and practice counters but no practice-block integration.

## Goals / Non-Goals

**Goals:**

- Make the practice block the unit that owns its material, its library link and its display name.
- Keep the timer running safely while a block's content (song, lick, resources) changes mid-session.
- Keep saved routines, saved sessions and cloud data readable without a database migration.
- Add the `lick` skill to the existing analytics and editors with the least possible surface change.

**Non-Goals:**

- Reworking the lick editor, tab playback or BPM tracking.
- Editing a routine from the practice screen beyond the end-of-session offer.
- Migrating the persisted key `exercises` to a new name; only the user-facing copy changes.
- Storing a derived technique id for analytics.

## Decisions

### D1: A new `lick` practice skill, not a second kind of repertoire block

Add `lick` to `PracticeSkill` and to every skill list (analytics, calendar, manual entry, session editor, timer, labels, colours). A lick block owns a `lickId` and only lick blocks can carry one. Reusing the repertoire category would force the selector to mix songs and licks, break the "song only" rule the user asked for, and make the skill distribution lie about what was practised.

Consequence: old `SessionRecord.skillSeconds` objects do not have the `lick` key. Normalise them on load (D10) instead of relying on every consumer to guard with `?? 0`.

### D2: Keep `exercises` as the persisted field, rename only the copy

The field continues to be stored as `exercises` in phases, templates, active sessions and saved records. The editor, plan table, timer and completion copy call it "Detalle del bloque"; the new-entry labels become "Nuevo detalle", "Añadir detalle" and "Quitar detalle". Renaming the key would require migrating local storage, cloud JSON, active sessions and every consumer for no user-visible gain. The technical mismatch is documented and can be cleaned up in a dedicated data-migration change.

### D3: Technique names come from the catalogue, stored in `name`

The technique block replaces its free-text name input with a button that opens a searchable picker over the `LICK_TECHNIQUES` labels from the `licks` i18n section. Choosing one writes the label into `PracticePhase.name`, so the plan table, timer, session record and route header keep working with no new field. If a saved technique block already has a name outside the catalogue, that name is appended to the picker list so old routines are not destroyed; the user can then pick a catalogue technique. No `techniqueId` is stored: the app already treats user-authored plan text as data, not as a translated token, and the request is about choosing a predefined name, not about cross-language analytics.

Alternative considered: a `techniqueId` field plus derived labels. It would survive a locale change but adds a field to every phase, session record and template and requires fallbacks everywhere; rejected for this change.

### D4: Required links by skill and a derived repertoire name

- `technique`: `name` must be non-empty (chosen from the catalogue through the search picker in new data).
- `repertoire`: `repertoireItemId` required; `repertoirePartId` optional. The picker lists only `RepertoireItem`s with `kind === "song"`. A separate optional part selector is filtered by the chosen song. The block name is always the linked song title and is not independently editable; choosing a song writes its title into `PracticePhase.name`, so the plan table, timer, session record and route header keep working without another field. A legacy block whose name differs is displayed and saved with the song title; the stored value is corrected when the editor, the active session or the song changes.
- `lick`: `lickId` required; the selector lists only the licks library.
- `theory` / `improvisation`: free-text `name` required.

Changing the category clears links that no longer apply (`repertoireItemId`, `repertoirePartId`, `lickId`) so a theory block cannot keep a hidden song. `validatePracticeTemplate` enforces the per-skill rule; switching a saved routine to an invalid state blocks starting it. The editor shows an inline missing-link message rather than only the builder's generic error.

`getLinkedPartLabel` becomes `getLinkedRepertoireLabel` and returns the item title when there is no part. Since the song title is now the block title, the plan table and completed detail only add a part line when the block actually has a part. `getPracticeBlockTitle` resolves a repertoire block to its song title for every display that only has the phase and the library, and `normalizeRepertoirePhaseNames` keeps the stored name aligned.

When the user chooses a **lick** and the block name is empty or still equals the previously linked item's title, the editor sets the name to the new item's title so the block reads as the item. A custom lick block name is never overwritten. For repertoire blocks there is no conditional: the song title always wins.

### D5: Material is resolved for the current block at render time, snapshotted when saved

`PracticeSession` passes only the current phase to `PracticeMaterials`. The displayed material is the deduplicated union of:

1. `phase.resources` (the block's own attachments), and
2. the linked song's `guitarPro` plus `resources`, when the phase has a `repertoireItemId`.

Lick blocks render the linked lick's title, techniques and `LickTab` above the resource panel instead of embedding the tab as a resource. `LickTab` is read-only and already used by the licks library, so no playback is introduced.

`ActivePracticeSession.attachedResources` is no longer rendered as a second, session-wide list. The attach action in the panel writes to the current phase's `resources` through a new active-session store action; this keeps the material with the block and avoids a session-level bucket that contradicts "only this block". When the practice is saved, `createPracticeSessionRecord` receives the resolved materials and stores a snapshot in the saved phase, so the completed detail still lists what was seen even if the song is edited later.

Alternative considered: copying the linked item's material into `phase.resources` when the song is chosen. It makes switching songs harder to undo (which resources were the song's and which the user's?) and duplicates data; dynamic resolution plus a save-time snapshot is cleaner.

### D6: Keep the timer stable across content changes

`usePracticeTimer` currently resets its runtime whenever the `phasePlan` identity changes. The song switch, the attach action and the name update all change the active session's phases. Add a structural key — phase ids plus durations plus count — and use it as the reset dependency; keep building the full latest plan for display, sound, `currentPhase` and the saved record. A content-only change (song, lick, resources, name) then updates the UI without touching elapsed time or the phase index. A structural change (add/remove block or edit its duration) still resets as before.

Alternative considered: keeping the session phases immutable and layering display overrides in `PracticeSession`. It avoids touching the hook but duplicates the source of truth and loses the changes on reload; the structural key keeps one source of truth.

### D7: Overtime is a timer option, not auto-advance

Add `continueAfterBlockTime` to `usePracticeTimer` (default `false`, session-local like `autoAdvance`) and a `continueAfterBlockTime` argument to `synchronizePracticeTimer`. For a non-final block with the option on, reaching the planned time sets `awaitingPhaseAdvance: true` but keeps `isRunning: true`; `phaseElapsedMs`, `skillElapsedMs` and the total keep growing. The block-complete notice stays visible because it is driven by `awaitingPhaseAdvance`; the primary button becomes "Pausar" and must stop being disabled while overtime runs. `skip` advances and resets the block. The final block keeps the existing completion behavior. Expose `phaseElapsedSeconds` and the block's planned seconds so the card can show `+MM:SS` overtime; the total line already shows the session elapsed.

Alternative considered: counting only the session total while the block clock freezes at zero. The user explicitly chose overtime in the block, and the stored block time is what feeds the per-skill and per-item analytics.

### D8: Track the source routine and offer a link-only update at the end

`PracticeLaunchPlan` and `ActivePracticeSession` gain an optional `templateId`. It is set only by `createTemplatePlan` (saved routine) — not by quick practice, quick repertoire or repeat session. At completion, `PracticeSession` re-reads the template from the store and compares the session phases with the template phases on `repertoireItemId`, `repertoirePartId`, `lickId` and `name`. If any differ, the completion dialog shows a checked-by-default checkbox "Actualizar la rutina «…»". On save with the checkbox on, patch only those fields on the latest template (re-read at that moment) and call `saveTemplate`; durations and unrelated edits made elsewhere are preserved. If the template was deleted, the offer is not shown. Discarding the session never updates the routine.

Alternative considered: updating the routine immediately on each song switch. It would silently rewrite a saved routine on a passing experiment, which the user explicitly did not want.

### D9: Lick progress is a saved-session side effect

After a practice is saved successfully, collect the distinct `lickId`s of phases with `elapsedSeconds > 0` and call `markLickPracticed` once per lick. This updates `lastPracticedAt` and increments `practiceCount`; it does not touch `currentBpm`, `targetBpm` or `bpmHistory`. `sessionSavedRef` already guarantees the save runs once. Discarding, finishing without saving or repeating a session during the timer does not call it.

### D10: Compatibility and normalisation

- All new fields (`lickId`, `templateId`) are optional; old routines, sessions, templates and active sessions load unchanged.
- `normalizePracticeStorageState` and the cloud `normalizePracticeData` fill missing `skillSeconds.lick` values with `0` for old session records, so analytics never divide by `undefined`. A shared session normaliser keeps both paths aligned.
- The new `lick` skill is added to every hardcoded skill record: `dashboard-data`, `practice-calendar`, `practice-analytics`, `manual-practice`, `practice-session-editing`, `usePracticeTimer` and `DashboardView`.
- No database migration is needed: the new fields travel in the existing JSON `state` column and the existing per-user row.
- This change assumes the `add-licks-library` code is present. If that change is archived after this one, its migration must not strip `lickId` from sessions; the merge/normalise functions must keep unknown optional phase fields.

### D11: A dedicated searchable picker for songs and techniques

The repertoire selector becomes a modal picker shared by the block editor and the running practice. It filters songs by title, artist and part name with accent-insensitive search, shows the current selection, and closes on choice or Escape. In the editor it replaces the song select in the name slot, so the visible block identity is the song title. In the running practice there is no inline select: a small search icon to the right of the current block title opens the same picker; choosing a song updates the title, name, part, artist and material without resetting the timer.

The technique selector uses the same `SearchPickerDialog`: a button in the name slot opens a searchable list of the technique catalogue, plus a legacy custom name when the routine has one. The picker component only knows about `SearchPickerItem`s (`id`, `label`, optional description and extra search text), while `SongPickerDialog` and `TechniquePickerDialog` map their domain items and copy into it. The shared filter is accent- and case-insensitive.

Why: a select stops being usable when the repertoire or technique catalogue grows, and a dedicated picker gives room for search and the selected state. Reusing one component keeps the flows consistent and leaves the timer card free of a large form control.

The running practice title sits in the centre column of a three-column grid: equal side columns keep the song name geometrically centred even when the search button occupies the right column. The button keeps a `ml-3` separation (slightly wider than the old flex gap) and the button stays out of the title's measured centre.

### D12: A portalled select closes when its anchor moves

`SelectField` renders its listbox in a fixed portal positioned from the trigger when opened. The listbox does not follow page or container scrolling, so it can appear detached. While open, close it on any scroll outside the listbox and on viewport resize; internal listbox scrolling keeps it open. Closing is predictable and simpler than recalculating a fixed position on every scroll event, and it applies to every select in the app.

## Risks / Trade-offs

- **Required repertoire links invalidate old routines** → The editor shows the missing link inline and the start action explains it; the block remains editable. Old routines that linked a part remain valid because they already carry the item id. This is the intended breaking behaviour.
- **A content change mid-session resets the timer** → Covered by the structural key and a test that updates a phase's song/name without changing elapsed time.
- **The new skill breaks old analytics or persistence** → Normalise `skillSeconds` on both local and cloud load, and test an old session without the `lick` key.
- **Updating a routine overwrites unrelated edits** → Patch only links/names on the latest template instead of replacing its phases; skip if it no longer exists.
- **The linked song/lick changes in another tab during a session** → The session snapshots the resolved material when saved; the live panel may show the newer library state, which is acceptable for a practice screen.
- **Deleting a lick leaves a dangling reference in a routine** → The editor treats it like the existing missing repertoire reference: disabled current value, required replacement, historical block name kept in saved sessions.
- **A derived song name surprises a user who edited the old name** → Repertoire blocks no longer expose a free-text name; the song title is the single source of truth. Lick blocks keep their conditional title adoption.
- **A modal picker adds a step for small libraries** → The search input is focused on open and the full list is visible by default, so choosing from a short library is still one click. The icon keeps the running practice compact.
- **Rollback** → Old code ignores `lickId`/`templateId`, but a session containing the new `lick` skill would be rejected by the old validator and would show an unknown category. Rolling back after users create lick blocks is not fully safe; ship the licks library first and treat this change as forward-only.
- **Accessibility** → The song and technique pickers are native dialogs with labelled search fields, focus moved into the search input and Escape handled from both the dialog and the input; the lick selector reuses `SelectField` with an explicit label. The new timer option is a checkbox with a visible label, and the completion offer is a checkbox. The existing dialog focus and Escape behaviour is unchanged.

## Migration Plan

1. Ship the `add-licks-library` change first (already in progress) so `GuitarLick` and its store exist.
2. Add the optional fields and the `lick` skill with normalisation; old data keeps loading.
3. Update the editor and validation; old routines with unlinked repertoire blocks show the missing link and must be fixed by the user.
4. Update the session flow: stable timer plan, current-block materials, song switch, overtime, routine offer and lick progress.
5. Verify `npm run typecheck`, `npm test` and `npm run build`, then do a manual pass over a saved routine, a quick repertoire practice, a lick block and the completed detail.

Rollback: revert the change. No schema rollback is needed; new optional fields are ignored. New `lick` blocks created by users would not be usable by the old code, so rollback is only safe before lick blocks are saved.
