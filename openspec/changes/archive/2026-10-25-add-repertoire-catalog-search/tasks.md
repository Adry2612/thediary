# Tasks

## 1. Metadata on the item

- [x] 1.1 Add `src/types/catalog.ts` (`CatalogSource`, `CatalogCandidate`, `CatalogSearchOutcome`) and extend `RepertoireItem` in `src/types/practice.ts` with optional `album`, `releaseYear`, `coverUrl`, `catalogSource` and `catalogId`; verification: `npm run typecheck` passes and no existing item field changes type.
- [x] 1.2 Add `normalizeCatalogMetadata` in `src/utils/repertoire-catalog.ts` (trim, 120-char album, integer year 1900..next year, https-only 500-char artwork, known source, 120-char id, invalid values dropped) and use it from `createRepertoireItem`; verification: a new `tests/repertoire-catalog.test.mjs` covers valid, empty, oversized, wrong-protocol and out-of-range values and `node --test tests/repertoire-catalog.test.mjs` passes.
- [x] 1.3 Confirm stored items keep the new fields: extend the storage-normalisation test with an item carrying album/year/artwork/provenance; verification: the normaliser returns those fields untouched and the existing difficulty normalisation still passes.

## 2. Catalog lookup on the server

- [x] 2.1 Add `src/utils/catalog-results.ts` with `parseItunesResults`, `parseDeezerResults`, `mergeCandidates`, `upgradeArtworkUrl`, `parseReleaseYear` and query normalisation, keeping the query match and year ordering described in D4; verification: `tests/catalog-results.test.mjs` covers artwork upgrade (`100x100bb` → `600x600bb`), missing release date, duplicates, query-match ordering, limit and malformed payloads.
- [x] 2.2 Add `src/services/catalog.ts`: iTunes first with a 3.5 s `AbortSignal.timeout`, Deezer fallback only on failure or empty (2.5 s), 15-minute 100-entry in-memory cache keyed by the normalised query, returning `CatalogSearchOutcome`; verification: a `node --test` case with a stubbed `globalThis.fetch` proves the fallback, the timeout abort and the cache hit (second call performs no request).
- [x] 2.3 Add `src/app/api/catalog/search/route.ts`: `q` required with at least 2 characters, `limit` clamped to 1–8 (default 5), `200 { results, degraded }`, `400 { error }`, `Cache-Control: public, max-age=300, stale-while-revalidate=3600`; verification: `curl` against the dev server returns candidates for a known song, `results: []` for gibberish, `400` for an empty `q`, and `degraded: true` when the upstream hosts are unreachable.

## 3. Search in the creation dialog

- [x] 3.1 Add `src/hooks/useCatalogSearch.ts` with `status: 'idle' | 'loading' | 'ready' | 'empty' | 'unavailable'`, explicit `search(query)`, `AbortController` cleanup on unmount and previous results kept while loading; verification: typecheck passes and the panel behaves per status in the browser (spinner, rows, empty line, unavailable line).
- [x] 3.2 Add `src/components/repertoire/CoverArt.tsx` and `CatalogSearchPanel.tsx`: fixed artwork box, 40 px rows with title/artist/album/year, row buttons, result count announced with `role="status"`, `onSelect(candidate)` only; verification: at 390 px the panel fits the dialog, Tab reaches each row and Enter picks it, and a missing or failing image shows the placeholder without shifting the list.
- [x] 3.3 Wire the panel into `RepertoireSongForm` and add `album`, `releaseYear`, `coverUrl`, `catalogSource`, `catalogId` plus `applyCatalogCandidate` to `useRepertoireSongDraft`; pass them to `createRepertoireItem`, and change the dialog's initial focus to the title field (`data-repertoire-title`); verification: picking a candidate fills title/artist/album/year/artwork, a tuning or capo already chosen is not reset, and the saved item keeps all of it after a reload.
- [x] 3.4 Add the `es`/`en` copy for the panel, the four status lines, the album/year labels and the "search catalog" action under the `repertoire` section; verification: switching the language in Settings renders every new string in both languages with no missing key.

## 4. Existing songs and artwork

- [x] 4.1 Add album, release-year and artwork inputs to the edit grid in `RepertoireItemCard` and pass them through the existing `onSave` with `normalizeCatalogMetadata`; verification: editing and clearing each field persists and the item keeps its tuning, capo, parts, chord chart and tablature.
- [x] 4.2 Add the same catalog panel to the item edit form with the fill-only-empty rule: a chosen candidate writes only album, year and artwork when empty and never writes title, artist, tuning, capo, parts, chord chart or tablature; verification: a song without album/year gets them, a song with an album keeps it, and cancelling the lookup changes nothing.
- [x] 4.3 Render `CoverArt` in the list card and in the detail view with the fixed boxes from D8 (`loading="lazy"`, `referrerPolicy="no-referrer"`, placeholder on error); verification: a mixed list keeps every row aligned, a broken artwork URL falls back to the placeholder, and scrolling at 390 px shows no layout shift.

## 5. Verification

- [x] 5.1 Run `npm run typecheck`, `npm test` and `npm run build`; verification: all three exit 0 and the new catalog tests are part of the suite total.
- [x] 5.2 Browser pass at 390 px and 1024 px with the upstream stubbed: candidates render and prefill, gibberish shows "no matches", an upstream error shows "catalog unavailable" while the form keeps its values and still saves, and blocking the route shows the same for offline; verification: a pass/fail note per scenario.
- [x] 5.3 Confirm no dependency or configuration drift: `git diff package.json package-lock.json tsconfig.json next.config.ts`; verification: the diff is empty.

## Verification notes

- **390 px, creation**: pass. The panel shows five rows with 40 px artwork, Enter launches the search, picking a result fills title, artist, album, year and artwork; a capo typed before searching stays at 2.
- **Saved item**: pass. The stored item carries `album`, `releaseYear`, `coverUrl`, `catalogSource` and `catalogId`; reopening the app keeps them.
- **Statuses**: pass with the route intercepted. Empty → "No hay coincidencias en el catálogo."; `degraded: true` and an aborted request → "No se pudo conectar con el catálogo…"; the three cases are distinguishable.
- **English**: pass. With `thediary.locale = en` the panel, the rows ("5 results", "Use") and the metadata labels ("Album", "Release year") render in English.
- **Backfill**: pass. From an existing song the panel opens with "Hurt Johnny Cash", fills album, year and artwork, leaves the title and artist untouched and closes after the pick.
- **Metadata editing**: pass. Clearing the album from the item's extra settings persists while the release year, the artwork and the parts stay.
- **Artwork**: pass. The list box measures 56×56 and the detail box 96×96; a missing or failing URL renders the note placeholder in the same box, so rows stay aligned.
- **Catalog outage at 1024 px**: pass. The search row lays out horizontally, the message is the "unavailable" one, the typed title and album survive and the song saves by hand.
- **Gates**: pass. `npm run typecheck`, `npm test` (602 tests) and `npm run build` exit 0.
- **No drift**: pass. `git diff` for `package.json`, `package-lock.json`, `tsconfig.json` and `next.config.ts` is empty.

## Workflow follow-up

- Archive the change after the review and the browser pass are accepted.
- The "paste a Spotify/YouTube link" shortcut is a separate change built on the same resolver; do not fold it into this one.
