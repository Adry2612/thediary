# Design

## Context

- `RepertoireView` renders one flat `<ul>` of `RepertoireItemCard`, fed by `getFilteredRepertoireItems(items, filters, stats)`, which filters by progress, search, guitar type and future-learn, then sorts by `original | recent | title | artist | practice`.
- The toolbar holds four `SelectField`s in a `grid-cols-2 sm:flex sm:flex-wrap`: progress, sort, guitar and list type. Each is wrapped in a `div` with a small uppercase label.
- `album` is stored on `RepertoireItem` but is not part of the search text and is not rendered in the card; `artist` is.
- `useRepertoireFilters` keeps every filter in `useState` — nothing is persisted — and `clearFilters` resets all of them plus the sort.
- `tests/architecture-layers.test.mjs` fixes the layer direction `types ← utils ← services ← hooks ← components ← app`, so the grouping is a pure function in `utils` and the component only renders what it returns.
- The project tests pure modules with `node --test`; there is no component test harness.

## Goals / Non-Goals

**Goals:**

- Let the user read the library by band or by record without losing the filters or the sort.
- Keep the change purely visual: same cards, same order inside groups, nothing persisted.
- Reuse the existing select pattern, so the toolbar looks like it grew by one control, not by a new component.

**Non-Goals:**

- Collapsible groups, group headers that are links, or counts in the summary metrics.
- Nested grouping (album inside artist).
- Persisting the grouping, remembering it per visit, or putting it in the URL.
- Grouping licks or the dashboard widgets.

## Decisions

### D1 — Grouping is a pure function over the already filtered list

`groupRepertoireItems(items, groupBy, { unknownLabel })` returns ordered groups:

```ts
type RepertoireGroupBy = "none" | "artist" | "album";
interface RepertoireGroup {
  key: string;
  label: string;
  items: RepertoireItem[];
}
```

The view computes `visibleItems` exactly as today and then groups it, so grouping cannot change which songs appear — only how they are laid out. With `"none"` it returns a single group and the view keeps rendering the flat list.

Why: the ordering rules (search, progress, sort) already live in `repertoire-filtering`; duplicating any of them in the grouping would let the two drift.

### D2 — Normalized keys, first spelling wins, untagged last

Keys come from the trimmed value normalized with `NFD`, accents stripped and lower-cased — the same normalization the search uses. Songs with `"metallica"` and `"Metallica"` land in one group, and the label is the first spelling found in the filtered order (which, with the artist sort, is the alphabetical first).

An empty value is not a group of its own key: all of them collect under one final group whose label the caller supplies (`Sin artista` / `Sin álbum`), so the untagged songs are always visible instead of vanishing.

Groups are sorted with `localeCompare("es", { sensitivity: "base" })`; the untagged group is forced to the end.

### D3 — The selector sits beside "Ordenar por" and does not count as an active filter

A fifth `SelectField` labelled `Agrupar por` with `Nada / Artista/banda / Álbum`. It is not part of `hasActiveRepertoireFilters` — the same rule as the sort — because "Limpiar filtros" appears for filters that hide songs, and grouping hides nothing. `clearFilters` resets it to `"none"` anyway, so the button still does the obvious thing.

### D4 — Sections with a heading and the current cards; no collapsing

When grouping is active the list becomes a `<div>` of `<section>`s. Each section has a `<header>` with the group name as `<h3>` and the count on the right, a hairline under it, and the existing `<ul className="space-y-4">` of cards below. The cards are untouched.

Why not collapsible: the user chose headers plus cards, open by default. The counts make long libraries scannable, and the existing card is already tall enough to carry the identity without a second level of interaction.

Why not render one continuous list with sticky headers: `<section>` gives the heading structure to assistive technology for free, and sticky offsets fight the app's own fixed header.

Alternatives rejected:

- **Two fixed views ("By artist" / "By album").** More navigation for a choice that fits in one select, and it would duplicate the toolbar.
- **Filters instead of grouping.** Filtering by a band is useful, but it answers "show me this band", not "show me the library organised".
- **Grouping inside the filtering util.** It would return a different shape for every caller and mix two concerns.

## Risks / Trade-offs

- **[Grouping hides the search relevance]** → Nothing is hidden: search and filters run first, grouping only reshapes the survivors, and the count line still reports `X de Y`.
- **[Two spellings of the same band split the group]** → Keys are accent- and case-insensitive; genuine typo variants (`The Beatles` vs `Beatles`) still create two groups, which is honest about the data and fixable by editing the song.
- **[A long library becomes a long page]** → Each group adds a 40 px heading; the cards dominate anyway, and the user can go back to the flat list with one select.
- **[The toolbar grows to five controls]** → It already wraps (`sm:flex-wrap`) and, below `sm`, it is a two-column grid; the fifth control takes the empty cell on the last row.

## Migration Plan

Pure UI and pure-function change: no storage migration, no API change, no new dependency. Deploy is a normal build; rollback is reverting the commit.

## Open Questions

None.
