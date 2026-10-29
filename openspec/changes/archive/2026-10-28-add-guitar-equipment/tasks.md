# Tasks

## 1. Model and calculations

- [x] 1.1 Rewrite `src/types/equipment.ts` with `Guitar` (name, optional intervals, optional `photoAssetId`) and `GuitarEntry` (date, text, `kind: "strings" | "note"`); verify `npm run typecheck` passes.
- [x] 1.2 Rewrite `src/utils/equipment.ts` with normalization, the newest string change, usage since a date, attribution counts, maintenance state by days and hours, the deletion helper, urgency sorting and the inheritance resolver; verify `npm run typecheck` passes.
- [x] 1.3 Convert the earlier `guitarSetups` and `stringChanges` arrays into entries inside the normalization path; verify a stored state with only the old arrays loads as one history.
- [x] 1.4 Rewrite `tests/equipment.test.mjs` for usage, attribution, day and hour due/soon, no history, no interval, ordering, migration, deletion, inheritance and invalid records; verify the suite passes.

## 2. Persistence and account sync

- [x] 2.1 Replace the equipment fields and actions in `src/types/practice-storage.ts` and `src/stores/usePracticeStore.ts` with `guitars` and `guitarEntries`, saving and deleting entries and removing a guitar's entries with it while leaving sessions untouched.
- [x] 2.2 Update `src/stores/normalizePracticeStorageState.ts`, `src/utils/practice-data-state.ts` and `src/stores/practiceStorage.ts` for the two arrays and the migration; verify existing storage tests pass.
- [x] 2.3 Update `src/services/supabase/practice-data.ts` to normalize, migrate, merge and default the two arrays; verify the sync tests pass.
- [x] 2.4 Include the two arrays in the guest import of `src/components/providers/AppDataProvider.tsx`.
- [x] 2.5 Update `tests/practice-data-state.test.mjs` and `tests/practice-storage-state.test.mjs` for the new shape; verify both suites pass.

## 3. Photo

- [x] 3.1 Add `src/utils/image.ts` with `getScaledDimensions`, `compressImage` (1200 px, WebP 0.82, EXIF orientation, JPEG fallback) and `validateImageFile` reusing the accepted types and size limit.
- [x] 3.2 Add `tests/image.test.mjs` for the scaling maths and the rejected files; verify the suite passes.
- [x] 3.3 Add `deletePracticeAsset` to `src/services/practice-library.ts` and `deleteCloudPracticeAsset` to `src/services/supabase/practice-files.ts`.
- [x] 3.4 Add the photo field to the guitar form: choose, preview, remove, compress before saving, upload to the account when signed in, and keep the guitar when the upload fails.

## 4. Tools

- [x] 4.1 Add `GuitarIcon` to `src/components/ui/icons.tsx` with the same stroke language as the existing icons.
- [x] 4.2 Build `GuitarRow` with a fixed 56 px thumbnail and placeholder, name, state in words, days and hours, the primary "Cambié las cuerdas" action and a menu with edit, history and delete.
- [x] 4.3 Build the slim `GuitarDialog` with name, days, hours and photo, including the required-name and interval errors.
- [x] 4.4 Build `GuitarHistoryDialog` with the entries newest first, adding a string change or a note, and deleting an entry.
- [x] 4.5 Build `StringsPanel` with the empty state and mount it in `ToolsView` as the `tools-strings` section.
- [x] 4.6 Replace the equipment copy in `src/i18n/es.ts`, `src/i18n/en.ts` and `src/i18n/dictionary.ts` with the block, state, dialog and photo copy; verify both languages typecheck.

## 5. Home and navigation

- [x] 5.1 Build `StringsReminder` as a single line shown only when the most urgent guitar is due or due soon, linking to the Tools block.
- [x] 5.2 Use it in `HomeView` and remove `EquipmentWidget`.
- [x] 5.3 Remove the "Mi equipo" navigation entry, the `/equipment` route and `src/components/equipment/*`.

## 6. Inheritance in practices

- [x] 6.1 Add `lastGuitarId` and `rememberGuitarId` to `src/hooks/useGuitarPreference.ts`.
- [x] 6.2 Use the inheritance resolver in `PracticePlanBuilder`, `FreePracticeStartDialog` and `ManualPracticeEntry`, show the selector only with more than one guitar and remember the guitar when a practice starts.
- [x] 6.3 Make `SessionEditor` read only the session's own `guitarId`, and remove `getGuitarIdForTypeChange` and the guitar-type coupling from every form.
- [x] 6.4 Extend `tests/practice-launch.test.mjs`, `tests/practice-session-record.test.mjs` and `tests/active-practice-session.test.mjs` for the inherited guitar; verify the suites pass.

## 7. Verification

- [x] 7.1 Run `npm test`, `npm run typecheck` and `npm run build`; verify all three finish without failures.
- [x] 7.2 In the browser, add a guitar, record a string change, add a note, delete an entry and verify the state changes accordingly.
- [x] 7.3 In the browser, add a large photo, verify it is compressed, that the row keeps its height with and without a photo, and that removing it restores the placeholder.
- [x] 7.4 Start a practice with one guitar and verify it is attributed without asking; with two guitars, verify the last one is inherited and can be changed.
- [x] 7.5 Verify the block and the home line at 375, 768, 1280, 1536 and 3440 px without horizontal overflow, and that Home shows no line when everything is up to date.

## Workflow follow-up

- Archive the change after the project's review requirements are satisfied.
- Verify the archived specs describe the Tools block, the single history, the inheritance rule and the photo.
