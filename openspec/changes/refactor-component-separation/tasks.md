# Tasks

## 1. Baseline and conventions

- [x] 1.1 Confirm the starting point is green before touching anything: run `npm run typecheck`, `npm test` and `npm run build` and record the results; verification is that all three exit 0 with no new warnings, so any later failure is attributable to this change.
- [x] 1.2 Write `docs/component-conventions.md` capturing design decisions D1–D3 and D8: what a component file may contain, the `types → lib → hooks → ui → domain → app` direction, "a component's own props stay with it", the two-call-site rule for new variants and the byte-identical class parity requirement, and the `"use client"` rule; verification is that the document's rule for each layer matches design.md D1–D3/D8 (read both side by side).

## 2. Wave 1 — logic into `lib` and `types`

- [x] 2.1 Add `errorMessage(error, fallback)` to `src/lib/` and a `node --test` case for `Error`, non-`Error` and `undefined` inputs; verification: `node --test tests/error-message.test.mjs` passes.
- [x] 2.2 Add `updateById`/`removeById` collection reducers to a new `src/lib/practice-track-updates.ts` with tests for missing ids and empty collections; verification: new test file passes and `npm run typecheck` stays green.
- [x] 2.3 Extend `src/lib/practice-calendar.ts` with `toDateKey`, `parseDateKey`, `formatDate`, `createCalendarCells`, `getMonthMarkers`, `getLatestPracticeDateKey` and tests incl. month/year boundaries and local-time (not UTC) parsing; verification: new test cases pass. Do not yet remove the local copies in the 4 components (that is 5.13).
- [x] 2.4 Move `TabEditor`'s constants and geometry (`MIN_MEASURES`, `MAX_MEASURES`, `LABEL_WIDTH`, `STRING_ROW_HEIGHT`, `MIN_CELL_WIDTH`, `MIN_CELL_WIDTH_FLOOR`, `BEND_AMOUNT_LABELS`, `clampCell`, `cellCenterX`, `stringRowY`, `selectionBounds`, `isCellSelected`, cell-column math) into `src/lib/repertoire-tab.ts` and add tests for the selection bounds and clamping edge cases; verification: new test cases pass; existing `repertoire-tab` tests still pass.
- [x] 2.5 Consolidate `COMMON_TUNINGS` (duplicated in `RepertoireItemCard.tsx` and `RepertoireSongForm.tsx`) into `src/lib/repertoire-item.ts` with a test asserting the tuning list contents; verification: test passes.
- [x] 2.6 Add `buildRepertoireExtraConfigUpdates(overrides, current)` to `src/lib/repertoire-item-editing.ts`, covering the validation + diffing + capo-bounds logic behind `saveExtraConfig`; tests for valid/invalid capo and no-op diffs; verification: new cases pass.
- [x] 2.7 Move `createBlockDraft` and `toLocalDateTimeInputValue` from `ManualPracticeEntry.tsx` into `src/lib/manual-practice.ts` and reconcile `ManualPracticeBlockDraft` with the existing `ManualPracticeInput` instead of keeping two shapes; verification: tests for draft creation and the datetime input value pass, and `manual-practice` tests still pass.
- [x] 2.8 Move `TEMPO_RAMP_INTERVAL_MAX_VALUES` into `src/lib/metronome-tempo-ramp.ts` and `SUBDIVISION_NOTE_POSITIONS` beside its renderer (5.6); verification: test asserting the max values per unit passes.
- [x] 2.9 Add `formatDateLabel` and `formatTotal`/`formatExactDuration` to `src/lib/format.ts` with tests pinned to an explicit locale and timezone; verification: tests pass deterministically.
- [x] 2.10 Create `src/lib/practice-resources.ts` exporting the single `RESOURCE_LABELS` map (currently duplicated in `PracticeMaterials.tsx` and `PracticeResourceEditor.tsx`) with a test asserting every `PracticeResource['kind']` has a label; verification: test passes and the test would fail if a new kind were added without a label.
- [x] 2.11 Create `src/lib/account-validation.ts` for the password-match and typed-confirmation (`BORRAR`) rules currently inline in `SettingsView`'s dialogs, with tests for empty, mismatched and matching input; verification: tests pass.
- [x] 2.12 Create `src/lib/practice-data-state.ts` for `hasPracticeData`, `hasPracticeStateChanged` and `toPersistedSnapshot` extracted from `AppDataProvider`, with tests over empty/partial/full snapshots; verification: tests pass.
- [x] 2.13 Create `src/lib/tutorial-layout.ts` for the tour placement math and spotlight bounds extracted from `TutorialProvider`, with tests for each edge of the viewport and for a missing target; verification: tests pass; `tests/tutorial-steps.test.mjs` still passes untouched.
- [x] 2.14 Move `src/components/repertoire/difficulty-labels.ts` to `src/lib/difficulty-labels.ts` and update every importer; verification: `npm run typecheck` green and a repo grep shows no remaining import from `components/repertoire/difficulty-labels`.
- [x] 2.15 Add `src/types/dashboard.ts` (`PracticeTooltipDay`, `CalendarCell`, `ChartTooltip`, `GoalControl`), `src/types/app-data.ts` (`ImportedDataCounts`, `AppDataContextValue`), `src/types/tutorial.ts` (`TargetBounds`, `ViewportSize`, `TutorialText`, `TutorialContextValue`, `PendingTutorialTransition`) and `src/types/metronome.ts`, each moving only domain data per D2; verification: `npm run typecheck` green and no prop interface was moved (spot-check `PracticeTooltipDay` is the only exported one).
- [x] 2.16 Re-run `npm run typecheck` and `npm test` and confirm wave 1 endpoints: no component file has lost a `data-tour-target`, `aria-*` attribute or `role` (compare `git diff` for those strings); verification: diff review shows zero changes to those attributes in this wave.

