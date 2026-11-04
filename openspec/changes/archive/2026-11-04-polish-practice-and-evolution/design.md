# Design

## Context

- The floating practice bar already derives `barOvertimeSeconds` from the timer
  snapshot and prints `remaining` plus `+overtime` side by side in
  `PracticeSession.tsx`.
- The start screen renders `ReminderRow`, backed by `useInAppReminder`, which
  was added by the still-open `add-practice-reminders` change. Push delivery
  lives in independent services and the service worker.
- `WeeklyRoutinePlanner` lays the seven days in a responsive grid of plain
  `div`s whose height depends on their content.
- The evolution charts are plain DOM: rhythm bars use `scaleY`, skill bars use
  percentage `width`, and the heatmap and annual calendar are CSS grids of
  cells. The app already centralises reduced-motion opt-outs in
  `src/app/globals.css`.

See `proposal.md` for motivation.

## Goals / Non-Goals

**Goals:**

- One unambiguous overtime value in the floating bar.
- Remove the in-app reminder row without touching notification delivery.
- Make the seven weekday cards visually identical in size.
- Add cheap chart motion that never shifts layout and never replays on
  unrelated renders.

**Non-Goals:**

- Redesigning the dashboard or changing chart data, colours or tooltips.
- Introducing an animation library or a JS animation loop.
- Changing when, how or which notifications are delivered.
- Animating on hover, focus or scroll.

## Decisions

### Floating bar: choose one value, not two

`PracticeSession` already computes overtime from the timer snapshot. Render a
single time span: if `barOvertimeSeconds > 0`, print `+mm:ss` with the green
accent class and no countdown; otherwise print the countdown as today. This
keeps the change presentational, adds no state and works with the existing
`useAnimatedPresence` visibility logic.

Alternative considered: keep `0:00` and colour both values. Rejected — the
white zero is exactly the noise the user reported.

### Reminder row: remove the feature and trim the owning change

Delete `ReminderRow` from `HomeView` together with
`src/components/home/ReminderRow.tsx`, `src/hooks/useInAppReminder.ts`, its
strings and its tests. Push delivery, preferences, the service worker and the
Edge Function stay untouched.

The removed row is currently promised only by the pending
`add-practice-reminders` change, not by the main `home-overview` spec. Adding a
`REMOVED` delta here would depend on that change being archived first, which is
blocked. Instead the apply step trims the `home-overview` delta, the design
notes and the in-app tasks from `add-practice-reminders` in the same pass, and
this change records the durable behaviour in `home-overview`.

Alternative considered: keep the hook dormant behind a flag. Rejected — dead
code and a second source of truth for a decision the user already made.

### Weekday cards: one grid track size

Use `grid auto-rows-fr` for the seven cards, make each card a full-height flex
column, give the weekday label a fixed line box and make the select fill the
card width. This equalises rows at every breakpoint (2, 4 and 1 column) without
hardcoding heights or measuring content. Long routine names keep truncating
inside the select.

Alternative considered: fixed pixel height. Rejected — breaks with larger text
sizes and translated labels.

### Chart motion: CSS keyframes keyed by the data window

- Rhythm bars: keep `transform: scaleY()` and add an entrance keyframe from
  `scaleY(0)` to the inline `--bar-scale`, with `transform-origin: bottom`.
- Skill bars: keep the percentage width for layout and add an entrance
  `scaleX` from 0 with `transform-origin: left` so the animation never touches
  layout.
- Heatmap: entrance `opacity` plus a small `scale` on each cell.
- Annual calendar: one `opacity` and small lift for the whole grid, not one
  animation per cell. The year grid holds more than 300 buttons, so animating
  each of them would add compositing work for no visible gain.
- Stagger: `animation-delay: min(index, cap) * step`, capped at 200 ms so the
  whole chart settles under 500 ms.
- Replay only when the data window changes: key the animated list on the
  period (rhythm) or the visible month/year (heatmap and calendar), so an
  unrelated re-render keeps the same keys and does not restart CSS animations.
- Empty charts and reduced-motion users get the final state with no animation.

All motion is compositor-friendly (`opacity`/`transform`) and bounded to about
40 heatmap cells, 12–30 bars and one calendar grid, so no virtualisation,
observer or animation loop is needed. The existing
`@media (prefers-reduced-motion: reduce)` block gains the new classes.

Measured budget: rhythm and skill bars run for 360 ms plus at most 140 ms of
stagger (500 ms total); heatmap cells run for 260 ms plus at most 120 ms (380
ms); the annual calendar runs as one 300 ms fade. No chart reads layout during
the animation because only `opacity` and `transform` change.

Alternative considered: Framer Motion. Rejected — a large dependency for a few
entrance animations the browser can already composite.

Alternative considered: `transition` on data changes only. Rejected — the first
render still pops and the user asked for an entrance animation.

## Risks / Trade-offs

- **Two changes touching reminders** → Trim `add-practice-reminders` in the same
  apply pass and never archive it with the row still promised.
- **CSS animation replaying on every render** → Stable `key` values and
  animation declared only on the animated element, never toggled by state.
- **Equal cards making long selects cramped** → Keep the select full width and
  truncate its label; do not shrink the hit area.
- **Bars with `scaleX` look blurry if they contain text** → Only empty bars are
  transformed; labels stay outside.
- **Motion perceived as slow** → Duration ≤ 500 ms and stagger capped at 200 ms;
  reduced-motion removes it entirely.
