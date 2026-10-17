# Design

## Context

See `proposal.md` for motivation and `specs/repertoire-song-editor/spec.md` for the required behavior.

Current state that shapes the approach:

- `src/components/repertoire/RepertoireSongEditor.tsx` (song detail) and `src/components/repertoire/RepertoireSongForm.tsx` (creation form) both render `ChordChartEditor` then `TabEditor`, one after the other, with no way to hide them.
- Each editor owns its own outer chrome: a `<section className="mt-5 rounded-xl border border-line bg-surface p-5 sm:p-6">` with an `<h2>` title and a description paragraph. `TabEditor`'s title/description come from `useI18nSection("repertoire")`.
- `TabEditor` renders a single `overflow-x-auto` container holding an `inline-block` grid: a ruler row of measure numbers and one row per string, with `CELL_WIDTH = 26` fixed cells and `columns = measures * subdivision` columns in one continuous strip.
- `ChordChartEditor` already computes a responsive column count with a `ResizeObserver` measuring a hidden column element. That pattern is available to reuse.
- Notes are stored as `{ string, column, fret }` with `column` an absolute index into `measures * subdivision`; measure boundaries are `column % subdivision === 0`. Nothing about the data model changes.
- `RepertoireSongForm` already uses a native `<details>`/`<summary>` disclosure for its "extra config" block, with a rotating chevron.
- The tab cell width is fixed today, so an unknown number of measures per line is the main open layout question.

## Goals / Non-Goals

**Goals:**

- Two independent, collapsed-by-default disclosures, one per editor, shared by both hosts through a single reusable component.
- A wrapped, Songsterr-style tab: measures flow into systems that fill the available width, with a system label carrying the first measure's number, and no horizontal scroll on the tab itself.
- Preserve every existing tab behavior (measure add/remove, resolution, fret entry, keyboard navigation, persistence) under the new layout.

**Non-Goals:**

- Import/export or any standard interchange format (MusicXML, Guitar Pro, ASCII tab). Deferred to a separate change.
- Any change to `RepertoireTab`, `RepertoireChordChart`, or persistence.
- Redesigning the chord/lyrics editing interactions themselves.

## Decisions

### 1. A shared `CollapsibleSection` component owns the section chrome and the disclosure

Introduce `src/components/ui/CollapsibleSection.tsx`: a controlled disclosure (`<button aria-expanded>` plus `<h2>` title and description) that renders the existing bordered `<section>` chrome, and renders its children only when expanded. Refactor `ChordChartEditor` and `TabEditor` to render only their controls inside it (their own `<section>` and `<h2>`/description move to the wrapper or the host).

Why controlled + conditional render, over a native `<details>`:

- The tab grid computes its systems from measured width via `ResizeObserver`. Inside a closed `<details>`, hidden content can measure as zero width and produce a wrong first layout; conditionally mounting children makes the measurement run exactly when the section opens.
- A single `aria-expanded` button keeps a clear, testable contract for "start collapsed" and "independent".

Alternatives considered:

- Plain `<details>` duplicated in both hosts (matches the existing `extraConfig` block): rejected because the markup, styling, and hidden-measurement issue would be duplicated twice.
- Wrapping the existing editors in `<details>` without touching them: rejected because it produces nested bordered sections and a double title.

### 2. Systems are computed from measured width, and each system fills that width

`TabEditor` measures its container (same `ResizeObserver` idea as `ChordChartEditor`), derives how many measures fit per system from a target minimum cell width, and chunks measures into systems. Each system renders a label (first measure number), the string label column, and the system's columns.

To guarantee "never scrolls horizontally", the system uses fractional columns: `grid-template-columns: auto repeat(<columnsInSystem>, minmax(0, 1fr))`. A system therefore always fits the measured width, even when only one measure (4–16 columns) is on it; cells shrink rather than overflow. The same column count is used for every system that has the full measures-per-system, so note spacing is consistent; the trailing system simply has fewer measures and left-aligned space left over.

Alternatives considered:

- Pure CSS `flex-wrap` over measure blocks: rejected because the string labels belong to the system, not to each measure, so wrapping measures directly misaligns the left column.
- Keep fixed `CELL_WIDTH` and let the page scroll when a measure cannot fit: rejected because the spec forbids horizontal scrolling of the tab and small screens would overflow.
- Let the user choose measures per row: rejected during scoping in favor of responsive systems.

### 3. The cursor stays `{ string, column }` across systems

The existing cursor model is already absolute over `measures * subdivision`, so wrapping is only a rendering concern: arrow navigation continues past a system's last column into the next system, and the selected-cell highlight is derived from the same `column`. No changes to keyboard handling beyond the layout-aware cell lookup.

### 4. System grouping is a pure helper, testable without the DOM

Add a pure function in `src/lib/repertoire-tab.ts`, e.g. `groupTabSystems(tab, maxColumnsPerSystem)`, that returns systems as `{ startColumn, columnCount, firstMeasure }` slices, with a matching unit test in `tests/repertoire-tab.test.mjs`. Keeping the chunking out of the component makes the wrap boundary logic (including "one measure when nothing fits", and correct handling when `subdivision` does not divide `maxColumnsPerSystem`) directly testable.

## Risks / Trade-offs

- [Fractional columns shift note spacing as the window resizes] → Accept it: cells stay aligned per system, and the spec only requires notes keep their string/time position, which the absolute `column` model guarantees.
- [A single 16-column measure on a very narrow screen makes cells tiny] → Enforce a floor of one measure per system and let cells shrink; if this proves unreadable, a later change can add pinch/zoom or a minimum width with page-level scroll.
- [Conditional mounting loses the free a11y/animation of `<details>`] → The controlled button keeps `aria-expanded`/`aria-controls`, so the contract stays clear; animation is not required.
- [`maxColumnsPerSystem` that is not a multiple of `subdivision` splits a measure across systems] → `groupTabSystems` clamps to whole measures (rounds down to a multiple of `subdivision`, minimum one measure), covered by a unit test.
- [Existing `RepertoireSongForm` tests or snapshots assume the editors are visible] → Check `tests/` and update any test that opens the form and expects the editors to be mounted.

## Migration Plan

No data migration: the stored shape of `tab` and `chordChart` is unchanged, so saved songs load as-is. The change is presentational. Rollback is reverting the commit; no persisted state depends on it.

## Open Questions

None. Import/export, explicitly deferred, is tracked as a follow-up change rather than an open question here.
