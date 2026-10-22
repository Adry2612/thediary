# Proposal

## Why

The repertoire has become the place where the user keeps what they study, but the library around it is still thin in two ways that matter every day. Every item looks the same: nothing says how hard a song is, and the type label reads "Canciones" even on a single song and repeats itself while the list is already filtered by type. And the practice time per item is always 0 min, because the practice that reaches it is never linked back.

The library therefore cannot answer the question the user actually has: how much have I really worked on this song.

## What Changes

- Add a **difficulty** to each item (beginner, intermediate, advanced), chosen when creating or editing it and shown with the item.
- Fix the **practice time of an item**: count the time of every completed practice phase linked to the item, with or without a part, link the item when a practice is started from it, and show the result on the item and in the library total.
- Label each item's type in the **singular** ("Canción", "Lick") and **hide that label while the list is filtered by type**, where it adds nothing.

## Capabilities

### New Capabilities

- `repertoire-library`: the library of saved items as the user sees it — how each item is described (its difficulty and its type label) and the practice time each item really has.

### Modified Capabilities

None.

## Impact

- `src/types/practice.ts` (`RepertoireItem` gains `difficulty`; new `RepertoireDifficulty` type).
- `src/lib/repertoire-filtering.ts` (practice ordering from item-level time) with tests in `tests/repertoire-filtering.test.mjs`.
- `src/lib/repertoire-analytics.ts` (item-level practice stats next to the existing per-part ones) with tests in `tests/repertoire-analytics.test.mjs`.
- `src/components/repertoire/RepertoireView.tsx` (item-level time, and the type label's visibility).
- `src/components/repertoire/RepertoireItemCard.tsx` (difficulty, singular type label, hiding the label, item-level time, and a save that no longer drops a single change).
- `src/components/repertoire/difficulty-labels.ts` (new: the name of each difficulty in the active language).
- `src/components/repertoire/RepertoireSongForm.tsx` (difficulty when creating).
- `src/components/practice/PracticeWorkspace.tsx` (a practice started from an item links that item).
- `src/stores/normalizePracticeStorageState.ts` (drop an unknown difficulty while keeping the item).
- `src/i18n/es.ts` and `src/i18n/en.ts` (difficulties and the singular labels).
- No data migration: `difficulty` is optional and items saved before it simply have none.

Out of scope: any artist browsing (pages, filters, or images — the artist stays the free-text field the item already has), and any change to how the tab or the chord chart are edited.
