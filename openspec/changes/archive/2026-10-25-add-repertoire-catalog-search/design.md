# Design

## Context

See `proposal.md` for motivation and the spec delta for the contract.

Relevant current state:

- `RepertoireItem` (`src/types/practice.ts`) holds `title`, `artist?`, `tuning?`, `capo?`, `parts`, `resources`, `chordChart`, `tab`, links and difficulty. There is no album, year or artwork, and no image rendering anywhere in the repertoire.
- Creation happens in `RepertoireItemDialog` → `RepertoireSongForm`, backed by `useRepertoireSongDraft`; saving goes through `usePracticeStore.saveRepertoireItem` into a persisted zustand store. Editing happens inline in `RepertoireItemCard`.
- `normalizePracticeStorageState` only rewrites `difficulty`; every other field on a stored item is returned untouched, so unknown-to-older-code fields already survive a reload.
- The project enforces layer direction (`types ← utils ← services ← hooks ← components ← app`) in `tests/architecture-layers.test.mjs`: `services` may not import React or Next, `utils` may import neither services nor hooks. `docs/component-conventions.md` puts external calls in `services`, pure logic in `utils`, state machines in hooks, and keeps JSX free of branches and async flows.
- `ModalDialog` is a native `<dialog>`; dialogs are not nested anywhere in the app.
- The catalog request must be sent from the server: no provider key or third-party origin in the browser, and no CORS surprises.

Constraints: no new dependencies, local-first storage, offline reads and manual creation, i18n in `es`/`en`, 390 px mobile first.

## Goals / Non-Goals

**Goals:**

- One server-side lookup path with pure, tested parsing and ordering.
- A prefill that never becomes the only way to create or edit a song.
- New metadata that is optional, sanitised and backwards compatible.
- Artwork rendering with zero layout shift and no runtime dependency on the image.

**Non-Goals:**

- Songwriting credits, artist pages, dedupe, re-sync, Spotify OAuth.
- Normalising the existing `artist` strings or migrating stored items.
- Downloading artwork into local storage or Supabase.
- Searching licks or practice materials.

## Decisions

### D1. iTunes Search API as the source, Deezer as fallback

`GET https://itunes.apple.com/search?term=<q>&entity=song&limit=10&country=ES` needs no key or account, and returns `trackName`, `artistName`, `collectionName`, `releaseDate`, `artworkUrl100` and stable ids. Artwork is upgraded by replacing `100x100bb` with `600x600bb`, which the same URL pattern supports.

Deezer (`GET https://api.deezer.com/search?q=<q>&limit=10`) gives `title`, `artist.name`, `album.title`, `album.cover_xl` and is used only when iTunes fails or returns nothing.

Rejected:

- **Spotify**: needs OAuth (client id + secret) and its terms restrict caching/hotlinking artwork; it would put credentials and refresh logic in a local-first app that currently has none.
- **MusicBrainz first**: CC0 and stable MBIDs, but 1 req/s with a mandatory `User-Agent`, and matching releases takes far more work for the same three fields. It stays the candidate for credits later.
- **Client-side fetch**: CORS and rate limits per user, and the provider origin leaks into the bundle.

No provider returns a Spotify URL, so the prefill does not touch `spotifyUrl`; the later "paste a link" shortcut is how that field gets filled.

### D2. Layering: route → service → pure helpers → hook → component

| Piece | File | Reason |
| --- | --- | --- |
| Types | `src/types/catalog.ts` | `CatalogSource`, `CatalogCandidate`, `CatalogSearchOutcome` shared by every layer |
| Pure parsing and ordering | `src/utils/catalog-results.ts` | Payload → candidates, dedupe, artwork upgrade, year parsing, ranking; testable with `node --test` |
| Sanitising new item fields | `src/utils/repertoire-catalog.ts` | Trim, length caps, integer year, https-only artwork |
| Upstream client + cache | `src/services/catalog.ts` | External fetch only; no React/Next imports, per the layer test |
| HTTP boundary | `src/app/api/catalog/search/route.ts` | Reads `q`, validates, sets headers; the only Next-aware piece |
| Search state | `src/hooks/useCatalogSearch.ts` | Query, status, results, abort on unmount |
| Presentation | `src/components/repertoire/CatalogSearchPanel.tsx`, `CoverArt.tsx` | Props in, JSX out |

Alternative rejected: putting the parsers in the service. They would then be untestable without mocking `fetch`, and `utils` is where the project keeps deterministic logic.

### D3. Endpoint contract

```
GET /api/catalog/search?q=<text>&limit=<1..8, default 5>

200 { results: CatalogCandidate[], degraded: boolean }
400 { error: "query" }        // empty or shorter than 2 characters
```

- `degraded: true` with `results: []` means "the catalog could not be reached"; `degraded: false` with `results: []` means "no matches". The client needs that distinction to report the right message.
- `Cache-Control: public, max-age=300, stale-while-revalidate=3600`.
- In-memory cache in the service: normalised query → result, 15 min TTL, 100 entries max, so repeated searches cost nothing.
- Upstream budget: 3.5 s for iTunes, then 2.5 s for Deezer only if iTunes failed or returned nothing (`AbortSignal.timeout`); a partial answer is better than a hung dialog.
- The query is the only thing that leaves the device; no user id, no cookies forwarded.

