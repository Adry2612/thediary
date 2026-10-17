# Proposal

## Why

Opening a song dumps two large editors (lyrics with chords and the tab grid) on top of the item detail, even when the user only wants to review the song. The tab grid also forces every measure into one horizontal strip that scrolls sideways, which is hard to read and to navigate on a song of any length. Both make the song page feel heavy and the tab editor unpleasant to use.

## What Changes

- Make "Letra y acordes" and "Tablatura" collapsed by default on the song detail page and the creation form. Each becomes its own independent, collapsible section, so opening one leaves the other closed. Collapsed state is per-session UI state and is not persisted.
- Change the tab grid from one horizontally scrolling strip to a vertical, Songsterr-style layout: measures wrap into rows that fill the available width, each row acting as a system, with the measure number shown at the start of each system. No horizontal scrolling.
- Keep the existing measure add/remove, resolution, fret entry, keyboard navigation, and persistence behavior unchanged, now operating on the wrapped layout.
- Explicitly out of scope for this change: import/export and any standard interchange format (MusicXML, Guitar Pro, ASCII tab). That work will be proposed separately, after this change lands the layout the format would have to describe.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `repertoire-song-editor`: the lyrics-and-chords editor and the tab editor are collapsed by default and independently expandable; the tab editor lays measures out in wrapped rows (systems) instead of a single horizontally scrolling strip.

## Impact

- `src/components/repertoire/RepertoireSongEditor.tsx` and `src/components/repertoire/RepertoireSongForm.tsx` (wrap the two editors in collapsible sections).
- `src/components/repertoire/TabEditor.tsx` (replace the single-row `overflow-x-auto` grid with wrapped rows / systems).
- Possibly `src/lib/repertoire-tab.ts` (helpers to group columns into measures and measures into systems) with matching tests in `tests/repertoire-tab.test.mjs`.
- `src/i18n/es.ts` and `src/i18n/en.ts` (labels for the collapsible sections and the system/measure numbering, if new text is needed).
- No data model change: `RepertoireTab` (`measures`, `subdivision`, `notes` with `string`/`column`/`fret`) and `RepertoireChordChart` stay as they are, so saved songs keep loading.
