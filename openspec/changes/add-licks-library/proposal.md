# Proposal

## Why

Licks, riffs and short technical exercises currently live inside the repertoire next to full songs, so a saved idea competes with the songs the user is learning, carries no speed goal of its own, and cannot express technique systematically. The result is that quick ideas get lost, progress at the metronome cannot be judged per passage, and free-text technique labels cannot feed any reliable analysis of what the user actually practises.

## What Changes

- Introduce a dedicated Licks library, separate from songs, with its own page and main-navigation entry: a list of licks with title, plain-text tablature shown in a monospaced style, musical key, techniques, and optional link to a repertoire song.
- Add a lick editor where the user writes tablature as plain text, chooses a key from the supported musical keys, picks techniques from a closed, extensible global catalogue, and optionally links the lick to one of their songs.
- Add per-lick metronome tracking: a target BPM, the current BPM, and a dated BPM history with optional notes. Recording a BPM becomes a history entry and updates the current BPM and last-practised date.
- Add a per-lick BPM evolution chart replacing any global speed comparison: a line over time for the selected lick, a dashed target line, and the percentage of the target reached, with the starting BPM shown against the current one.
- Add technique and key distribution views built from the saved licks, so the user can see practice bias (for example, a majority of legato licks in A minor) and is nudged to explore other techniques and keys.
- Add the "Forgotten lick" card to the licks dashboard: it picks a saved lick whose last practice is older than 30 days or whose practice frequency is lowest relative to its age, shows how long ago it was practised, and offers opening the lick or marking it practised today.
- **BREAKING**: move licks out of the repertoire. Existing repertoire items of kind `lick` are migrated into the new collection once, their structured tab is converted to plain text, and they leave the repertoire list; their missing key, techniques and BPM history stay empty rather than being invented. Historical practice records keep their stored item names, but those migrated items no longer resolve as repertoire items.
- Retire the lick option from the repertoire: the repertoire keeps songs only, and its type label and type filter adjust accordingly.

Out of scope:

- Tab playback or synthesis for licks, and any MusicXML, Guitar Pro or ASCII interchange format.
- Linking licks to practice phases, routines or session timers. The forgotten-lick card opens the lick instead of launching a practice session.
- Changing the existing per-note performance techniques of the song tab editor; the new technique catalogue classifies a lick as a whole and is a separate axis.
- Migrating BPM data for old licks, which have none, or guessing their key or techniques.

## Capabilities

### New Capabilities

- `licks-library`: the lick collection itself — creating, editing and deleting a lick, its plain-text tablature, musical key, global techniques, optional song link, per-lick BPM target and history, persistence, and the one-time migration of licks out of the repertoire.
- `licks-analytics`: the metrics read from the collection — the per-lick BPM evolution chart, the technique and key distribution, and the forgotten-lick selection with its recovery action.

### Modified Capabilities

- `repertoire-library`: the repertoire holds songs only; the type label and the type filter no longer describe licks, and migrated licks disappear from its lists and totals.
- `app-navigation`: the main navigation includes the Licks section and marks it as the current section while the user is in it.

## Impact

- `src/types/practice.ts` (`RepertoireItemKind` becomes song-only for new data; new lick types; `PersistedPracticeState` gains the licks collection), plus a new `src/types/lick.ts`.
- `src/stores/practiceStorage.ts` and `src/stores/normalizePracticeStorageState.ts` (persist and normalize licks, validate keys and technique ids, discard invalid values without losing the lick).
- `src/lib/supabase/practice-data.ts` (merge and normalize the new collection in the single per-user `practice_data` state).
- New `src/lib/licks/*` helpers (taxonomy, BPM history, forgot algorithm, distribution, tab conversion for migration) with node tests under `tests/*.test.mjs`.
- New `src/app/(workspace)/licks/*` routes and `src/components/licks/*` views, including hand-written SVG/CSS charts consistent with the dashboard, no new chart dependency.
- `src/components/repertoire/*` and `src/lib/repertoire-item.ts` (remove lick creation/editing; keep reading legacy rows defensively).
- `src/components/layout/SiteNavigation.tsx` and `src/i18n/es.ts` / `src/i18n/en.ts` (section entry, labels, taxonomy names, metrics copy).
- One-time migration triggered on hydration when stored repertoire items of kind `lick` exist; it must be idempotent and must not run before the store has hydrated.
- No database migration: the new collection travels inside the existing JSON `state` row, and legacy rows remain readable.