### D4. Candidates are applied only on an explicit pick

`CatalogCandidate` carries `source`, `id`, `title`, `artist`, `album?`, `releaseYear?`, `coverUrl?`. Ordering prefers candidates whose normalised title and artist match the query, then album years descending, then provider order; duplicates by `title|artist|album` collapse.

The panel shows at most five rows: 40 px artwork, title, `artist · album · year`. Rows are buttons; the count is announced through a `role="status"` line. Picking one calls `onSelect(candidate)`; nothing is applied on hover, on typing or on a single match. Rejected: auto-selecting the best match, which silently imports live/remaster editions.

### D5. Creation prefill replaces only what the candidate owns

`useRepertoireSongDraft` gains `album`, `releaseYear`, `coverUrl`, `catalogSource`, `catalogId` and one `applyCatalogCandidate(candidate)` action that sets title, artist, album, year, artwork and provenance. Tuning, capo, guitar type, difficulty, parts, chord chart, tablature and resources are untouched, so a user who already picked a tuning keeps it.

Because the panel sits above the form, the dialog's initial focus selector must target the title field explicitly (`data-repertoire-title`) instead of `input:not([type=hidden])`; otherwise the query field steals the entry point.

### D6. Existing songs get the same panel with fill-the-gaps rules

The item edit form gains the panel and three small inputs (album, year, artwork URL) in its existing grid, so the fields can also be cleared by hand.

Applying a candidate to an existing song writes **only empty** metadata fields; title, artist, tuning, capo, parts, chord chart and tablature are never written. The save still goes through the existing `onSave`, so no new persistence path appears.

Rejected: a "reset metadata" action that overwrites everything, which risks destroying a manually curated year.

### D7. Optional fields, sanitised at the two write points

`RepertoireItem` gains:

```ts
album?: string;
releaseYear?: number;
coverUrl?: string;
catalogSource?: CatalogSource;
catalogId?: string;
```

`createRepertoireItem` accepts them and both write paths pass through `normalizeCatalogMetadata`: album trimmed and capped at 120 chars, `releaseYear` an integer between 1900 and next year, `coverUrl` https and capped at 500 chars, `catalogSource` in `{itunes, deezer}`, `catalogId` capped at 120 chars. Invalid values are dropped instead of rejecting the save, so a bad provider payload can never block a user.

No migration: items without the fields stay valid, and `normalizePracticeStorageState` already preserves them. A storage test pins that round-trip.

### D8. Artwork is a URL, not a file

`CoverArt` renders a fixed box (56 px in the list, 96 px in the detail) with `object-cover`, `loading="lazy"`, `referrerPolicy="no-referrer"` and a single `useState` for the load error. On error or when `coverUrl` is absent it renders the placeholder (`aria-hidden`), so rows never shift and no broken-image icon appears.

Offline the images may not load; the placeholder keeps the layout and every other field readable. Downloading into an attachment is deferred: it would require blob storage, sync semantics and a delete path, none of which this change needs.

### D9. Failure language is part of the contract

`useCatalogSearch` exposes `status: 'idle' | 'loading' | 'ready' | 'empty' | 'unavailable'`, derived from the endpoint's `degraded` flag and from a thrown `TypeError` (network). The panel maps each status to one line of copy; `unavailable` never says "no results", and the form keeps its values because the panel never owns the draft.

The search is submitted explicitly (button or Enter, minimum 2 characters), not on every keystroke: it keeps the request count predictable for a rate-limited public API and avoids a spinner per letter.

### D10. Copy lives in the existing `repertoire` i18n section

New keys in `src/i18n/es.ts` and `src/i18n/en.ts` under `repertoire`, no new namespace. Pure helpers that need copy receive the resolved texts, following `getDifficultyLabel`.

## Risks / Trade-offs

- **Wrong edition** (live, remaster, cover) → the panel shows album and year, never applies without a pick, and every field remains editable.
- **Provider changes or outages** → the fallback and the `degraded` state keep the app usable; the manual path is the default, not the fallback.
- **Rate limits** (~20 requests/minute per IP for iTunes) → explicit submit, 15-minute cache, five results per query.
- **Artwork rights and terms** → the URL is stored and hotlinked, which is the common personal-use pattern; if the app ever becomes public, revisit licensing and self-hosting before relying on it.
- **PWA offline** → covers may not load offline; fixed boxes and placeholders keep the library readable, and nothing in the read path calls the catalog.
- **Extending `RepertoireItem`** → older builds ignore unknown fields, and the sanitiser drops invalid ones, so a share/export between versions stays safe.
- **`artist` is still free text** → the catalog only improves new picks; existing spelling differences are not normalised by this change, and the ranking already groups case-insensitively.
- **Stale requirement nearby** → `repertoire-library` still says the add action opens a page, while the app opens a dialog. This change does not depend on that wording and does not rewrite it.

## Migration Plan

1. Ship as one deploy: types, helpers, service, route, UI and copy together. No schema or storage step.
2. Rollback: stop rendering the panel and the new fields; stored values become inert because every existing read ignores them and the storage normaliser preserves them.
3. No backfill job: existing items stay as they are until the user runs the lookup on one.

## Open Questions

None.
