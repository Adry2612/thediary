# Tasks

## 1. Mobile shell

- [x] 1.1 Add the `viewport` export to `src/app/layout.tsx` with `width: 'device-width'`, `initialScale: 1`, `viewportFit: 'cover'` and `themeColor: '#121211'`; verification: the rendered document head contains `viewport-fit=cover` and typecheck passes.
- [x] 1.2 Reserve the top safe area in `SiteNavigation` with `padding-top: env(safe-area-inset-top)` on the header, keeping the current background and border; verification: with the inset emulated at 47 px the app name and menu sit below it, and with the inset at 0 px the header height is unchanged.
- [x] 1.3 Add the mobile block to `globals.css`: hide scrollbars on every element and set `overflow-x: clip` (with `hidden` fallback) on `html, body` below 768 px; verification: at 390 px the page shows no vertical or horizontal scrollbar, wide calendars still scroll horizontally, and at 1024 px the desktop scrollbar returns.
- [x] 1.4 Raise mobile text controls to 16 px: `sharedFieldClasses` in `ui/Field.tsx` becomes `text-base sm:text-sm`, and every raw text `<input>`/`<textarea>` found by `grep -rn "<input\\|<textarea" src` is audited and updated when its computed mobile size is below 16 px (account dialogs, delete-data dialog, chord finder, adjustable number, session/part editors); verification: at 390 px every enabled text control computes to `>= 16px`, the chord-name input in `ChordPicker` keeps its larger size, and typecheck passes.
- [x] 1.5 Keep pinch zoom enabled and do not set `maximumScale`/`userScalable`; verification: the viewport meta contains no `maximum-scale`/`user-scalable=no`, and the mobile emulator still pinches.

## 2. Shared search field

- [x] 2.1 Create `src/components/ui/SearchField.tsx` composing the existing `TextField` with a wrapping label, a leading `SearchIcon` (`aria-hidden`) and `pl-10`, forwarding `inputRef`, `onKeyDown` and the native input props; verification: rendering it shows one labeled search box and no separate icon in the accessibility tree.
- [x] 2.2 Replace the repertoire search (`RepertoireView`) and the licks search (`LicksView`) with `SearchField`, keeping their labels, placeholders and result counts; verification: both screens look identical in height, icon position and text size at 390 px and at 1024 px.
- [x] 2.3 Replace the recordings block-name filter in `RecordingsLibrary` with `SearchField`, keeping the `searchBlock` placeholder and the `filterBlockName` accessible name; verification: typing still filters recordings and the accessible snapshot names it as a search box.
- [x] 2.4 Replace the raw search input in `SearchPickerDialog` (song and technique pickers) with `SearchField`, preserving the auto-focus ref and the Escape handling; verification: opening the song and technique pickers focuses the field, typing filters, Escape closes, and the accessible name is the visible label.
- [x] 2.5 Replace the raw search input in `ChordFinderDialog` with `SearchField`, preserving focus and the existing filtered groups; verification: the finder focuses its search on open, filters standard and saved chords, and keeps its Escape/close behavior. `ChordPicker`'s chord-name input and its search button stay as they are.
- [x] 2.6 Document `SearchField` in the primitive catalog of `docs/component-conventions.md` with its closed API (label, value, onChange, inputRef, className); verification: the doc entry matches the exported props and no `type="search"` remains outside `SearchField.tsx` (`grep -rn 'type=\"search\"' src`).

## 3. Repertoire creation dialog

- [x] 3.1 Add `RepertoireItemDialog` (ModalDialog `lg` with `max-w-3xl`, `DialogHeader`, `RepertoireSongForm`) mounted only while open, with autofocus on the title field; verification: opening starts with an empty draft, closing discards it, and Escape/backdrop-close behave like the other dialogs.
- [x] 3.2 Replace the header `<Link href='/repertoire/new'>` in `RepertoireView` with a button that opens the dialog, keeping the same classes, icon and copy; verification: the button opens the dialog over the library and the URL does not change.
- [x] 3.3 Wire `onCreated` to close the dialog and open the new item's detail; verification: saving a valid item closes the dialog, inserts it in the library and navigates to `/repertoire/<id>`.
- [x] 3.4 Replace `src/app/(workspace)/repertoire/new/page.tsx` with a server redirect to `/repertoire`; verification: visiting `/repertoire/new` lands on the library and renders no form.
- [x] 3.5 Reuse the existing repertoire i18n strings for the dialog (eyebrow, title, description, close) and add a key only if one is missing in both `es.ts` and `en.ts`; verification: `npm test` passes the i18n suite and the dialog reads correctly in both locales.