## 3. Wave 2 — shared UI primitives

- [x] 3.1 Extend `ui/Card` and `ui/Block` with `tone` (`light`/`dark`/`danger`), `padding` (`sm`/`md`/`lg`) and keep `as`; each variant's class string must equal the source string it will replace (light `rounded-xl border border-line bg-surface p-8 sm:p-10`, dark `border-zinc-800 bg-zinc-900`); verification: byte-identical class parity for each variant against the grepped source strings, `npm run typecheck` green.
- [ ] 3.2 Extend `ui/Button` with `icon`, `link` and `danger` variants and add `ButtonLink` for `Link`-rendered CTAs; verification: class parity against the hand-rolled variants it replaces (icon-only `size-10`/`size-11 border border-line`, destructive `border-red-400/40 text-red-300`), `npm run build` green.
- [ ] 3.3 Consolidate icons in `ui/icons.tsx`: `ChevronIcon`, `SettingsIcon`, `DeleteIcon`, play/pause, replacing the private definitions in `RepertoireItemCard`, `TimerCard`, `SiteNavigation`, `CollapsibleSection`, `RepertoireSongForm`, `PracticeHeatmap`; verification: grep shows one definition per icon and `npm run typecheck` green.
- [ ] 3.4 Add `ui/IconButton` (bordered/ghost/danger, `sm`/`md`/`lg`, required `aria-label`); verification: class parity against `AttachMaterialMenu`, `ChordPicker`, `PracticeAudioPlayer`, `PracticeRecordingItem`, `MetronomeSettings`, `TimerCard` source strings.
- [ ] 3.5 Add `ui/ToggleChip` and `ui/ToggleGroup` supporting `selected: boolean | "mixed"` and `aria-pressed`; verification: class parity against `ChordFinderDialog.chipClass`, `TabEditor` technique chips, `SuggestedPractice`, `AccountView` tabs and `RepertoireView` filters; `aria-pressed` values match each source site exactly.
- [ ] 3.6 Add `ui/CheckboxField` reproducing the `peer-checked:border-accent-green-fg` markup copied in `RepertoirePartEditor`, `RepertoireSongForm` and `RepertoireItemCard`; verification: class parity against all three sources.
- [ ] 3.7 Add `ui/Field` (label + `htmlFor` + error slot) and `FormMessage` (`tone="error"|"success"`, `role="alert"`); verification: the rendered `role="alert"` and `text-red-300`/`text-accent-red-fg` outputs match the ~25 grepped call sites.
- [ ] 3.8 Add `ui/EmptyState` for the `border-dashed` and plain variants; verification: class parity against `RepertoireView`, `PracticeAudioRecorder`, `ChordChartEditor`, `AttachMaterialForm` and the non-dashed empties.
- [ ] 3.9 Add `ui/RemovableChip` + `ChipList`; verification: class parity against `PracticeExerciseEditor`'s chip `<li>` and support for a text removal label for the `PracticeResourceEditor` row.
- [ ] 3.10 Add `ui/ModalDialog` (native `<dialog>` shell, `showModal`/`close`, body-scroll lock, `onCancel` prevent-default, `lg`/`md`/`confirm` variants) plus `useDialogModal`; verification: class parity against the 3 identical dialog shell strings and the 3 `w-[calc(100%-2rem)] max-w-md` confirm strings, and `npm run typecheck` green.
- [ ] 3.11 Add `ui/PortalModal`, `ui/ConfirmDialog` and `ui/DialogHeader`; verification: `PortalModal` reproduces `SettingsView`'s inline `Modal` (`role="dialog"`, `aria-modal`, Escape, overlay mousedown) attribute-for-attribute, and `ConfirmDialog` reproduces the byte-identical "new practice" dialog shared by `ActivePracticeSessionHost` and `RepertoireItemCard`.
- [ ] 3.12 Confirm every new `ui/*` primitive is directive-free and every new hook has `"use client"` (D8); verification: `npm run build` green from a server component that imports each primitive, and a grep for the directive.
- [ ] 3.13 Document the primitive catalog (name, variants, the class string each variant owns) in `docs/component-conventions.md`; verification: every primitive from 3.1–3.11 appears with its variants, and the doc's class strings match the source.

