# Proposal

## Why

Four small frictions remain in the practice and evolution experience:

- When a block continues past zero, the floating practice bar still shows the
  white `0:00` next to the overtime, so the added time looks like a second
  number instead of the block's current state.
- The start screen repeats reminders as a row even though the user only wanted
  system notifications. This row was added by the still-open
  `add-practice-reminders` change and is being dropped from that scope.
- The seven day cards of "Rutina por día" do not share one size, so the weekly
  planner looks ragged.
- The evolution charts appear statically; a short entrance adds legibility
  without turning the dashboard into an animation showcase.

## What Changes

- **Floating practice bar**: while a block runs overtime, the bar shows only the
  overtime as a green `+mm:ss` value. The white `0:00` is no longer printed next
  to it. At zero without overtime the bar still shows `0:00`.
- **Home reminders**: remove the in-app reminder row from the start screen and
  its supporting state. Reminders are delivered only as system notifications.
  The in-progress `add-practice-reminders` change is trimmed so its pending
  spec delta and tasks no longer promise the removed row.
- **Routine by day**: give the seven weekday cards the same height, padding and
  select width at every breakpoint, including days without an assigned routine.
- **Evolution charts**: add short, CSS-only entrance and update motion to the
  practice rhythm bars, the skill-balance bars, the monthly heatmap and the
  annual calendar. The motion uses only `transform` and `opacity`, is capped in
  duration and stagger, never animates on hover, causes no layout shift, and
  disappears entirely with `prefers-reduced-motion`.

## Capabilities

### New Capabilities

<!-- none -->

### Modified Capabilities

- `practice-session-management`: the floating bar's overtime display changes.
- `home-overview`: the start screen no longer carries reminder banners, and the
  weekly routine planner gives every day the same size.
- `practice-dashboard`: the evolution charts gain a bounded entrance and update
  animation with the same reduced-motion and performance constraints as the
  rest of the app.

## Impact

- `src/components/practice/PracticeSession.tsx`: floating bar overtime display.
- `src/components/home/HomeView.tsx` and removal of
  `src/components/home/ReminderRow.tsx` and `src/hooks/useInAppReminder.ts`.
- `src/components/dashboard/WeeklyRoutinePlanner.tsx`: equal day cards.
- `src/components/dashboard/PracticeTimeChart.tsx`, `SkillBalance.tsx`,
  `PracticeHeatmap.tsx`, `YearPracticeCalendar.tsx`: chart motion.
- `src/app/globals.css`: keyframes plus the reduced-motion opt-out.
- `openspec/changes/add-practice-reminders/`: drop the home-overview delta and
  the in-app row tasks so both changes stay consistent.
- Tests and `docs/practice.md`, `docs/reminders.md`, `docs/dashboard.md`.
