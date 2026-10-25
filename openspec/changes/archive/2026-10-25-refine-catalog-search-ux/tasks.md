# Tasks

## 1. Result ordering

- [x] 1.1 Rewrite `mergeCandidates` and `duplicateKey` in `src/utils/catalog-results.ts` so the answer keeps the provider's order: concatenate primary and fallback, keep the first occurrence of each normalized title + artist, slice to the limit, and delete the relevance score, its token matching and the year tie-break; verification: `npm run typecheck` passes and `grep -n "relevanceScore\|releaseYear" src/utils/catalog-results.ts` no longer shows a sort by year.
- [x] 1.2 Replace the ranking cases in `tests/catalog-results.test.mjs` with provider-order cases built on the real iTunes sequence for "master of puppets", covering: Metallica first, the three Metallica copies collapsed to one, the same title by different artists each listed once, fallback order preserved, limit applied to the tail, and malformed payloads still yielding `[]`; verification: `node --test tests/catalog-results.test.mjs` passes.

## 2. Lookup dialog

- [x] 2.1 Add `buildCatalogQuery(title, artist)` to `src/utils/repertoire-catalog.ts` (trim both, join the non-empty ones with a single space, return `""` when both are empty) and cover it in `tests/repertoire-catalog.test.mjs`; verification: `node --test tests/repertoire-catalog.test.mjs` passes.
- [x] 2.2 Add `src/components/repertoire/CatalogSearchDialog.tsx` modelled on `ChordFinderDialog`, mounted only while open and opened with `useDialogModal(true)`: `DialogHeader` with the close button, `SearchField` focused on open, `aria-live` status, a scrolling list of candidate cards with `CoverArt` and title / artist / album · year, `onSelect` then close, `cancel` and backdrop click close, and the search discarded on unmount; verification: `npm run typecheck` passes and the component imports nothing from `services/catalog.ts` directly.
- [x] 2.3 Add the dialog copy — title, description, trigger label and the retry-free status reuse — to `src/i18n/translations.ts` for `es` and `en`, dropping the strings only the inline panel used; verification: `node --test tests/i18n.test.mjs` passes and `grep -rn "catalogSearchHint" src` points only at the trigger hint and the dialog description.
- [x] 2.4 Make the dialog search while typing: a `useEffect` on the query waits 350 ms after the last change and calls `search`, clears the results through `reset()` below two characters, and compares against the last searched text so it does not repeat itself; Enter short-circuits the wait; verification: typing "master of puppets" letter by letter produces one request, one letter produces none, and Enter produces one without a second one later.
- [x] 2.5 Give `useCatalogSearch` back a `reset()` that aborts the request in flight and returns the status to `idle`; verification: clearing the query empties the list and the status line.

## 3. Creation form

- [x] 3.1 Replace the magnifier beside the title with a labelled `Button` ("Buscar en el catálogo", decorative `SearchIcon`) above the fields followed by the existing hint, and open `CatalogSearchDialog` from it with `applyCatalogCandidate` as `onSelect`; verification: the button is 226 px wide at 1024 px with a visible label, and the form renders no query field, status or result list while the dialog is closed.
- [x] 3.2 Keep the fields as they are — title and artist full width, album `2fr` and year `1fr`, study material under them — so the button does not disturb their layout; verification: the fields sit below the button and the hint, and nothing shifts when the dialog opens.
- [x] 3.3 Delete `src/components/repertoire/CatalogSearchPanel.tsx` and every import of it; verification: `grep -rn "CatalogSearchPanel" src tests` returns nothing and `npm run typecheck` passes.

## 4. Existing song