## 4. Wave 3 — providers and controllers

- [ ] 4.1 Extract `AppDataProvider`'s pure logic into the wave-1 modules (`practice-data-state`, `errorMessage`) and its types into `src/types/app-data.ts`, leaving the provider shell, `usePracticeStore.persist.rehydrate()`, namespace switching and mount order untouched (D6); verification: `tests/practice-data-merge.test.mjs`, `practice-storage-state`, `practice-storage-clearing` and `cloud-sync-auto-sync-ui` pass unchanged, and a manual pass covers guest start, sign-in load and sign-out.
- [ ] 4.2 Extract `TutorialProvider`'s spotlight tracking (MutationObserver + ResizeObserver + scroll), placement math, focus trap and Escape handling into `useTutorialSpotlight` + `lib/tutorial-layout.ts`, and its types into `src/types/tutorial.ts`, keeping the provider's lifecycle and `data-tour-target` querying intact; verification: `tests/tutorial-steps.test.mjs` passes, and a manual run of the 5-step tour walks `brand`, `practice-plan`, `dashboard-summary`, `metronome-controls`, `settings-account` in order with no layout drift.

## 5. Wave 4 — high-traffic domains

### 5.1 SettingsView

- [ ] 5.1.1 Replace the inline `Modal` with `ui/PortalModal` and keep `data-tour-target="settings-account"` on `:104`'s element; verification: the settings page renders identically and the tour step still finds its target.
- [ ] 5.1.2 Split `ChangePasswordDialog` and `DeletePracticeDataDialog` into their own files under `components/account/`, wired through `lib/account-validation.ts`; verification: password mismatch, weak password and the typed `BORRAR` confirmation all behave as before in a manual pass.
- [ ] 5.1.3 Extract the cloud connect/disconnect flow into `useCloudProviderActions` and sign-out into `useSignOut`; verification: `tests/cloud-sync-auto-sync-ui.test.mjs` still passes after re-pointing its source-text assertions to the auto-sync toggle's new owner (5.1.4), and a manual pass covers connect, disconnect, failure message and sign-out redirect.
- [ ] 5.1.4 Re-point `tests/cloud-sync-auto-sync-ui.test.mjs` at whichever file now owns the auto-sync `aria-pressed={autoSyncEnabled}` wiring, with assertions kept verbatim; verification: the test passes and its assertions were not weakened (diff review).

