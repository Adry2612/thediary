# Tasks

## 1. Lock the zoom

- [x] 1.1 Declare the fixed-scale viewport in `src/app/layout.tsx` (`maximumScale: 1`, `userScalable: false`) and verify the rendered document declares no user scaling on both a phone and a desktop viewport.
- [x] 1.2 Remove every below-16 px text control: drop `sm:text-sm` from the shared field classes in `src/components/ui/Field.tsx`, raise the editable artist in `src/components/repertoire/RepertoireItemCard.tsx` to 16 px at every breakpoint, and verify no `<input>`, `<textarea>` or search field inherits a smaller size.
- [x] 1.3 Add `touch-action: manipulation` to interactive elements and `-webkit-text-size-adjust: 100%` to the document in `src/app/globals.css`, and verify a double tap on a button does not zoom in mobile emulation.
- [x] 1.4 Add a Node test that reads the viewport export and the shared field classes and fails if a control can drop below 16 px or the viewport allows scaling; verify with `npm test`.

## 2. One page shell and one page header

- [x] 2.1 Create `src/components/ui/PageShell.tsx` with the shared column, gutters and vertical rhythm, accepting `as` and `className`; verify the practice screen can still render a `div` while a practice is active.
- [x] 2.2 Create `src/components/ui/PageHeader.tsx` with title, optional description and an actions slot, without an eyebrow; verify the dashboard keeps its manual-practice action inside the header.
- [x] 2.3 Remove the `eyebrow` prop from `DialogHeader` and from `SearchPickerDialog`, and migrate every dialog that passes it (`SongPickerDialog`, `TechniquePickerDialog`, `RepertoireItemDialog`, `TimerCard`); verify `npm run typecheck` reports no caller left passing it.
- [x] 2.4 Adopt `PageShell` and `PageHeader` in every app screen: start, dashboard, practice, metronome, licks, repertoire list and detail, recordings, settings, account, practice-day detail and the remaining nested pages; verify the content column and side margins do not move while navigating between them.
- [x] 2.5 Adopt `PageShell` in every skeleton in `src/components/ui/Skeletons.tsx` so loading states match the final layout; verify no visible jump when a screen finishes loading.
- [x] 2.6 Document `PageShell` and `PageHeader` in `docs/component-conventions.md` as the page-level primitives, and add the coordination note in `openspec/changes/refactor-component-separation/tasks.md` so its wave 6 adopts them instead of reintroducing page-level copied blocks; verify both files mention the new primitives.

## 3. One name per section

- [x] 3.1 Rename the start and dashboard titles in `src/i18n/es.ts` and `src/i18n/en.ts`, relabel the dashboard as "Evolución" and keep "Inicio" as the first navigation label so it does not repeat the app name; verify switching the language keeps the three titles distinct and the navigation coherent.
- [x] 3.2 Delete the `eyebrow` keys and the hardcoded "Detalle de práctica" eyebrow that no longer render anywhere, and verify a grep for `eyebrow` only finds the dialog-free leftovers that were deliberately kept.
- [x] 3.3 Add a Node test that asserts the three titles differ from each other, that the dashboard navigation label matches its title and that the start label does not repeat the app name, in both languages; verify with `npm test`.

## 4. Repertoire songs in manual practice

- [x] 4.1 Extend `ManualPracticeBlockDraft` and `ManualPracticeInput` in `src/utils/manual-practice.ts` with the optional song and part link, map it into the stored phase, clear it when the category changes and reject a link to a missing song; verify the Node tests cover linked, unlinked, category-change and missing-song cases.
- [x] 4.2 Add the song search to `ManualPracticeEntry` for repertoire blocks, with the chosen song shown, an optional part selector and a way to change or clear the link; verify a manual practice saves both with and without a song.
- [x] 4.3 Verify the linked time reaches the repertoire: a manual practice with a linked block must appear in the repertoire item's accumulated time and parts, and its links must survive editing the saved practice in the session editor.
- [x] 4.4 Add the manual-practice copy for the search, the part and the link actions in both dictionaries; verify no literal string is left in the component.

## 5. Verification

- [x] 5.1 Run `npm run typecheck`, `npm test` and `npm run build`; verify all three exit zero.
- [x] 5.2 Do a mobile pass on a phone-sized viewport: focus every kind of text control (including in landscape) without the page scaling, double tap a control without zooming, and confirm the page cannot be scaled where the browser honours the viewport.
- [x] 5.3 Do a navigation pass comparing the start, dashboard, metronome, practice, repertoire, licks, recordings, settings and account screens: same left edge, same top spacing, no eyebrow above any title, three distinct section names.
- [x] 5.4 Do a manual-practice pass: record a past practice with a repertoire block, search a song by title, artist and part, link it, save, and confirm the block is named after the song and the repertoire time increases.
- [x] 5.5 Review the final diff for scope: no landing redesign, no analytics change, no session-editor picker, and no unrelated formatting churn.

## Workflow follow-up

- When the change is archived, adjust the `## Purpose` of `openspec/specs/pwa-mobile-shell/spec.md`, which still says the app "never zooms the page on its own when a control receives focus", so it matches the fixed-scale behavior synced from this change.
