# Proposal

## Why

Almost every song in the repertoire already exists on a music platform, but the app still asks the user to retype its title and artist and then stores nothing else: no album, no release year, no artwork. The library is a wall of text, artist spellings drift because `artist` is free text, and there is no way to recognise a song at a glance.

Filling those fields by hand for the roughly sixty songs that already exist is not realistic, so the fix has to be lookup-assisted. The practice data that makes the app different — tuning, capo, parts, chord chart, tablature — stays with the user: no catalog knows it, and none of it changes here.

## What Changes

- **Catalog lookup**: a server-side search against a free music catalog, proxied through the app so no credential or third-party origin reaches the browser.
- **Search in the creation flow**: the "add to repertoire" dialog gains a search field. Results show artwork, artist, album and year so the user can tell editions apart. Choosing one prefills the form; every field stays editable and "create from scratch" is always available.
- **Backfill for existing songs**: the same lookup, pre-filled with the song's title and artist, from the item's edit form. It fills only empty metadata and never touches title, artist, tuning, capo, parts, chord chart or tablature.
- **Optional metadata on an item**: album, release year, artwork URL and the catalog source/id. All optional, no migration, and an item without them keeps working and looks right.
- **Artwork in the library**: the card and the detail show the cover when there is one and a neutral placeholder otherwise, with a fixed box so the layout does not jump and no dependency on the network to render.
- **No blocking**: the manual path, offline creation and every read stay exactly as they are. A failed lookup produces a recoverable message, never a dead end.

Out of scope: songwriting credits (no reliable free source), duplicate detection, downloading the artwork into the device, automatic re-sync, Spotify OAuth, and any attempt to infer tuning, capo or parts from the catalog.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `repertoire-library`: adds catalog-assisted creation and backfill of optional album/year/artwork metadata, plus how that metadata is shown and kept. The difficulty, practice-time and artist-ranking requirements stay unchanged.

## Impact

- **New server code**: `src/app/api/catalog/search/route.ts` and `src/services/catalog/` (upstream client, timeout, cache).
- **New pure helpers**: `src/utils/catalog-results.ts` for payload normalisation and candidate ordering, covered by `node --test` fixtures.
- **Data model**: `RepertoireItem` and `createRepertoireItem` in `src/types/practice.ts` and `src/utils/repertoire-item.ts` gain optional fields; `normalizePracticeStorageState` must keep them.
- **UI**: `RepertoireSongForm`, `useRepertoireSongDraft`, `RepertoireItemDialog`, `RepertoireItemCard` and a new catalog search component; new copy in `src/i18n/es.ts` and `src/i18n/en.ts`.
- **Network and privacy**: one outbound request per explicit search, sent to iTunes Search API (Deezer as fallback) with only the typed query. No account, no key, no analytics.
- **Dependencies and storage**: no new packages and no storage migration. Items without the new fields remain valid.
- **Assumption**: phase 1 is text search; the "paste a Spotify/YouTube link" shortcut is a later addition on top of the same resolver.
