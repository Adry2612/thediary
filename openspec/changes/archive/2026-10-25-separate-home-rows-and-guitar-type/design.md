# Design

## Context

The working tree already has the home repertoire cards from `refine-calendar-and-home-cards`: `HomeView` places `SavedRoutines` and `RecentRepertoire` in one `xl` two-column grid, and `RecentRepertoire` uses a 2/4/2 column grid for that shared row. The quick repertoire launch goes through `createQuickRepertoirePlan`, which does not carry the item's `guitarType`; `PracticeSession` then seeds the session from `lastGuitarType`, and `practice-session-record` stores it. `getGuitarBalance` already reads `session.guitarType`, so the chart is reporting the saved value correctly.

The pending archive chain is `refine-practice-banner-and-calendar` → `refine-home-calendar-and-next-blocks` → `refine-calendar-and-home-cards`. This change builds on the home cards from the last one, so it joins the end of that chain.

## Goals / Non-Goals

**Goals:**
- Put the quick-start routines and the recent repertoire in two stacked, full-width home rows.
- Make a quick practice from a song start and save with the song's declared guitar type.
- Keep the guitar balance and every other dashboard calculation untouched.

**Non-Goals:**
- Adding a guitar-type prompt or control to the running practice.
- Rewriting already saved sessions or adding a migration.
- Changing the quick practice for licks, templates, repeated sessions or manual entries.
- Changing the chart's unclassified handling or the last-used-type preference.

## Decisions

### Stack the two home sections instead of sharing a grid

`HomeView` replaces the `xl:grid-cols-[...]` wrapper with two sibling blocks, each with the existing `mt-5` spacing. The order stays routines and then repertoire. The sections keep their own `enter`, header and link.

Because the repertoire row is now always full width, `RecentRepertoire` changes its grid to `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`; `SavedRoutines` changes its grid to `sm:grid-cols-2 lg:grid-cols-3` so its cards do not become two oversized tiles on a tablet. No new wrapper component or copy is needed.

Alternatives: keep the two-column grid on wide screens (rejected by the user); add a `home-overview` layout component (unnecessary for two siblings).

### Copy the song's guitar type into the quick-practice plan

`createQuickRepertoirePlan` adds `guitarType` only when `item.guitarType` is set, using the same conditional-spread pattern as `createTemplatePlan`. `PracticeSession`'s seeding effect already skips a session that has a type, so the plan's value wins and `createPracticeSessionRecord` stores it. The header shows the type read-only through `activePlan.guitarType`.

The chart needs no change: once the session is saved as acoustic, `getGuitarBalance` counts it as acoustic. The bug was the source of the saved value, not the aggregation.

Alternatives: leave the quick practice unclassified (rejected by the user); ask before starting (rejected as extra friction); change the analytics to infer from the song (would make the chart disagree with the stored session and would break the unclassified contract).

### Do not update the last-used preference from the song's type

The preference is updated when the user chooses a type in the plan builder, manual entry or session editor. A type copied from the song is context for that session, not a new user preference. Keeping the preference untouched also avoids a quick acoustic practice silently changing the default of the next free practice.

### Do not migrate saved history

The already saved electric session stays as it is; the session editor already lets the user change its type, and the dashboard recalculates from the stored value. A migration would have to guess whether an electric quick practice of an acoustic song was deliberate, so the change does not touch history.

## Risks / Trade-offs

- **A song's declared type may describe the song, not the guitar the user wants that day** → The type is shown in the session header before and during practice, and the saved session can be corrected afterwards. The user explicitly asked for this default.
- **A song without a declared type still inherits the last used type** → That is the existing fallback the user chose to keep; if it is wrong, the session can be edited.
- **The full-width repertoire row can produce oversized covers** → The responsive 2/3/4 column grid bounds the cover size; the four most recent songs fill one row on wide screens.
- **Archive order** → This change follows the three pending archives; the home cards it modifies come from `refine-calendar-and-home-cards`.

## Migration Plan

Code only. No store, session or API changes. Deploying the change affects new quick practices only. Rolling back restores the shared home row and the previous quick-practice default; saved sessions are unaffected either way.

## Open Questions

None.
