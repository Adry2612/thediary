# Tasks

## 1. Shared collapsible sections

- [x] 1.1 Add `src/components/ui/CollapsibleSection.tsx`: a controlled disclosure with the existing bordered `<section>` chrome, an `<h2>` title, a description, a `<button aria-expanded aria-controls>` that starts collapsed, and children rendered only when expanded. Verify with `npm run typecheck`.
- [x] 1.2 Add the expand/collapse `aria-label` strings for the new control to `src/i18n/es.ts` and `src/i18n/en.ts`. Verify with `npm test` (the i18n structure test passes for both dictionaries).
- [x] 1.3 Move `ChordChartEditor`'s own `<section>` chrome, title, and description out of the component and render its controls inside `CollapsibleSection`, leaving the chord/lyrics behavior untouched. Verify with `npm run typecheck` and `npm test` (`repertoire-chord-chart` and `repertoire-chord-layout` tests still pass).
- [x] 1.4 Move `TabEditor`'s own `<section>` chrome, title, and description out to `CollapsibleSection` in the same way, keeping its controls intact. Verify with `npm run typecheck`.
- [x] 1.5 Render each editor as its own collapsed `CollapsibleSection` in `RepertoireSongEditor` (song detail) and `RepertoireSongForm` (creation form). Verify with `npm run build` and by opening a song: both sections start collapsed, expanding one leaves the other closed, and both reset to collapsed after leaving and reopening the song.

## 2. Tab measures wrap into systems

- [x] 2.1 Add a pure `groupTabSystems(tab, maxColumnsPerSystem)` helper to `src/lib/repertoire-tab.ts` that returns systems as `{ startColumn, columnCount, firstMeasure }`, clamped to whole measures (rounded down to a multiple of `subdivision`, minimum one measure). Verify with `npm run typecheck`.
- [x] 2.2 Add unit tests for `groupTabSystems` in `tests/repertoire-tab.test.mjs` covering a single system when everything fits, wrapping at a measure boundary, `maxColumnsPerSystem` smaller than one measure falling back to one measure, and measure numbering at each system start. Verify with `npm test`.
- [x] 2.3 Rewrite the `TabEditor` grid to measure its container with a `ResizeObserver` (the pattern already used in `ChordChartEditor`), compute the systems from the measured width, and render each system as a labelled block with the string label column and fractional columns (`repeat(<columnsInSystem>, minmax(0, 1fr))`). Remove the single-strip `overflow-x-auto` container so the tab never scrolls horizontally. Keep fret entry, the cell highlight, clear-cell/clear-all, resolution, and measure add/remove. Verify with `npm run typecheck` and by adding measures until they wrap and confirming no horizontal scrollbar appears.
- [x] 2.4 Make keyboard navigation and the selected-cell highlight cross system boundaries, and confirm removing measures still drops the notes outside the new range under the wrapped layout. Verify with `npm test` plus `npm run build`, and by arrowing past the last column of a system into the next one.

## 3. Integration verification

- [x] 3.1 Run `npm test`, `npm run typecheck`, and `npm run build` together and verify all pass with no regressions in the existing repertoire tests.
- [x] 3.2 Check both hosts on desktop and a narrow viewport: the two sections start collapsed and toggle independently, the tab reflows its systems on resize without horizontal scrolling, and every note stays on its string and time position.

## Workflow follow-up

- Archive the change once the project's review requirements are satisfied.
