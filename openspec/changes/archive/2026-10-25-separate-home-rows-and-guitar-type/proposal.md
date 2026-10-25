# Proposal

## Why

Two loose ends remain after the home and calendar work. On wide screens the quick-start routines and the recent repertoire still share a two-column row, but they read better as two independent full-width rows. Separately, a quick practice started from a repertoire song is recorded with the last used guitar type instead of the type declared on the song: the quick-practice plan does not carry it, the session falls back to the last used type (electric in the reported case), and the dashboard's electric/acoustic balance shows the wrong side. The chart itself reads the saved session type correctly; the session is saved with the wrong one.

## What Changes

- **The home screen gives routines and repertoire their own rows.** The quick-start routines and the recent repertoire become two stacked, full-width sections in that order on every viewport, instead of sharing a two-column row. Each keeps its own header, link, loading state and empty state. The repertoire card grid uses the full width: two columns on narrow screens, three on medium and four on wide screens.
- **A quick practice from a song starts with the song's guitar type.** When the repertoire item declares electric or acoustic, the quick-practice plan carries that type, the session header shows it, and the saved practice stores it, so the dashboard balance counts it on the correct side. When the item declares no type, the existing behaviour stays: the session starts from the last used type or remains unclassified, and no type is invented.
- **Saved history is not rewritten.** Sessions already recorded with the wrong type keep it; the user can correct them from the session editor and the balance updates. No automatic migration touches past practices.

This change builds on `refine-calendar-and-home-cards` for the home repertoire cards and on the earlier archive chain. It does not change the chart calculation, the repertoire item form, the last-used-type preference or the dashboard's unclassified handling.

## Capabilities

### New Capabilities

- `home-overview`: composes the home screen's sections: their order, their separation and how each one uses the available width.

### Modified Capabilities

- `practice-session-management`: a quick practice started from a repertoire song takes that song's declared guitar type.

## Impact

- **UI**: `HomeView.tsx` (two stacked rows), `RecentRepertoire.tsx` and `SavedRoutines.tsx` (full-width responsive grids).
- **Practice launch**: `practice-launch.ts` copies the item's `guitarType` into the quick repertoire plan; `PracticeSession.tsx` already respects a type set on the session, and `practice-session-record.ts` already stores it.
- **Copy**: no new strings for the layout; the existing headings, links and empty states are reused.
- **Tests**: `tests/practice-launch.test.mjs` gains the quick-repertoire guitar-type cases; the existing guitar-balance tests remain valid because the chart logic does not change.
- **No change** to the store schema, the session format, the API, dependencies, storage keys or configuration. No historical session is modified.
