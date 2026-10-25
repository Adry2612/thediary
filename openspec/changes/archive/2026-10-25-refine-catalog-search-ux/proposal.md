# Proposal

## Why

The catalog lookup shipped as a magnifier next to the title that opened a modal, and the creation modal still does not convince. The trigger was cryptic, the panel had been stacked on top of the fields at one point, and the search only answered when the user pressed a button, so finding a song took more steps than it looks like it should: click a small icon, type, submit, scan.

What the form needs is a plain, visible button that says what it does, a modal with room for the query and the candidates, and results that keep up with the typing. Functionally, the results were not credible either: searching "master of puppets" listed a novelty cover, an a-cappella cover and a lullaby version before Metallica, because the app re-sorted the catalog's answer by release year and treated every exact title match as equally relevant.

Two things follow. The lookup gets one obvious entry point and answers as the user types, and the order the catalog already computed has to be the order the user sees.

## What Changes

- **A labelled search button in the creation form.** "Buscar en el catálogo" sits above the song's fields, with the one-line explanation under it. It opens the lookup; the fields never move and never share space with the results.
- **A modal that answers while typing.** The dialog holds the query and the candidates. After two characters, each pause of 350 ms refreshes the results without a submit; Enter searches immediately. A burst of keys produces one request, not one per letter.
- **Candidates as a scannable list.** Each row carries artwork, title, artist, album and release year, in a bounded, scrolling area, so five results never overflow the dialog.
- **One lookup component.** The creation form and the "Buscar datos" action on a saved song open the same dialog; the saved-song path still arrives pre-searched with the song's title and artist.
- **Results keep the catalog's order.** The merge step stops scoring and stops sorting by year: it preserves the order the provider returned (which already leads with the canonical recording), collapses duplicates by title and artist, and slices to the limit.
- **The creation dialog gets room.** It widens to `max-w-3xl` so the fields, the chord chart and the tablature have air, while the lookup keeps its own 512 px modal.
- **Unchanged**: the server route, the upstream providers, the timeouts, the cache, the metadata model, the fill-only-empty rules, the artwork rendering and the copy for the empty/unavailable states.

Out of scope: new catalog providers, lyrics, Spotify, artwork downloads, reordering by popularity rank, auto-applying a result, recent searches, and any redesign of the chord chart or the tab editors.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `repertoire-library`: the creation requirement changes to describe the button, the dialog and the search-as-you-type behaviour; the backfill requirement keeps the same dialog; and a new requirement fixes how catalog results are ordered and deduplicated.

## Impact

- **UI**: `CatalogSearchDialog.tsx` owns the query, the debounced search and the candidate list; `RepertoireSongForm` gains the trigger button and drops the magnifier icon; `RepertoireItemDialog` uses a wider modal variant; `CatalogSearchPanel.tsx` is deleted (there is only one shell now).
- **Pure logic**: `src/utils/catalog-results.ts` — `mergeCandidates` loses the relevance score and the year sort; `duplicateKey` stops including the album.
- **Hooks and copy**: `useCatalogSearch` regains a `reset` used when the query drops below the minimum; `src/i18n/translations.ts` keeps the existing catalogue strings, which now label the button and the dialog.
- **Tests**: `tests/catalog-results.test.mjs` is rewritten around provider order and duplicate collapsing. No component test harness is added: the project tests pure modules with `node --test`.
- **No change** to `src/app/api/catalog/search/route.ts`, `src/services/catalog.ts`, the item schema, the persistence layer, dependencies or configuration.
- **Accessibility**: the trigger is a text button with a visible label and a decorative icon, the query field is focused on open and keeps its accessible name, the status line is an `aria-live` region, and the dialog keeps the app's native `<dialog>` focus and Escape behaviour, including while the creation dialog is already open.
