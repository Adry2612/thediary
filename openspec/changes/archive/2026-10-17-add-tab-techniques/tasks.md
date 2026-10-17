# Tasks

## 1. Technique model and helpers

- [x] 1.1 Extend `RepertoireTabNote` in `src/types/practice.ts` with the optional technique fields (`legato`, `slide`, `bend`, `vibrato`, `palmMute`, `letRing`, `tapping`, `harmonic`, `dead`, `tremoloPicking`, `trill`, `slap`, `pop`) and add the `TAB_TECHNIQUES` descriptor table (id, i18n key, shortcut, glyph, isTransition) to `src/lib/repertoire-tab.ts`. Verify with `npm run typecheck`.
- [x] 1.2 Implement `setTabTechnique`, `clearTabTechnique`, and `toggleTabTechnique` in `src/lib/repertoire-tab.ts`, resolving a transition to the nearest earlier note on the same string, refusing a transition when there is none, and dropping a transition when its referenced note is removed. Verify with `npm test`.
- [x] 1.3 Extend `normalizeTab` to validate each technique field independently (unknown enum values, non-boolean modifiers, bend amounts outside `{0.25, 0.5, 1, 1.5, 2}`, and transitions with no preceding note are dropped) while always keeping `string`, `fret`, and `column`. Verify with `npm test`.
- [x] 1.4 Add unit tests in `tests/repertoire-tab.test.mjs`: apply/remove/toggle a modifier, transition needs a preceding note, the transition links to the nearest earlier note, the transition is dropped when its source is removed, techniques survive a resolution change, techniques are removed with the note, an old technique-free tab loads unchanged, unknown and out-of-range values are dropped but the note is kept, every technique has a glyph, and no shortcut shadows a digit or an arrow key. Verify with `npm test`.

## 2. Editing techniques in the tab editor

- [x] 2.1 Add i18n labels to `src/i18n/es.ts` and `src/i18n/en.ts` for every technique name, the palette heading, and the shortcut hints. Verify with `npm test` (the i18n structure test passes for both dictionaries).
- [x] 2.2 Add the technique palette to the selected cell in `src/components/repertoire/TabEditor.tsx`: one control per entry of `TAB_TECHNIQUES` that reflects whether the selected note has it, lists its glyph next to its name so the palette doubles as the legend, and disables transitions when the selected note has no earlier note on its string. Verify with `npm run typecheck`.
- [x] 2.3 Wire the keyboard shortcuts from `TAB_TECHNIQUES` into `TabEditor`'s key handling so a shortcut applies or removes the technique on the selected cell, without shadowing the digit fret entry or the arrow navigation. Verify with `npm run typecheck` and by typing a digit, pressing an arrow, and pressing a technique shortcut in the tab editor.

## 3. Drawing the techniques

- [x] 3.1 Render each applied technique's glyph in a thin row above the fret number inside its grid cell, stacking or wrapping when a note carries several so the fret stays visible. Verify with `npm run build` and by applying two techniques to one note and seeing both glyphs and the fret.
- [x] 3.2 Confirm the drawn glyphs match the palette's glyph and name for every technique, and that a note with no techniques keeps its current appearance. Verify with `npm run build` and visibly in the tab editor.

## 4. Integration verification

- [x] 4.1 Run `npm test`, `npm run typecheck`, and `npm run build` together and verify all pass with no regressions in the existing repertoire tests.
- [x] 4.2 In the app, apply each technique family (legato, slide, bend, vibrato, palm mute, let ring, tapping, harmonic, dead note, tremolo, trill, slap/pop), confirm a transition is refused on the first note of a string, and confirm techniques survive a resolution change, adding and removing measures, and reloading the song.

## 5. Multi-note selection

- [x] 5.1 Add selection helpers to `src/lib/repertoire-tab.ts`: `TabCell`, `tabCellsBetween(anchor, focus)`, `getSelectedTabNotes(tab, cells)`, `tabTechniqueSelectionState(tab, cells, id)` returning `all` / `some` / `none`, `canApplyTabTechniqueToSelection(tab, cells, id)`, and `toggleTabTechniques(tab, cells, id)` that sets the technique on every selected note that can take it, or clears it from all when they all already have it. Verify with `npm run typecheck`.
- [x] 5.2 Add unit tests in `tests/repertoire-tab.test.mjs`: the rectangle between two cells, bulk apply to several notes, bulk remove when all have it, a partial selection completing on activation, empty cells ignored, and a transition applied only to the notes that have an earlier note on their string. Verify with `npm test`.
- [x] 5.3 Replace the single `cursor` in `TabEditor` with an `anchor` + `focus` selection: a plain press and plain arrows reset it, dragging extends it, Shift + click extends it, Shift + arrows extend it, the whole rectangle is drawn as selected, and the focus cell still receives fret entry. Verify with `npm run typecheck` and by dragging and Shift-clicking in the grid.
- [x] 5.4 Drive the palette and the keyboard shortcuts from the selection: three-state buttons (`aria-pressed` `true` / `false` / `"mixed"`), `toggleTabTechniques` on activation, and transitions enabled when at least one selected note can take them. Verify with `npm run typecheck` and in the app.

## 6. Verification of the selection

- [x] 6.1 Run `npm test`, `npm run typecheck`, and `npm run build` together and verify all pass.
- [x] 6.2 In the app: drag over several notes and apply palm mute to all of them at once, extend the selection with Shift + arrows, confirm a partial selection completes and a full one clears, that empty cells are skipped, and that a hammer-on lands only on the notes that have a preceding note.

## 7. Standard notation over time

- [x] 7.1 Add a `render` field to `TabTechniqueDescriptor` (`span` / `connector` / `sustain` / `glyph` / `notehead`) and set it for all 23 techniques, with the span label (`P.M.`, `L.R.`) where it applies. Limit `tabTechniqueGlyphs` to the `glyph` class. Verify with `npm run typecheck`.
- [x] 7.2 Add the helpers that derive the shapes: `tabTechniqueSpans(tab, id)` returning the runs of consecutive columns that carry a span technique, and `tabTechniqueLinks(tab, id)` returning, for each legato/slide, the column pair it joins on its string. Verify with `npm test`.
- [x] 7.3 Draw the spans in a row above the string rows of each system: one thin row per active span technique, opening with its label at the first note, a dashed line across the run, and a terminator, clipped per system and split at gaps. Verify in the app.
- [x] 7.4 Draw the links and the lasting marks in an annotation layer over the string rows, positioned from the column index and the cell width: a slur/line between the two notes of a legato or slide with its `h` / `p` / `/` / `\` / `s` label, and a mark that reaches from a bend, vibrato or trill to the next note on the string. Verify in the app.
- [x] 7.5 Limit the cell mark row to the `glyph` techniques and draw the `x` in place of the fret for a dead note. Verify in the app.

## 8. Verification of the notation

- [x] 8.1 Run `npm test`, `npm run typecheck`, and `npm run build` together and verify all pass.
- [x] 8.2 In the app: palm-mute four consecutive notes and confirm a single `P.M. ────|` bracket; leave a gap and confirm it splits in two; resize so the span crosses systems and confirm both parts draw; add a hammer-on and a slide and confirm the link and its label; add a bend and a vibrato and confirm the mark reaches the next note; mark a dead note and confirm the `x`.

## Workflow follow-up

- Propose the follow-up change for in-app Web Audio playback of the tab (durations until the next note), reading the techniques this change records.
- Archive the change once the project's review requirements are satisfied.
