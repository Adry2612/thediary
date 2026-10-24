# Proposal

## Why

The practice dashboard is close, but five rough edges remain. In the annual calendar the hover card overlaps a 20 px grid, so moving the pointer from a day onto the card crosses other cells and the summary jumps to another day or closes. The skill balance changes its centre content on hover, which is less explicit than the dashboard's other hover summaries. The time-band labels overlap their bars in the schedule card, the quick-access card asks a question the dashboard does not need to ask, and a long streak gets no recognition beyond its number.

## What Changes

- Make the annual calendar's day summary stable: while a summary is already open, a new day is committed only after a short hover intent, and entering the card cancels a pending day switch. The card stays interactive, as in the weekly summary, and closes on leave, page scroll, resize and Escape.
- Replace the skill balance's centre swap with a floating summary card next to the hovered donut arc or legend row. The centre keeps showing the month total. The card shows minutes, percentage and session count, follows keyboard focus, and stays inside the viewport.
- Give the schedule card a label column wide enough for every time band so the label never overlaps its bar or value, at 320 px and above.
- Remove the dashboard's quick-access card («¿Cuánto tiempo tienes hoy?»), its i18n keys, the `SUGGESTED_DURATIONS`/`createSuggestedPhases` generator and the `minutes` search parameter in `/practice`. The regular practice screen keeps its default plan.
- When the current streak reaches 7 consecutive days, show a small animated flame next to the streak value and a short, serious message. The flame is decorative for assistive technology, the message is visible text, and the animation respects `prefers-reduced-motion`.

**BREAKING**: `/practice?minutes=30` no longer builds a suggested plan; the parameter is ignored.

## Capabilities

### New Capabilities

- `practice-dashboard`: refines the dashboard behavior planned in the pending `improve-practice-dashboard` change. This delta adds the annual-calendar hover stability, the floating skill summary, the schedule label layout, the streak flame and the removal of the quick-access planner, and removes the obsolete "hover changes the chart centre" requirement.

### Modified Capabilities

<!-- None: openspec/specs has no practice-dashboard capability yet; it is introduced by the pending change named above. -->

## Impact

- `src/components/dashboard/YearPracticeCalendar.tsx` and the shared day-tooltip hook.
- `src/components/dashboard/SkillBalance.tsx` plus a small tooltip-positioning utility.
- `src/components/dashboard/PracticeSchedule.tsx`.
- `src/components/dashboard/MetricCard.tsx`, `DashboardView.tsx`, `globals.css` and a streak helper.
- `src/components/dashboard/SuggestedPractice.tsx` (deleted), `src/app/(workspace)/practice/page.tsx`, `src/i18n/*`.
- Tests for the tooltip positioning, the streak threshold and the i18n parity.
- No dependencies, no database migration, no persistence change.
- Archive note: apply and archive this change **after** `improve-practice-dashboard`, because this delta removes one of that change's requirements.
