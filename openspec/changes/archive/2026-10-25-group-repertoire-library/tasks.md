# Tasks

## 1. Grouping rules

- [x] 1.1 Add `src/utils/repertoire-grouping.ts` with `RepertoireGroupBy`, `RepertoireGroup` and `groupRepertoireItems(items, groupBy, { unknownLabel })`: normalized accent- and case-insensitive keys, first spelling as the label, alphabetical groups, untagged group last, single group for `"none"`; verification: `npm run typecheck` passes.
- [x] 1.2 Cover it in `tests/repertoire-grouping.test.mjs`: grouping by artist, by album, merged spellings, untagged group last with its label, alphabetical order ignoring accents, order preserved inside each group, and `"none"`; verification: `node --test tests/repertoire-grouping.test.mjs` passes.

## 2. State and copy

- [x] 2.1 Add `groupBy` and `setGroupBy` to `src/hooks/useRepertoireFilters` and reset it in `clearFilters`, leaving it out of `hasActiveRepertoireFilters`; verification: choosing a grouping does not make "Limpiar filtros" appear on its own, and pressing it returns the list to the flat view.
- [x] 2.2 Add the strings to `src/i18n/translations.ts` for `es` and `en`: `groupBy`, `groupNone`, `groupArtist`, `groupAlbum`, `groupUnknownArtist`, `groupUnknownAlbum`; verification: `node --test tests/i18n.test.mjs` passes and both languages have every key.

## 3. View

- [x] 3.1 Add the "Agrupar por" `SelectField` to the toolbar beside "Ordenar por", following the existing label + select pattern; verification: at 390 px the toolbar stays a two-column grid with no overflow, at 1024 px the five controls fit in one wrapped row.
- [x] 3.2 Render the grouped view: one `<section>` per group with an `<h3>` heading, the song count and the existing card list; keep the flat `<ul>` when the grouping is `"none"`; verification: switching between none, artist and album changes only the headers and the distribution, and every card keeps its behaviour.
- [x] 3.3 Confirm the count line, the empty state and "Limpiar filtros" keep working with grouping active; verification: with a search that hides everything the empty state appears, and with a filter plus grouping the reported count matches the sum of the groups.

## 4. Verification

- [x] 4.1 Run `npm run typecheck`, `npm test` and `npm run build`; verification: the three exit 0.
- [x] 4.2 Check the real library at 390 px and 1024 px with the seeded songs: group by artist, group by album, untagged songs at the end, order inside groups, back to none; verification: screenshots at both widths and the measurements written in the notes below.
- [x] 4.3 Add the verification notes at the end of this file; verification: each check is listed with its result.

## Verification notes

- **Selector**: pass. "Agrupar por" sits between "Ordenar por" and "Tipo de guitarra" with the values `Sin agrupar / Artista/banda / Álbum`. With only a grouping active the "Limpiar filtros" button does not appear (grouping hides nothing), and pressing it after another filter returns the select to `Sin agrupar`.
- **Groups by artist, 1024 px**: pass. Headers `Banda Local`, `Johnny Cash`, `Metallica` and `Sin artista`, alphabetical, with `2 canciones`, `2 canciones`, `2 canciones`, `1 canción`; the cards under each header keep their order and behaviour.
- **Groups by album, 1024 px**: pass. Headers `American IV: The Man Comes Around`, `Maqueta` and `Sin álbum`, with the songs that carry no album collected in the last section.
- **Narrow screen, 390 px**: pass. The toolbar stays a two-column grid with the fifth control in the last free cell, no horizontal overflow (`390/390`), and the group heading wraps while the count stays on its right.
- **Filters and order**: pass. With `Por aprender` plus grouping the headers render and the count still reports `7 de 7 elementos`; with a search that matches nothing the empty state replaces the groups instead of showing empty sections.
- **Back to the flat list**: pass. `Sin agrupar` restores the previous `<ul>` with no headings.
- **Gates**: pass. `npm run typecheck`, `npm test` (617: +7 in `repertoire-grouping`) and `npm run build` exit 0.