### 5.2 RepertoireItemCard

- [ ] 5.2.1 Use the shared `ChevronIcon`/`DeleteIcon`, consolidated `COMMON_TUNINGS`, `buildRepertoireExtraConfigUpdates`, `CheckboxField` and the BPM input row; verification: `npm run typecheck` green and the card renders identically for a guitar and a ukulele item.
- [ ] 5.2.2 Preserve the `contentEditable` title/artist editing semantics exactly (Enter-to-blur, `textContent` on save, `aria-label`/`aria-placeholder`) while the save paths move to `lib`; verification: manual edit of title and artist saves correctly, including an emptied field and an Escape/revert.
- [ ] 5.2.3 Replace the quick-practice confirm dialog with shared `ConfirmDialog`, removing the duplication with `ActivePracticeSessionHost`; verification: starting quick practice from the card clears the active session and navigates identically, and cancel leaves state untouched.

### 5.3 RepertoireView

- [ ] 5.3.1 Extract the five filter `useState`s and `clearFilters` into `useRepertoireFilters`, delegating to the existing `repertoire-analytics`/`repertoire-filtering` modules, and move the filter unions next to the existing guards; verification: filter, sort, clear and empty-result states behave as before.
- [ ] 5.3.2 Reuse `MetricCard` (with the new tone) for the metric strip instead of the light-theme copy; verification: the strip's numbers, labels and classes match the previous render.

### 5.4 RepertoireSongForm

- [ ] 5.4.1 Extract the form draft state into `useRepertoireSongDraft` and the host-allow-list URL validation + capo validation into `lib/practice-resource-links.ts` / `repertoire-item-editing.ts`; verification: creating a song with a YouTube, Spotify and generic URL behaves as before, including rejection of a disallowed host.
- [ ] 5.4.2 Reconcile the form's real-file saving with `usePracticeAttachment`/`lib/practice-library.ts` without changing behavior (or record in the change notes why they stay separate); verification: `npm run typecheck` green and attaching a real file still persists it.

### 5.5 PracticeMaterials

- [ ] 5.5.1 Extract `GuitarProViewer` (with its dynamic alphaTab import) and `ResourcePreview` into their own component files and the selection logic into `useMaterialSelection`; verification: a Guitar Pro resource still renders and a preview still resolves.
- [ ] 5.5.2 Extract the object-URL lifecycle into `useAssetUrl`, and switch the resource labels to `lib/practice-resources.ts`; verification: object URLs are revoked on unmount (no leaked blobs after switching materials back and forth).

### 5.6 MetronomeSettings

- [ ] 5.6.1 Replace the `showModal`/overflow effects with `useDialogModal`, move `MetronomeSettingsProps` to `src/types/metronome.ts` and extract `SubdivisionNotation` into its own file with `SUBDIVISION_NOTE_POSITIONS`; verification: the settings modal opens, traps focus and closes with Escape exactly as before, and the subdivision notation renders identically for every subdivision.
- [ ] 5.6.2 Confirm `SelectField` still portals into the wrapping `<dialog>` from inside the settings modal (D4); verification: opening the subdivision/volume selects renders the listbox positioned correctly above and below the trigger.

### 5.7 RecordingsLibrary

