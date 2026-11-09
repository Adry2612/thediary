# Tasks

## 1. Rolling window core

- [x] 1.1 Rewrite `getComparisonSpans` so week is the seven days ending today and year is the twelve calendar months ending with the current month, keeping month at thirty days; verify `tests/period-comparison.test.mjs` covers mid-week, mid-year, the first day of a month and 29 February.
- [x] 1.2 Derive `getPracticeChartRanges` week ranges (seven days ending today) and year ranges (twelve clipped calendar months) from the same current span; verify `tests/practice-analytics.test.mjs` asserts a mid-week start and a year window that crosses a year boundary.
- [x] 1.3 Make `getPracticeTimeBuckets` and `getPracticeTimeSummary` use the new ranges and the preceding equal window; verify a practice dated after today is absent from the totals, the chart and the comparison.
- [x] 1.4 Confirm the top weekly summary still uses `getSessionsForWeek` / `getPracticeWeekDays` and is unaffected; verify `tests/practice-calendar.test.mjs` keeps its Monday-to-Sunday expectations.

## 2. Period-less cards follow the rhythm period

- [x] 2.1 Lift the rhythm period into `DashboardView`, pass it to `PracticeTimeChart`, and remove the chart's local period state; verify the chart still switches and keeps its default week.
- [x] 2.2 Add an optional date range to `getPracticeStatistics` and `getPracticeContentRankings` and compute the metric cards (time, sessions, average BPM, hours, most-practised area) and the rankings from the rhythm window; verify ties, empty periods and sessions outside the window with unit tests.
- [x] 2.3 Keep the current and longest streak cards outside the window and confirm period changes do not alter them; verify with a history whose record is older than the selected window.
- [x] 2.4 Replace the fixed-window labels in `src/i18n/es.ts` and `src/i18n/en.ts` ("Tiempo en 30 días", "tiempo total del historial", "prácticas completadas", "sin BPM registrado en 30 días") with period-neutral strings; verify no dashboard component references a fixed 30-day or full-history label and the calendar keeps its natural-year wording.

## 3. Longest streak

- [x] 3.1 Implement `getLongestStreak(history)` beside `getStreakCount`, returning the best consecutive-day run over the full history and 0 for an empty history; verify unit tests for a record older than the current streak, a tie, a single day and an empty history.
- [x] 3.2 Add a "Racha más larga" metric card after the current streak with its description, icon/indicator and accessible label in both languages; verify the metric grid wraps correctly at 390, 768 and 1280 px with seven cards.

## 4. Annual calendar stays as before

- [x] 4.1 Keep `getYearlyHeatmapData`, `createCalendarCells`, `getMonthMarkers`, `YearPracticeCalendar` and `tests/practice-calendar.test.mjs` on the natural calendar year, with their existing hover, focus, touch, preview and navigation behaviour; verify the calendar still covers 1 January to 31 December of the current year and its note names that year.

## 5. Balances, wellbeing and tempo alignment

- [x] 5.1 Make the skill balance and guitar balance read the same rolling windows as their selectors while keeping their shared period; verify week, month and year totals with sessions just inside and just outside each boundary.
- [x] 5.2 Make the wellbeing series and summary use the new week, month and year ranges and the preceding equal window; verify the week plots seven days ending today and the year plots twelve months ending with the current month.
- [x] 5.3 Confirm tempo keeps its week/month selector on consecutive rolling windows and its labels still name the compared span; verify no tempo expectation changes unless a test assumed calendar-aligned weeks.
- [x] 5.4 Show the wellbeing card only when mood or focus is enabled in Settings and the enabled metric has recorded data, and chart and summarize only the enabled metrics; verify the card is absent with both switches off, absent with no data for the enabled metric, and shows only the enabled series when the other is off.

## 6. Documentation and integration

- [x] 6.1 Update `docs/dashboard.md` with the rolling windows, the cards that follow the rhythm period, the longest streak, the natural-year calendar and the wellbeing visibility rule; verify every statement matches the built screen.
- [x] 6.2 Run `npm test`, `npm run typecheck` and `npm run build`; verify all three finish green.
- [x] 6.3 Review the dashboard at 390, 768 and 1280 px with an empty history, a single day, a mid-week day and a year window crossing a year boundary; verify no card or calendar overflows, every period selector keeps its default and the wellbeing card obeys its switches.

## Workflow follow-up

- Archive the change after the project's review requirements are satisfied.
- Verify the archived spec no longer contains the old calendar-aligned wording.
