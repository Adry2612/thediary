# Proposal

## Why

Using the app as an installed PWA on a phone still shows web leftovers: the header slides under the status bar, mobile scrolling paints desktop scrollbars, focusing a field zooms the page, and some sections (notably the tablature) use different margins than the rest of the app. At the same time, three small inconsistencies hurt the day-to-day flow: creating a repertoire item leaves the library for a full page, each search field looks different, and the dashboard's day summary repeats the song name for a single-song practice.

## What Changes

- **Safe area on mobile/PWA**: declare a `viewport-fit=cover` viewport and reserve the device's top safe area for the header, so the app name and menu no longer sit under the status bar. Keep the bottom safe area clear in full-height dialogs.
- **Native-feeling scrolling**: hide scrollbars on small screens while keeping every container scrollable, and stop the page itself from scrolling horizontally.
- **No accidental page zoom**: form controls use a mobile text size that iOS/Android do not auto-zoom, without disabling the user's pinch zoom. Cover every control, including the auth form reached after sign-in.
- **Repertoire creation as a dialog**: the "Añadir nuevo elemento" action opens the creation form in a modal over the library instead of navigating to `/repertoire/new`; saving closes the dialog and opens the new item. The old route redirects to the repertoire.
- **One search field**: a shared `SearchField` primitive used by the repertoire, licks, recordings filter, song/technique pickers, chord finder and picker, so every search has the same label, magnifier, height, typography and clear behaviour.
- **Tablature respects the app frame**: the tab editor and viewer keep the app's horizontal rhythm on phones — controls wrap inside the card, the grid stays within the section padding, and the tablature modal uses the same side margin as a page.
- **Day summary names a practice once**: when a session has a single block with the same name as the session (quick repertoire practice), the calendar tooltip shows the song name once instead of twice.

Assumption (recorded): the repertoire creation modal does not need its own URL. `/repertoire/new` remains reachable as a redirect to `/repertoire` so old bookmarks do not break, but it no longer opens the form directly.

Assumption (recorded): pinch zoom stays enabled. The fix targets the automatic zoom caused by focused controls, not the user's explicit zoom.

## Capabilities

### New Capabilities

- `pwa-mobile-shell`: how the installed app behaves on a phone — device safe areas, scrollbars, page-level overflow, and automatic zoom on focus.
- `workspace-search`: the single search control used across the workspace, its anatomy and its behaviour.

### Modified Capabilities

- `app-navigation`: the creation form's way back becomes the dialog's close control instead of a back arrow on a page.
- `repertoire-library`: the header add action opens a dialog instead of navigating to a creation page.
- `repertoire-song-editor`: repertoire items are created in a dialog; the tab editor and viewer respect the app frame on small screens.
- `practice-dashboard`: the day summary names a practice once when the session and its only block share the same song name.

## Impact

- **Shell and styles**: `src/app/layout.tsx` (viewport/theme metadata), `src/app/globals.css` (safe areas, scrollbars, mobile control text size, horizontal overflow).
- **Navigation and search**: `src/components/layout/SiteNavigation.tsx`; new `src/components/ui/SearchField.tsx`; `RepertoireView`, `LicksView`, `RecordingsLibrary`, `SearchPickerDialog`, `ChordFinderDialog`, `ChordPicker`.
- **Repertoire creation**: `src/components/repertoire/RepertoireView.tsx`, `RepertoireSongForm.tsx`, `src/hooks/useRepertoireSongDraft.ts`, `src/app/(workspace)/repertoire/new/page.tsx` (redirect), i18n copy for the dialog.
- **Tablature**: `src/components/repertoire/TabEditor.tsx`, `TabView.tsx`, `TabPlaybackBar.tsx`, `src/components/licks/LickEditorModal.tsx`, `src/components/ui/ModalDialog.tsx` if the shared dialog needs safe-area padding.
- **Dashboard summary**: `src/components/dashboard/PracticeDayTooltip.tsx` plus a pure helper in `src/utils/practice-session-details.ts` or a new `src/utils/practice-tooltip.ts` so the rule is testable.
- **Tests**: new `node --test` cases for the tooltip dedupe and, where a pure rule appears, for the search control; existing `practice-tooltip`, `repertoire-*` and `i18n` suites must stay green. No new dependencies.
