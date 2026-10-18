# Design

## Context

See `proposal.md` for motivation and `specs/repertoire-library/spec.md` for the required behavior.

Current state that shapes the approach:

- `RepertoireItem` (`src/types/practice.ts`) is `{ id, kind, title, artist?, parts, guitarPro?, resources?, updatedAt, tuning?, capo?, guitarType?, youtubeUrl?, spotifyUrl?, isFutureLearn?, chordChart?, tab? }`. Every field added so far is optional, so items saved earlier keep loading.
- The repertoire lives only in the browser: `usePracticeStore` persists `repertoireItems` to `localStorage` through `src/stores/practiceStorage.ts`. There is no repertoire table in Supabase.
- `getFilteredRepertoireItems` (`src/lib/repertoire-filtering.ts`) takes `{ query, kind, progress, sort, guitarType, futureLearn }` and a practice map, and `RepertoireView` renders one `SelectField` per filter plus the search box.
- `RepertoireItemCard` shows a type label built from `text.songs` ("Canciones") / `text.licks`, always.
- `getRepertoirePracticeStats` (`src/lib/repertoire-analytics.ts`) returns `Map<itemId, Map<partId, { practiceSeconds, sessionCount }>>` and **skips any phase that has no `repertoirePartId`**. The quick practice built in `PracticeWorkspace` creates its phase from the item with neither `repertoireItemId` nor `repertoirePartId`, so its time can never be attributed and every item shows 0 min.
- `artist` is free text on the item, edited and shown on the item itself. There is no artist entity and this change does not add one.

## Goals / Non-Goals

**Goals:**

- Every item says how hard it is, and the difficulty is chosen where the item is written.
- The practice time an item shows is the time actually practiced on it.
- The type label reads correctly and stops being noise when the list is already filtered by type.

**Non-Goals:**

- Any artist browsing: no artist pages, no artist filters, and no artist images. The artist stays the free-text field the item already had.
- Any change to the tab or chord chart editors.
- Server-side storage of the repertoire: items stay in the browser.

## Decisions

### 1. Difficulty is an optional field with three values

`RepertoireItem` gains `difficulty?: "beginner" | "intermediate" | "advanced"`, validated when the store is normalized (an unknown value is dropped, the item is kept). The create form and the item's extra configuration offer the three values plus "none". Being optional means no migration and no item becomes invalid.

Alternatives considered:

- A 1–5 or 1–10 scale: rejected. Three named levels are easier to assign by ear and to read at a glance.
- A required field with a default: rejected because every existing item would need a value it never chose.
- Filtering by difficulty: rejected after trying it. It added a control to a toolbar the user already liked, and the value is meant to describe an item, not to slice the list.

### 2. Item-level practice time is a new measure beside the per-part one

`getRepertoirePracticeStats` keeps its shape and meaning (per part) because the part editor shows each part's time. A new `getRepertoireItemPracticeStats(history)` returns `Map<itemId, { practiceSeconds, sessionCount }>` and counts **any** completed phase that names the item, with or without a part. The card, the library total, and the "most practiced" ordering use the item-level map; the part rows keep using the per-part map.

Separating them, rather than widening the existing map, keeps the change small and leaves the per-part behavior the part editor depends on untouched.

Alongside it, the quick practice in `PracticeWorkspace` sets `repertoireItemId: item.id` (and leaves the part unnamed, because the user did not choose one), which is what makes time start counting for practices started from an item.

Alternatives considered:

- Widening `getRepertoirePracticeStats` to return item and part time together: rejected because it changes a shape three call sites depend on for a result a second function states directly.
- Counting only phases that name a part and forcing the user to pick one: rejected. Starting practice from an item is a first-class flow and should not silently stop counting.

### 3. The type label is singular, and the view decides whether it shows

`RepertoireItemCard` gains `showKind?: boolean` (default `true`) and builds its label from new singular strings (`song`, `lick`). `RepertoireView` passes `showKind={filter === "all"}`, so the label disappears exactly when the list is already narrowed to one type.

Alternatives considered:

- Hiding the label inside the card by passing the whole filter: rejected, the card only needs to know whether to show it.
- Keeping the plural and living with it: rejected, a single item labelled "Canciones" reads wrong.

## Risks / Trade-offs

- [A changed difficulty of a stored item can be lost when the item also carries other values] → The extra configuration now saves the value it was given instead of reading it back from state, so a single change is not dropped (a pre-existing bug found while wiring this).
- [Item-level time and part-level time can now disagree in total] → Expected and documented: the item total includes phases that named no part, so it can be larger than the sum of its parts; the item figure is the one the user reads.

## Migration Plan

No data migration. `difficulty` is optional and unknown values are dropped when the store loads, so items saved before this change keep loading unchanged. Rollback is reverting the commit; items keep their optional field, which older code ignores.
