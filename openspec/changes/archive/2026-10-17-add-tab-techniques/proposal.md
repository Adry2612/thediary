# Proposal

## Why

The tab editor can only place a fret on a string. Real guitar music is written with performance techniques — hammer-ons, pull-offs, slides, bends, vibrato, palm mute, tapping, harmonics, muted notes — and a tab that cannot express them is not usable for learning a song. Songs the user already practises carry this information in the attached Guitar Pro file, but the app's own editable tab cannot hold it.

## What Changes

- Extend a tab note with the standard performance techniques, stored per note and per note transition: legato (hammer-on / pull-off), slides (ascending, descending, position shift), bends (bend, bend-and-release, prebend, prebend-and-release) and vibrato, palm mute, let ring, tapping, harmonics (natural, artificial, pinch, tap), dead notes, tremolo picking, trill, and slap/pop.
- Let the user select one cell or a range of cells in the grid (drag, Shift + click, Shift + arrows) and apply or remove a technique on the whole selection at once, with a technique palette that shows whether all, some or none of the selected notes carry it, plus keyboard shortcuts; transitions (legato, slide) apply only to the notes that have an earlier note on their string.
- Draw each technique on the tab the way a standard tablature draws it, so the tablature is readable at a glance: a span over the run of notes for palm mute, let ring and tremolo picking (`P.M. ────|`), a link between two notes for legato and slides, a mark that lasts over the note for bends, vibrato and trill, a glyph on the note for tapping, harmonics, slap and pop, and an `x` in place of the fret for dead notes, with the palette doubling as a legend.
- Keep techniques attached to their note across the existing operations: changing the resolution, adding or removing measures, and clearing a note that removes it together with its techniques.
- Load tabs saved before this change unchanged, and drop only the technique values that are not valid, without losing the note.

Out of scope for this change (planned separately):

- MIDI / audio playback of the tab (in-app synthesizer with Web Audio, with durations taken from the following note) is a separate change.
- Import/export and any interchange format (MusicXML, Guitar Pro, ASCII tab) remains deferred.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `repertoire-song-editor`: a tab note gains performance techniques, the tab editor lets the user apply and remove them and draws them, and persisted tabs carry them.

## Impact

- `src/types/practice.ts` (`RepertoireTabNote` gains the technique fields; `RepertoireTab` is unchanged).
- `src/lib/repertoire-tab.ts` (technique helpers: apply/remove/toggle on a note, validation of transitions, and `normalizeTab` validation of the new fields) with tests in `tests/repertoire-tab.test.mjs`.
- `src/components/repertoire/TabEditor.tsx` (technique palette, keyboard shortcuts, and the notation layer that draws spans, links, lasting marks, glyphs, and the `x` head).
- `src/i18n/es.ts` and `src/i18n/en.ts` (technique names, legend, and shortcut hints).
- No change to `setTabMeasures`, `setTabSubdivision`, or `setTabNote` semantics beyond carrying the techniques along; no data migration, since older notes simply have no techniques.