- [ ] 5.7.1 Extract loading, the `RECORDING_SAVED_EVENT`/focus/visibility listeners, the cloud catalog merge and the record mutations into `useRecordingsLibrary`, and `formatDateLabel`/`INITIAL_FILTERS`/BLOCK options into `lib`; verification: `tests/practice-recording-filtering.test.mjs` still passes and a manual pass covers save-a-recording refreshing the list, sort/filter, and clearing.
- [ ] 5.7.2 Use `lib/format.ts` and the shared `EmptyState` for the two empty variants; verification: both empty variants render the same text and classes as before.

### 5.8 PracticeSession

- [ ] 5.8.1 Extract `getSessionStatus` into `lib` as an i18n-agnostic helper (D7) and the BPM sampling into a `lib/metronome-bpm.ts` helper; verification: new tests for the status helper pass and the session header shows the same status text.
- [ ] 5.8.2 Extract split-view availability and guarded navigation into hooks shared with `ActivePracticeSessionHost`; verification: entering/leaving a session with the split view available and unavailable behaves as before, and leaving with an active session still warns.

### 5.9 PracticeWorkspace

- [ ] 5.9.1 Move the quick-practice / quick-repertoire / template plan construction into `lib/practice-launch.ts` and the launch-guard refs into `useRequestedLaunch`; verification: `tests/practice-launch.test.mjs` passes with the new cases, and each of the three launch paths starts the same session as before.

### 5.10 TimerCard

- [ ] 5.10.1 Replace both dialogs with `ModalDialog`, use the shared `SettingsIcon`, and move the label ternaries into `lib/format.ts`; verification: the options and finish dialogs open/close identically, `role="timer"`/`aria-live` stay on the same element, and the timer's elapsed display is unchanged.

### 5.11 YearPracticeCalendar

- [ ] 5.11.1 Move the date helpers into `lib/practice-calendar.ts`, reusing them to delete the 4 duplicate `parseDateKey` definitions, and extract the tooltip/scroll behaviour into hooks; verification: all 4 calendar surfaces (year, heatmap, tooltip, monthly summary) render the same cells, and `id="practice-day-tooltip"` still satisfies both `aria-describedby` references.

### 5.12 TabEditor

- [x] 5.12.1 Consume the wave-1 `repertoire-tab` constants and geometry and extract the selection state machine (anchor/focus/drag/buffer, pointer and keyboard handlers) into `useTabEditorSelection`; verification: with `NEXT_PUBLIC_TAB_EDITOR` enabled, mouse drag, shift-extend, keyboard navigation and technique toggling behave as before, and the early return that hides the editor when the flag is off is untouched.

### 5.13 Wave 4 group verification

- [ ] 5.13.1 Run `npm run typecheck`, `npm test` and `npm run build` at the wave boundary; verification: all three exit 0.
- [ ] 5.13.2 Manual pass over every screen touched in wave 4 (settings, repertoire list/detail/new, practice, metronome, recordings, dashboard), checking the interactive flows named per task; verification: a written pass/fail note per screen in the change's notes, with no visual diff.

## 6. Wave 5 — adoption sweep

