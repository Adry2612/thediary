# Tasks

## 1. Lick types and global catalogues

- [x] 1.1 Add `src/types/lick.ts` with `TechniqueId`, `MusicalKey`, `BpmLogEntry` and `GuitarLick` (optional `key`, `targetBpm`, `currentBpm`, `lastPracticedAt` and `associatedSongId`; required `tabContent`, `techniques`, `bpmHistory`, `createdAt`, `practiceCount`), and verify `npm run typecheck` accepts it.
- [x] 1.2 Add `src/lib/licks/techniques.ts` with the ten technique ids, their glyphs and label keys, and `src/lib/licks/keys.ts` with the 24 musical keys, each as a single exported catalogue and a validation helper; verify a new node test asserts every id has a label key and that unknown values are rejected.
- [x] 1.3 Add the `licks` copy to `src/i18n/es.ts` and `src/i18n/en.ts`: navigation entry, page titles, editor labels, the ten technique names, chart labels, forgotten-lick copy, empty states and delete confirmation; verify `node --test tests/i18n.test.mjs` passes and both dictionaries expose the same keys.

## 2. Pure lick logic and tests

- [x] 2.1 Implement `normalizeLick`/`normalizeLicks` in `src/lib/licks/normalize.ts`: invalid key, technique, BPM, date and count values are discarded individually while the lick survives; `currentBpm` mirrors the last history entry; history is sorted oldest-first; entries outside 40–240 BPM are dropped. Verify with `tests/licks-normalize.test.mjs`.
- [x] 2.2 Implement `recordLickBpm` and `markLickPracticed` in `src/lib/licks/progress.ts`, appending an entry, updating current BPM, last-practised date and count only as specified. Verify tests cover a valid entry, an out-of-range value, an optional note, and that marking practised leaves BPM and history untouched.
- [x] 2.3 Implement `getLickProgress` in `src/lib/licks/progress.ts` (first/current BPM, optional target, capped percentage). Verify tests cover no history, no target, one entry, below target, exactly at target and above target.
- [x] 2.4 Implement `getForgottenLick` in `src/lib/licks/forgotten.ts` with the overdue-first rule, the frequency tie-break, exclusion of licks created today that were never practised, and stable tie-breaking; verify tests cover overdue, low-frequency, brand-new, tie and empty cases, plus a fixed clock.
- [x] 2.5 Implement `getTechniqueDistribution` and `getKeyDistribution` in `src/lib/licks/distribution.ts`, counting multi-technique licks once per technique and grouping unclassified licks. Verify tests cover single, multiple, unclassified, mixed and empty libraries.
- [x] 2.6 Implement `repertoireTabToText` in `src/lib/licks/tab-text.ts` from the structured `RepertoireTab`: six string rows with tuning gutter, fixed-width fret columns, `x` for dead notes, technique glyphs on their note, measure separators and preserved alignment. Verify `tests/licks-tab-text.test.mjs` covers a simple riff, dead notes, a technique, several measures, an empty tab and a single-string note.

## 3. Persistence, migration and store actions

- [x] 3.1 Add `licks` to `PersistedPracticeState`, the zustand `partialize`, `getPersistedPracticeState` and `replacePracticeState`; verify `npm run typecheck` and `tests/practice-storage-state.test.mjs` still pass.
- [x] 3.2 Add `saveLick`, `deleteLick`, `recordLickBpm` and `markLickPracticed` actions to `src/stores/usePracticeStore.ts`, delegating to the pure helpers; verify `npm run typecheck` and a manual create/edit/delete round-trip that survives a reload.
- [x] 3.3 Extend `normalizePracticeStorageState`, `normalizePracticeData`, `mergePracticeData`, `createEmptyPracticeData`, `hasPracticeData`, `hasPracticeStateChanged`, `toPersistedSnapshot` and the provider's snapshot comparisons with the licks collection. Verify `tests/practice-data-merge.test.mjs` and `tests/practice-data-state.test.mjs` gain cases for merging licks by id, an old blob without licks, and a licks-only guest state being offered for import.
- [x] 3.4 Add `migrateRepertoireLicks` to `src/lib/licks/migration.ts` and call it from both normalization entry points; migrate kind-lick items to licks with preserved id/title, converted tab, empty classification and no practice history, remove them from the repertoire, keep songs untouched, and leave an item in place if its conversion throws. Verify tests cover a legacy lick, a legacy song, idempotent second run and a conversion failure.
- [x] 3.5 Verify the migration through the real load paths: seed a local storage blob containing a legacy lick, load the app, and confirm the lick appears in `/licks` and not in `/repertoire`, the title and tab text match, and a reload does not duplicate it; record the checked counts in the change if they differ from the fixture.

## 4. Licks library UI