## 4. Tablature frame on phones

- [x] 4.1 Rework the `TabEditor` toolbar so the resolution select and the fret field are full width below `sm` and keep their current widths above it, with every label/control group inside a `min-w-0` wrapper; verification: at 320 and 390 px no control is clipped and the measure stepper stays on one row.
- [x] 4.2 Keep the editor's measured grid inside its section: `min-w-0` on the measured wrapper, no new fixed widths, and the existing fit-to-width systems unchanged; verification: a 16-measure sixteenth-note tab at 320 px does not widen the page and `tests/repertoire-tab.test.mjs` passes.
- [x] 4.3 Align `TabPlaybackBar` at phone width so its play button and BPM field wrap without exceeding the card; verification: the bar stays within the section padding at 320 px.
- [x] 4.4 Give `LickEditorModal` the app's mobile side margin (`w-[min(100%-2.5rem,46rem)]` below `sm`, current width above); verification: the dialog keeps 20 px on each side at 390 px and the tablature section keeps its own padding.
- [x] 4.5 Verify `TabView` stays inside its own card when a saved tab is wider than the screen; verification: horizontal scrolling happens inside the card and the page keeps its margins.

## 5. Calendar day summary

- [x] 5.1 Add `getSessionPhaseLines(session)` to `src/utils/practice-tooltip.ts`: return no phase lines when there is exactly one phase whose trimmed, case-insensitive name equals the trimmed session title, otherwise return all phases; verification: new cases in `tests/practice-tooltip.test.mjs` cover the duplicate, a different single block, several blocks and surrounding spaces/case.
- [x] 5.2 Use the helper in `PracticeDayTooltip` for the phase list, leaving the session title, time and BPM untouched; verification: a quick repertoire practice shows the song once, and a session with a different block name still shows both names.

## 6. Integration verification

- [x] 6.1 Run `npm run typecheck`, `npm test` and `npm run build`; verification: all three exit 0.
- [x] 6.2 Manual mobile pass at 320, 390 and 768 px over account (login focus), repertoire (search, creation dialog, tablature), licks (search, editor dialog), recordings (filter), dashboard (calendar tooltip), practice and settings; verification: no automatic zoom, no scrollbars below 768 px, no horizontal page scroll, and no section outside the app margins, with a pass/fail note per screen.
- [x] 6.3 Standalone/PWA pass with safe-area emulation: check the header at the top of the screen, the mobile menu and the creation dialog; verification: nothing sits under the status bar and the bottom controls stay reachable.
- [x] 6.4 Confirm no dependency or configuration drift: `git diff package.json package-lock.json tsconfig.json next.config.ts`; verification: the diff is empty.

## Verification notes

- **320 / 390 / 768 px, all screens** (`/account`, `/repertoire`, `/repertoire/song-1`, `/licks`, `/recordings`, `/dashboard`, `/practice`, `/settings`): pass. No section escapes the viewport, page overflow is 0, and scrollbars are hidden below 768 px and visible at 768 px.
- **Account**: pass. Email field is 16 px on phone widths; mobile menu opens.
- **Repertoire**: pass. Search is 48 px high at 16/14 px; creation dialog opens with the title focused, closes with Escape/backdrop, saves and opens the new item; `/repertoire/new` redirects to `/repertoire`; a 16-measure sixteenth-note tab at 320 px does not widen the page.
- **Licks**: pass. Search matches the repertoire; the editor dialog keeps 20 px side margins at 320/390 px; the analytics cards were widened by their content at 320 px and are fixed with `min-w-0`; a wide tab stays inside its card and scrolls there.
- **Recordings**: pass. The block-name filter is a named search box and filters as the user types.
- **Dashboard**: pass. A quick single-song session shows the song once; a different single block and a multi-block session keep their block lines.
- **Practice and settings**: pass. No horizontal overflow at the three widths.
- **Safe areas (simulated 47 px top / 34 px bottom)**: pass. The header keeps its content below the inset, the creation dialog sits at 83 px from the top with its close button at 104 px, and the lick dialog sits at 49 px with room to scroll to its actions.

## Workflow follow-up

- Archive the change after the review and the manual passes are accepted.
- If the archived specs show a stale `repertoire/new` mention elsewhere, fix it in a follow-up change rather than silently editing main specs.
