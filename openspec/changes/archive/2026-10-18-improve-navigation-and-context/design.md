# Design

## Context

See `proposal.md` for motivation and the spec deltas for the required behavior.

Current state that shapes the approach:

- `SiteNavigation` (`src/components/layout/SiteNavigation.tsx`) renders the app name as a `div` carrying `data-tour-target='brand'`, the element the guided tour points at on its first step (`src/lib/tutorial-steps.ts`).
- The ways back are hand-written in each view: a `Link` with `text-sm text-muted underline underline-offset-4` in the new repertoire item and in the practiced day, the same `Link` in the repertoire file only when the item is not found, and a `button` (a state change, not a navigation) in the routine designer.
- A `PracticePhase` may carry `repertoireItemId` (`src/types/practice.ts`). The repertoire item holds the artist as free text, and it is the item —not the phase— that owns it.
- `TimerCard` prints the name of the block being practiced in its `h2`, and `PracticeSession` is the component that knows both the phases and the repertoire.
- `src/components/ui/icons.tsx` groups the shared icons behind a `StrokeIcon` helper.

## Goals / Non-Goals

**Goals:**

- One gesture home, and one gesture back in every nested view.
- The same arrow and the same look everywhere, instead of four hand-written copies.
- While practicing a repertoire item, the artist is visible under the song's name.

**Non-Goals:**

- A browser-history back button, breadcrumbs, or a "back" on views that are top level in the navigation (dashboard, metronome, recordings, repertoire, settings).
- Any artist entity, artist page or artist link: the artist stays the free-text field of the item.
- Showing the artist anywhere else while practicing (the plan table, the session history).

## Decisions

### 1. One shared `BackLink` and one arrow icon

`src/components/ui/BackLink.tsx` renders the arrow and the label in a single component, and `ArrowLeftIcon` joins the shared icons. The three views that navigate use it; the routine designer keeps a `button`, because it does not navigate but returns to the routines on the same screen, and reuses the same arrow.

Alternatives considered:

- Decorating each `Link` with the arrow by hand: rejected, it is exactly how the four copies drifted apart in the first place.
- An icon-only arrow: rejected. The label ("Volver al repertorio") says where it goes; the arrow says that it goes back. Both are worth their space.

### 2. The app name becomes a link, keeping the tour target

The `div` becomes a `Link` to `/` and keeps `data-tour-target='brand'`, so the guided tour still finds it (it positions its popover against that element). Its accessible name is the app name itself, which is what the link says.

### 3. The artist is looked up from the block's item, not copied into the phase

`PracticeSession` finds the item named by the current phase's `repertoireItemId` in the repertoire and passes its artist to `TimerCard`, which prints it under the song's name only when it is there.

Alternatives considered:

- Storing the artist on the phase: rejected. The item is the single source of truth —correcting the artist of an item corrects it in the practice too— and no stored session needs migrating.
- Resolving the repertoire inside `TimerCard`: rejected. The card only draws what it is given; the lookup belongs where the repertoire is already at hand.

### 4. The artist shows in the timer card, not in the heading above it

While a practice runs, the practice screen already prints the song's name twice: in the heading of the workspace and, big, in the timer card. The card is what the user watches while practicing, so the artist goes there. Printing it in both places would put two identical lines on the same screen.

Alternatives considered:

- Also under the heading of the workspace: rejected for the duplication above. If the heading is preferred in the future, the same artist can be moved there without touching the data.

## Risks / Trade-offs

- [The artist of the block is resolved on every render of the practice] → A single lookup by id over the repertoire of the user; the same order of work the plan table already does per phase.
- [A repertoire item whose artist changes shows the new artist in a practice that was started earlier] → Expected and desired: the item is the source of truth, and the practice record keeps its own copy of the title.

## Migration Plan

No data migration: nothing is added to the stored items, phases or sessions. Rollback is reverting the commit.
