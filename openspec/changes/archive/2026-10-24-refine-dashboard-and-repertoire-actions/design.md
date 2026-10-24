# Design

## Context

See `proposal.md` — Why. `DashboardView` renders `PracticeTimeChart` ("Ritmo de práctica") beside `PracticeSchedule` ("Cuándo practicas"). The chart already builds its buckets with `getPracticeTimeBuckets` and shows one total for the selected period; the schedule card consumes `getPracticeSchedule`, a full-history weekday and time-band distribution with its own labels and tests. The repertoire header links to `/practice`, and a full-width block below the rankings repeats the add-item link with a description.

## Goals / Non-Goals

**Goals:**

- Leave a single time card that answers volume, consistency and trend for the selected period.
- Remove the schedule card and every piece of code and copy that only it used.
- Make the repertoire header carry the add-item action without a duplicate block.

**Non-Goals:**

- Redesigning the other dashboard cards or the skill/guitar pairing.
- Changing the chart's bucket scales, labels or bar heights.
- Adding a per-skill or per-guitar breakdown inside the rhythm card.
- Changing the new-item page or its description copy, which stays in use there.

## Decisions

**One full-width rhythm card, no replacement pairing.** With the schedule gone, the chart keeps its own row instead of sharing a row with another card. Week buckets already need room and month/year can reach 30 or 12 columns; pairing it with the skill or guitar card would shrink both. Alternative considered: a two-column grid with a single card, rejected because it wastes half the row and contradicts the point of removing the card.

**A single summary helper in `practice-analytics`.** `getPracticeTimeSummary(history, period, today)` returns the period total, session count, average per session, best bucket, previous-period total and a nullable change ratio. It reuses the same private bucket builders as `getPracticeTimeBuckets`, so the card's chart and summary cannot disagree about the period boundaries. Alternative considered: deriving the figures inside the component, rejected because date math would be duplicated and untested.

**The previous period is the previous calendar period.** Week compares with the previous Monday–Sunday, month with the previous calendar month and year with the previous calendar year. The ratio is `null` when the previous period has no practice, which the card renders as an explicit "no previous data" state instead of a misleading +100 %. The current month and year are partial by nature; the label says "previous period" rather than claiming a like-for-like comparison.

**Average per session, not per practised unit.** For week the buckets are days, but for month and year they are weeks and months, so "average per practised day" would be wrong for two of the three periods. The average divides the total by the session count and reads the same in all three. The best unit keeps a period-specific label: best day, best week or best month.

**Summary as a definition list under the total.** The existing large total stays; below it a `dl` with four entries (sessions, average per session, best unit and comparison) lays out in two columns on narrow screens and four on wide ones. Empty periods keep the structure with zero and an em dash, and the existing empty-chart message remains. Screen readers get term/definition pairs rather than unlabelled numbers.

**Delete the schedule instead of hiding it.** The component, `getPracticeSchedule`, the weekday/time-band types and labels, their i18n keys and their tests are removed. Leaving them behind would keep dead analytics and copy that later changes would have to maintain.

**Repertoire header reuses the existing route and copy.** The header link points to `/repertoire/new` with `newItem` and the plus icon, replacing the `prepare` link. `newItemDescription` is removed from the repertoire view but kept in the dictionary because `/repertoire/new` still shows it. The whole add-item block is deleted, not relocated.

## Risks / Trade-offs

- **Partial-period comparison can look negative** (for example, a month in progress against a full previous month) → the copy says "previous period", not "same period", and the empty-previous state avoids fake percentages.
- **Removing requirements that only exist in pending changes** → this change must be archived after `improve-practice-dashboard`, `refine-practice-dashboard` and `refine-practice-plans-and-insights`, as noted in the proposal.
- **Four figures may crowd the card header on small screens** → the summary sits below the header and the total, in a two-column grid, so it never competes with the period selector.
- **Retired i18n keys can drift between languages** → remove each key from the dictionary type, Spanish and English in the same task, and keep the parity test green.
