# Proposal

## Why

A practice block is currently little more than a name and a timer: the session shows every block's material at once, repertoire and technique blocks are not tied to the real songs, licks or techniques they practise, and a block's free-text name says nothing reliable about its content. The result is that switching blocks does not switch what the user sees, time and lick progress can drift from the library, and the timer stops at zero even when the user wants to finish the passage. This change makes each block self-contained and synchronized with the user's library.

## What Changes

- Show only the current block's study material during a practice: its own resources plus the material of the repertoire item or lick it is linked to. Changing block changes the material; no other block's material is listed.
- Require each block to be linked to the right kind of real library item:
  - A **repertoire** block links one song (a part is optional), takes its block name from the song title, and only repertoire blocks can link songs.
  - A new **lick** practice category links one lick and only lick blocks can link licks.
  - A **technique** block takes its name from the predefined technique catalogue through a searchable picker instead of a select or free text.
  - Theory and improvisation blocks keep a free-text name.
  - Changing a block's category clears links that no longer apply.
- Select songs through a dedicated searchable picker instead of a long select, filtering by title, artist or part. During a running practice the picker opens from a small icon beside the current block title.
- **BREAKING**: a saved routine with a repertoire block that is not linked to a song can no longer be started until the block is linked; the editor marks the missing link.
- Rename the "Ejercicios" section to **"Detalle del bloque"** everywhere the user sees it, and keep its content flowing to the completed practice's "Qué se practicó" column. The running practice keeps showing those details, and a repertoire block also shows the linked song's artist.
- Add a song switcher to a running repertoire block, opened from a small icon beside the block title. It changes the block's song and name (and therefore its material and artist) for the current session only; if the session came from a saved routine and the links changed, the completion dialog offers to update that routine.
- Add a timer option to keep counting past a block's planned time until the user moves to the next block. The block-finished notice stays visible, the total session time includes the overtime, and the option is off by default.
- Count a completed lick block in the lick's progress: increase its practice count and update its last-practised date once per saved session, without touching its BPM history.
- Keep the completed session detail consistent: an item-only repertoire link still shows the song, a lick link shows the lick, and the block details are shown.

Out of scope:

- Playing or synthesizing a lick's tablature during the session; the lick is shown as reference material, without playback.
- Changing the material of a song or lick from the practice screen; only the block's own resources can be attached, and the linked item keeps its library material.
- Editing a saved routine from anywhere other than the end-of-session update offer.
- Recording BPM entries automatically from a lick block.
- Changing the per-note techniques of the song tab editor.

## Capabilities

### New Capabilities

- `lick-practice`: linking a practice block to a lick, showing the lick as the block's material, keeping the reference in the session history, and counting the completed block in the lick's progress.

### Modified Capabilities

- `practice-session-management`: block design (technique names, required repertoire links, block details), block-scoped material, the repertoire song switcher and routine update, the timer's overtime option, and the completed session's block detail.

## Impact

- `src/types/practice.ts`: the `lick` practice skill; `lickId` on practice phases and session phase records; template identity on the active session.
- `src/utils/practice-timer.ts`, `src/hooks/usePracticeTimer.ts`, `src/utils/format.ts`: overtime mode, stable plan across content changes, and the overtime display.
- `src/components/practice/*`: phase editor, plan builder/table, session, timer card, completion dialog, materials, lick tab rendering and the new searchable song picker.
- `src/components/ui/SelectField.tsx`: close the portalled listbox when the page or an ancestor scrolls or the viewport resizes.
- `src/utils/practice-templates.ts`, `practice-plan.ts`, `practice-launch.ts`, `practice-session-record.ts`, `practice-session-details.ts`, `repertoire-filtering.ts`: validation, plan links, saved records, resolved labels and song search.
- `src/stores/useActivePracticeSessionStore.ts` and `usePracticeStore.ts`: phase updates during a session, template updates and lick practice marking.
- `src/utils/dashboard-data.ts`, `practice-analytics.ts`, `practice-calendar.ts`, `manual-practice.ts`, `practice-session-editing.ts` and the dashboard components: the new `lick` skill in labels, colours, totals and editors.
- `src/stores/normalizePracticeStorageState.ts` and `src/services/supabase/practice-data.ts`: normalise old sessions so the new skill key is always present, and preserve the new optional links.
- `src/i18n/es.ts`, `src/i18n/en.ts` and the dictionary: renamed block-detail labels, the Lick category and the timer option copy.
- Tests under `tests/` for validation, timer overtime, session records, labels, normalisation and lick progress.
- Builds on the in-flight `add-licks-library` change; it does not add a database migration because all new fields travel in the existing JSON practice state.
