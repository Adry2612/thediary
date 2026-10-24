# Design

## Context

See `proposal.md` — Why. The previous change left `PracticeTimeChart` alone in its row, with a four-column summary under the total, and a hover card that only renders the bucket label and duration. Buckets (`PracticeTimeBucket`) carry label, date range and total seconds but no session count. The skill, guitar and tempo cards already use `h-full`, so they can stretch to match a sibling. All three rows currently use the dashboard's `items-stretch` grid.

## Goals / Non-Goals

**Goals:**

- Two balanced rows of two cards, each pair equal in width and height.
- Summary figures legible inside a half-width card.
- A tooltip that explains one bar with sessions, average and share of the period's best.
- One definition of a bucket's sessions shared by chart and summary.

**Non-Goals:**

- Changing the chart scales, bar heights, period selector or empty state.
- Changing the skill, guitar or tempo cards beyond their position.
- Adding storage, new analytics screens or a skill breakdown inside the tooltip.
- Changing the summary figures already approved in the previous change.

## Decisions

**Equal pairs instead of restoring the old 1/3–2/3 row.** Rhythm and skill both benefit from roughly equal width, and guitar balance plus tempo progress read as peers. Using two `lg:grid-cols-2` rows with `items-stretch` keeps the pairs aligned without new container components. Alternative considered: the previous guitar 1/3 + tempo 2/3 arrangement, rejected because the request is to share the space and equal cards look intentional.

**Session counts on the bucket, not in the component.** `PracticeTimeBucket` gains `sessionCount`, filled when the bucket is built by counting sessions whose start date falls inside its range. `getPracticeTimeSummary` then sums the bucket counts instead of filtering the history again, so the tooltip, the bars and the summary cannot disagree about which sessions belong to a bucket.

**Share of the best bucket reuses the chart maximum.** The tooltip's percentage is `bucket.totalSeconds / maximumSeconds`, the same maximum that scales the bars, rounded for display. The best bucket therefore reads 100 % and the comparison needs no extra analytics. The best-unit wording changes with the period (day, week, month), matching what the chart already calls a bucket.

**The summary grid drops to two columns.** Inside a half-width card the four figures are laid out two-by-two at every breakpoint. This keeps the labels readable without abbreviating them and leaves room for the chart below.

**One larger tooltip size.** The detailed card has five short lines, so the tooltip grows to 208 × 112 px. The containment helper keeps its single size pair, updated and covered by its test; zero-practice buckets still render no card, and keyboard focus keeps showing the same card as hover.

**Copy stays period-aware and plural-aware.** The session line uses singular or plural, the average line appends "de media", and the comparison ends in "del mejor día", "de la mejor semana" or "del mejor mes" according to the selected period.

## Risks / Trade-offs

- **Uneven natural card heights** (the skill balance is often taller than the chart) → both cards already have `h-full` and a minimum height, so the row stretches the shorter one.
- **Tooltip clipped at the card edges** → the containment helper now accounts for the larger card, and the chart keeps its existing edge tests.
- **Half-width summary wrapping at 320 px** → a fixed two-column grid with short labels, verified at all three breakpoints.
- **Buckets that overlap month boundaries** → session counts use the same inclusive date range as the seconds already summed, so the two numbers stay consistent.
