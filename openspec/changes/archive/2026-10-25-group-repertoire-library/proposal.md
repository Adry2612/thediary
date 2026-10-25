# Proposal

## Why

The catalog lookup now fills each song's artist and album, but the repertoire still reads as one flat list. With a handful of songs that is fine; with a library of thirty it is not. The only way to see "everything by this band" or "the songs from this record" today is to type the name into the search box and lose the rest of the list, or to sort by artist and scroll until the group appears, with no boundary telling you where one band ends and the next begins.

The data is already stored — `artist` and `album` are part of every item — so the library can offer grouping as a pure view choice, without touching what is saved.

## What Changes

- **A grouping selector in the library toolbar.** Next to "Ordenar por", a new "Agrupar por" select with three choices: none (the current flat list), artist/band, and album.
- **Groups as sections.** Each non-empty group renders a heading with its name and the number of songs it holds, and the existing cards underneath. No card changes.
- **Songs without the value go last.** A final "Sin artista" or "Sin álbum" group collects the songs that do not carry that field, instead of disappearing or being mixed in.
- **Alphabetical groups, current order inside.** Groups are ordered by name, accent- and case-insensitively; inside each group the songs keep the order the sort selector produced.
- **It is only a view.** Filtering, searching and sorting apply first, then the songs are grouped. Nothing is written to storage, and "Limpiar filtros" returns the list to the flat order, like the sort choice.
- **Unchanged**: the card, the filters, the search, the summary metrics, the practice widgets and the stored item schema.

Out of scope: grouping the dashboard widgets, saving the grouping between visits, nested groups (album inside artist), collapsible groups, and grouping licks.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `repertoire-library`: a new requirement describes the grouping selector, the section headings and counts, the group order and the untagged group.

## Impact

- **UI**: `src/components/repertoire/RepertoireView.tsx` gains the selector and a grouped rendering branch.
- **Pure logic**: a new `src/utils/repertoire-grouping.ts` with `groupRepertoireItems`, covered by `tests/repertoire-grouping.test.mjs`.
- **State and copy**: `useRepertoireFilters` holds the grouping choice; `src/i18n/translations.ts` gains the selector labels, the two untagged group names and the count string for `es` and `en`.
- **No change** to storage, the item schema, the API, dependencies or configuration.
