# Proposal

## Why

The components under `src/components` mix three things that should live apart: the markup, the logic that decides what the markup shows, and the types/constants that describe the data. `SettingsView.tsx` is 742 lines of JSX wrapping six async flows and two inline dialogs; `TabEditor.tsx` (642) and `TutorialProvider.tsx` (658) each hide their geometry inside the component body. On top of that, the same markup is copied instead of shared: the surface-card class string appears inline 29 times, the eyebrow label string 24 times, the same `parseDateKey` is defined in 4 files, `RESOURCE_LABELS` and `COMMON_TUNINGS` twice each, and the "new practice" confirm dialog exists twice verbatim.

The project already has a working convention for this — pure logic in `src/lib/*` (which is the only thing the test suite imports), hooks in `src/hooks/*`, domain types in `src/types/*`, primitives in `src/components/ui/*`. The refactor is about finishing that separation where it was never done, and consolidating the copies into single variant-aware components. Nothing about the product's behavior should move.

## What Changes

**Presentation-only components**

- Each refactored component keeps only JSX and the wiring of props to primitives. State machines, event handlers with branching, derived values and geometry move to hooks in `src/hooks/` or pure functions in `src/lib/`.
- Constraint recorded as an assumption: a component's **own** props interface stays next to the component (it *is* the component's API). What moves to `src/types/*` is domain data — unions/enums, kinds, drafts, context values, and any type exported and consumed by more than one file.

**One component per shape, variants instead of copies**

- Dialogs: one `ModalDialog` (native `<dialog>` + `showModal`/`close` + scroll lock), one `PortalModal` (the `role="dialog"` overlay shape in `SettingsView`), one `ConfirmDialog`, one `DialogHeader`. Replaces 13 hand-rolled `showModal`/portal implementations.
- Layout/text: `SectionHeader` (eyebrow + title + description, `page`/`card` variants) collapses ~30 copied blocks; `Card`/`Block` gain `tone`/`padding`/`as` so the 29 inline surface strings and the ~15 dark-theme copies (`border-zinc-800 bg-zinc-900`) become the primitive's job.
- Controls: `Button` gains `icon`, `link` and `danger` variants plus a `ButtonLink`; new `IconButton`, `ToggleChip`/`ToggleGroup` (the `aria-pressed` pills in 5 files), `CheckboxField` (copied verbatim 3 times), `Field` label/error wrapper + `FormMessage` (the `role="alert"` line is duplicated ~25 times), `EmptyState`, `RemovableChip`.
- Icons move to `ui/icons.tsx`: `ChevronIcon`, `SettingsIcon`, `DeleteIcon`, play/pause — currently re-defined privately in 3+ files each.

**Logic into `lib`, state into hooks**

- New pure modules: `errorMessage`, `practice-resources` (`RESOURCE_LABELS`), `practice-track-updates` (`updateById` collection reducers), `account-validation`, `practice-data-state`, `tutorial-layout`, plus `dependency`-free helpers added to existing modules (`practice-calendar`, `repertoire-tab`, `repertoire-item`, `repertoire-item-editing`, `manual-practice`, `metronome-tempo-ramp`, `format`, `practice-launch`).
- New hooks: `useDialogModal`, `useCloudProviderActions`, `useSignOut`, `useTutorialSpotlight`, `useTabEditorSelection`, `useRepertoireFilters`, `useRepertoireSongDraft`, `useRecordingsLibrary`, `useAssetUrl`, `useMaterialSelection`, `useAccountActions`, `useRequestedLaunch`, `useSplitViewAvailability`, `useTooltip`.
- New types: `src/types/dashboard.ts`, `src/types/tutorial.ts`, `src/types/app-data.ts`, `src/types/metronome.ts`; `difficulty-labels.ts` moves out of the components tree into `src/lib/`.
- Tests: the extracted pure functions are exported so the existing `tests/*.test.mjs` (which import only `src/lib/*`, `src/i18n/*`, `src/stores/*`) can cover them. No new test framework is introduced.

**Compatibility**

- **BREAKING (internal only)**: import paths for the moved types/helpers change, and two source-text tests reference components directly — `tests/cloud-sync-auto-sync-ui.test.mjs` (asserts the auto-sync `aria-pressed` wiring inside `SettingsView.tsx`) and `tests/cloud-sync-ui.test.mjs` (asserts the recording menu roles inside `PracticeRecordingItem.tsx`). Their assertions are about ARIA wiring, not about file location, so they are re-pointed to the new owner in the same commit as the move.
- NOT BREAKING for users: no route, copy, style, markup structure, `data-tour-target`, ARIA contract or i18n key changes.

**Out of scope**

- Migrating the hardcoded Spanish strings in `AccountView`, `PracticeMaterials`, `PracticeAudioRecorder`, `SettingsView`'s dialogs and others to i18n. That is a user-visible fix (the English locale currently shows Spanish there), not a refactor.
- Deleting dead code found during the survey (`PracticeHeatmap.tsx` is imported nowhere, `src/lib/practice-stats.ts` is empty, `RepertoireView.tsx` has 5 shadowed filter constants). Flagged for a separate change so this one stays behavior-preserving.
- Style/token redesign: the dark-theme cards are captured as a `tone` on `Card`, but their colors are not changed.

## Capabilities

### New Capabilities

None. This is a behavior-preserving refactor: component composition, file layout and internal APIs change, but the system's observable behavior does not, so no spec-level requirement changes.
`openspec/changes/refactor-component-separation/.openspec.yaml` sets `skip_specs: true` for exactly this reason.

### Modified Capabilities

None. `app-accessibility`, `app-navigation` and the feature specs state behavior (contrast, accessible names, flows) that this change explicitly preserves; their scenarios must keep passing unchanged rather than be rewritten.

## Impact

- **Components**: 71 `.tsx` under `src/components`; ~40 touched. Deepest work on `SettingsView` (742), `TutorialProvider` (658), `TabEditor` (642, behind the `NEXT_PUBLIC_TAB_EDITOR` flag), `RepertoireItemCard` (629), `AppDataProvider` (558), `RepertoireView` (421), `RepertoireSongForm` (407), `PracticeMaterials` (405), `MetronomeSettings` (399), `RecordingsLibrary` (364).
- **New/extended shared UI**: `src/components/ui/*` (`ModalDialog`, `PortalModal`, `ConfirmDialog`, `DialogHeader`, `SectionHeader`, `IconButton`, `ToggleChip`, `CheckboxField`, `Field`/`FormMessage`, `EmptyState`, `RemovableChip`, `icons.tsx`, `Button`, `Card`, `Block`).
- **New modules**: `src/lib/{error-message,practice-resources,practice-track-updates,account-validation,practice-data-state,tutorial-layout,difficulty-labels}.ts`; `src/types/{dashboard,tutorial,app-data,metronome}.ts`; 14 hooks in `src/hooks/`.
- **Tests**: no behavior tests change; the two source-text assertions above must be re-pointed if their subject moves. `npm run typecheck` and `npm test` are the completion gates, plus a manual pass over the touched screens.
- **Dependencies**: none added or removed.