- [ ] 6.1 Adopt `ModalDialog`/`ConfirmDialog` in `ManualPracticeEntry`, `PracticeCompletionDialog` and `ChordFinderDialog`, keeping each dialog's size class and `aria-labelledby` wiring; verification: each dialog opens, closes on Escape and via its own buttons, and the chord finder's lookups still render.
- [ ] 6.2 Adopt `ToggleChip`/`ToggleGroup` in `SuggestedPractice`, `AccountView` tabs, `RepertoireView` filters, `ChordFinderDialog` chips and `TabEditor` techniques; verification: every `aria-pressed` value and selected style matches the previous render.
- [ ] 6.3 Adopt `Field`/`FormMessage`/`CheckboxField` across the remaining forms (`PracticePhaseEditor`, `RepertoirePartEditor`, `RepertoireSongForm`, `SessionEditor`, `ManualPracticeEntry`, `AccountView`, `ChordChartEditor`, `TabEditor`) and the ~25 `role="alert"` sites; verification: each form still shows its error text with the same `role="alert"` and tone.
- [ ] 6.4 Adopt `RemovableChip` in `PracticeExerciseEditor` and the resource row primitive + `lib/practice-resources.ts` in `PracticeResourceEditor`, and apply the shared `updateById` reducer to `PracticePlanBuilder`, `PhaseEditor`, `ResourceEditor`, `SessionEditor` and `RepertoireItemCard` parts; verification: add/remove/update of exercises, materials, phases and session blocks behaves as before.
- [ ] 6.5 Adopt `MenuItemButton` in `PracticeRecordingItem` and `AttachMaterialMenu`, then re-point `tests/cloud-sync-ui.test.mjs` at the recording menu's new owner with assertions kept verbatim (`aria-haspopup='menu'`, `role='menu'`, the provider ids); verification: the test passes and the sync menu still offers `google-drive` and `onedrive`.
- [ ] 6.6 Adopt the card tones and `SectionHeader` in the remaining dashboard surfaces (`MetricCard`, `PracticeTimeChart`, `PracticeGoalsCard`, `WeeklyPracticeSummary`, `PracticeDayDetail`, `PracticeSessionDetails`, `PracticeSessionPhases`, `SavedRoutines`, `SavedPracticeRoutines`, `RecentRepertoire`, `TodaysRoutinePlan`, `SkillBalance`, `PracticePlanTable`) and in `AccountView`, `RecordingsLibrary`, `RepertoireView`, `ChordPicker`, `LandingPage`, `Skeletons`, `CollapsibleSection`; verification: the eyebrow and heading blocks count drops to a single definition per variant (grep) and every screen renders identically.
- [ ] 6.7 Adopt `EmptyState` everywhere and replace `ActivePracticeSessionHost`'s confirm dialog with the shared one; verification: empty states and the new-practice guard behave as before.
- [ ] 6.8 Update `docs/component-conventions.md` with the adoption outcome: the list of remaining components not yet refactored and why; verification: the list matches a grep-driven count of components still containing inline duplicated class strings or module-level maps.

## 7. Integration verification

- [ ] 7.1 Confirm the extraction rules hold mechanically: grep the refactored components for module-level lookup maps and `interface .*Props` moved by mistake, and confirm each refactored component file is smaller than its baseline; verification: the grep audit is clean and the before/after line counts are recorded.
- [ ] 7.2 Confirm no behavior-adjacent attribute moved: diff `data-tour-target`, `aria-*`, `role=`, `id=` and every user-visible string across the whole change; verification: the diff shows only owner-file changes, no value changes.
- [ ] 7.3 Confirm i18n was not migrated: grep the refactored components for new `useI18nSection` calls or changed literals; verification: no component gained i18n wiring and no string literal changed.
- [ ] 7.4 Run the full gate one final time: `npm run typecheck`, `npm test`, `npm run build`; verification: all three exit 0.
- [ ] 7.5 Verify the accessibility spec still holds where this change touched markup: dialog focus containment and Escape, accessible names on the toggle chips and selects, and 24×24 targets on the calendars; verification: a manual keyboard+screen-reader pass over the dialogs, chips and calendars, checked against `openspec/specs/app-accessibility/spec.md` scenarios.
- [ ] 7.6 Confirm no dependency or configuration change slipped in: `git diff package.json package-lock.json tsconfig.json next.config.ts`; verification: the diff is empty.

## Workflow follow-up

- Archive the change with `/opsx-archive` once the review and manual pass are accepted.
- No spec updates are expected at archive time: this change sets `skip_specs: true` because it is behavior-preserving.
- Deferred to a later change: deleting the dead code found during the survey (`PracticeHeatmap.tsx`, empty `src/lib/practice-stats.ts`, the shadowed filter constants in `RepertoireView.tsx`) and migrating the hardcoded Spanish strings to i18n.