- [x] 4.1 Create `src/app/(workspace)/licks/page.tsx` and `loading.tsx` with the page header, summary counts, dashboard slot and the list, following the workspace page conventions; verify the route renders for a guest and for a signed-in user.
- [x] 4.2 Create `LickCard` with title, monospaced tab preview, key, technique chips, target/current BPM and last-practised text, plus open/edit/delete actions; verify it renders a lick with full data, a keyless and technique-less lick, and a never-practised lick.
- [x] 4.3 Create the list controller (`useLicksLibrary` or equivalent) for ordering, search and the initial chart selection, keeping calculations out of the component per `docs/component-conventions.md`; verify `npm run typecheck` and that searching hides non-matching cards without losing the selection.
- [x] 4.4 Create `LickEditorModal` with title, plain-text tab textarea (whitespace preserved), key select, technique chips with `aria-pressed`, optional song select limited to songs, and target BPM input; validate the title and the 40–240 BPM range and show field errors. Verify creating and editing a lick from the list and confirm the saved values in the card.
- [x] 4.5 Create the monospaced tab panel with horizontal scrolling and no reflow, and the digit-only highlighter utility; verify a tab with leading/trailing spaces and aligned columns renders byte-identically to its text, and add a unit test for the highlighter's tokenization.

## 5. Lick detail and speed tracking

- [x] 5.1 Create `src/app/(workspace)/licks/[id]/page.tsx` with the back link to `/licks`, full tablature, metadata, song link, edit action and delete confirmation; verify opening a lick from the list, editing it in place, and deleting it returns to the library with the lick gone.
- [x] 5.2 Add the BPM recording form (BPM + optional note), the mark-as-practised action and the readable history list; verify a recorded BPM updates current BPM, adds a dated row, increments the count, and that mark-practised changes only the date and count.
- [x] 5.3 Render the lick's own BPM chart on the detail page and confirm it never shows another lick's entries; verify with two licks and different histories, then switch between them.
- [x] 5.4 Handle a missing or deleted lick id with the project's not-found/back pattern instead of an empty page; verify a direct visit to an unknown id shows a way back and no broken chart.
- [x] 5.5 Verify deleting the linked song leaves the lick reachable with the link removed and the rest of its data intact.

## 6. Analytics views

- [x] 6.1 Create `LickBpmChart` as a hand-written SVG line chart with date and BPM axes, the dashed target line, the first/current BPM summary and the capped percentage; verify by keyboard and screen reader that the chart has a name, its values are readable as text, and a lick with one entry shows one point.
- [x] 6.2 Create `TechniquesHeatmap` with horizontal bars for techniques and a donut or bar breakdown for keys, both including an unclassified group and percentages over all licks; verify a multi-technique lick appears in each of its techniques, keyless licks stay out of named keys, and an empty library shows an empty state.
- [x] 6.3 Create `ForgottenLickWidget` showing the proposed lick's title, key, techniques, days since last practice (or "never practised") and the open/mark-practised actions; verify the card disappears or changes after marking practised and that an empty library hides it.
- [x] 6.4 Compose the dashboard on `/licks` with the forgotten widget, both distributions and the chart with its lick selector, defaulting to the most recently practised lick and falling back to the first by title; verify all widgets update after creating a lick, recording a BPM and deleting a lick.

## 7. Navigation and repertoire retirement

- [x] 7.1 Add the Licks entry to `SiteNavigation` after Repertoire, keeping both desktop and mobile menus and the existing current-section detection; verify `/licks` and `/licks/[id]` mark the section current and mobile activation closes the menu.
- [x] 7.2 Remove the lick option from `RepertoireSongForm` and the lick branch of its creation path so the form only creates songs; verify the form has no type selector, a new item is a song, and the page still saves and opens it.
- [x] 7.3 Remove lick filtering, lick counts and the type label logic from `RepertoireView`, `RepertoireItemCard`, `repertoire-filtering` and `repertoire-analytics`, while keeping `"lick"` readable in the type for legacy rows; verify the repertoire lists only songs, filters show no Licks option and totals ignore licks.
- [x] 7.4 Review every new or changed string in Spanish and English, including technique names and the forgotten card, and confirm no untranslated key ships; verify `node --test tests/i18n.test.mjs`.

## 8. Integration and regression checks

- [x] 8.1 Run `npm run typecheck` and `npm test`; verify both exit 0 with the new lick tests included and no existing test weakened.
- [x] 8.2 Run `npm run build`; verify it succeeds (client/server boundaries are not covered by typecheck).
- [ ] 8.3 Exercise the full flow on a copy of real data: migrate legacy licks, create and edit a lick, record BPM entries, mark one practised, link a song, delete the song, delete a lick, reload and sign in on a second session; verify counts, chart values and the forgotten-lick proposal match the specs at each step.
- [x] 8.4 Re-read the changed requirements in `specs/licks-library`, `specs/licks-analytics`, `specs/repertoire-library` and `specs/app-navigation` against the running app, including the empty states, unclassified groups and 30-day rule; verify each scenario is either observed or explicitly recorded as not covered by the available data.

## Workflow follow-up

- Archive the change after review and after confirming the migration was exercised on real data; take a `practice_data` snapshot before the release as the rollback path.
- Verify the archived specs no longer describe licks as repertoire items and that the new capabilities have their purpose copied into `openspec/specs/`.