- [x] 4.1 Point the "Buscar datos" action in `src/components/repertoire/RepertoireItemCard.tsx` at the same dialog, passing `buildCatalogQuery(item.title, item.artist)` so it searches on open, and removing the inline panel state; verification: from a saved song the dialog opens already showing results for its title and artist, and picking one saves the metadata and closes.
- [x] 4.2 Confirm the fill-only-empty rule still holds through the new entry point and that closing the dialog without picking leaves the item untouched; verification: `node --test tests/repertoire-catalog.test.mjs` passes and a manual close-without-picking leaves the stored item byte-identical in `localStorage`.

## 5. Integration verification

- [x] 5.1 Run the gates: `npm run typecheck`, `npm test` and `npm run build`; verification: all three exit 0 and the suite count grows by the new cases only.
- [x] 5.2 Check the real flow at 390 px and 1024 px against the running API: the button opens the dialog, "master of puppets" leads with Metallica, the empty / unavailable / offline states are distinguishable inside the dialog, Enter searches and Enter on a row applies, Escape closes only the dialog, and manual creation still saves with the dialog never opened; verification: every point observed in the browser and written down in the verification notes.
- [x] 5.3 Add the verification notes at the end of this file, including the request counts for the typed bursts; verification: the notes list each check with its result.

## 6. Creation modal room

- [x] 6.1 Add a `wide` variant (`max-w-3xl`) to `src/components/ui/ModalDialog.tsx` and switch `RepertoireItemDialog` to it, removing the `max-w-3xl` class that the `lg` variant overrides; verification: at 1024 px the creation dialog measures 768 px wide and no other modal changes size.

## Workflow follow-up

- Rebuild and restart the `:8080` production server before testing the installed app on the phone, since it still serves a pre-change build.
- Review the diff and commit; the change is ready to archive once the manual checks in 5.2 pass.

## Verification notes

- **Entry point**: pass. The creation form shows "Buscar en el catálogo" as a 226 px labelled button above the fields with the one-line hint under it; activating it opens the lookup with the query field focused and nothing else on the form changes.
- **Search while typing, 390 px**: pass. "master of puppets" typed letter by letter at 55 ms intervals produced exactly one request for `master of puppets` and five rows; one character produced no request.
- **Enter**: pass. Enter with the field holding "nothing else matters" fired one request immediately and no second one after the pause; the pending timer is cleared.
- **Clearing**: pass. Deleting the query down to one character removed the five rows and left the status line empty.
- **Ranking**: pass. "master of puppets" leads with `Master of Puppets · Metallica · Master of Puppets (Deluxe Box Set) · 1986`, followed by the Metallica live version, Trivium, Metallica & San Francisco Symphony and Steve 'n' Seagulls. The three copies of the Metallica studio track collapse to one row.
- **Choosing**: pass. Picking the first row closes the lookup, leaves the creation dialog open, and fills title, artist, album and year (`Master of Puppets`, `Metallica`, `Master of Puppets (Deluxe Box Set)`, `1986`) plus the cover.
- **Escape**: pass. It closes only the lookup; the creation dialog stays open with its values. Chrome swallows Escape inside the search field, so the dialog handles the key itself.
- **States**: pass with the route intercepted. Empty → "No hay coincidencias en el catálogo."; `degraded: true` and an aborted request → "No se pudo conectar con el catálogo…"; all three are distinguishable and the form keeps what was typed.
- **Manual creation**: pass. "Canción sin catálogo" saved with its album and no `coverUrl` or `catalogId` after searching three times and never picking a candidate.
- **Existing song**: pass. "Buscar datos" opens the lookup pre-searched with `Hurt Johnny Cash` (query focused, five rows), Escape leaves the stored item byte-identical, and picking fills the album while keeping the release year, title and artist.
- **Layout**: pass. The creation modal measures 768 px and the lookup 358 px at 390 px / 512 px at 1024 px; no horizontal overflow at either width, and the fields do not move when the dialog opens or closes.
- **Gates**: pass. `npm run typecheck`, `npm test` (610 tests: +4 in `catalog-results`, +3 in `repertoire-catalog`, +1 in `i18n`) and `npm run build` exit 0.
