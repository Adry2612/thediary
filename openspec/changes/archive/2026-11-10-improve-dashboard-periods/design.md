# Design

## Context

See `proposal.md` - Why. The dashboard currently mixes three anchoring rules:

- `getComparisonSpans` treats the week as Monday-to-today and the year as 1 January-to-today.
- `getPracticeChartRanges` draws seven Monday-to-Sunday days and twelve calendar months of the current year, including future intervals.
- `getYearlyHeatmapData` and `createCalendarCells` are hard-wired to a natural calendar year; the annual calendar keeps that behaviour.
- `PracticeTimeChart`, `TempoProgress`, `PracticeWellbeing` and the balance cards each own a period selector; `DashboardView` owns a separate balance period.
- The metric cards and `getPracticeContentRankings` still read the full history.

The top weekly summary uses `getSessionsForWeek` / `getPracticeWeekDays` and must keep the calendar week.

## Goals / Non-Goals

**Goals:**

- One date-window source of truth for every period, so charts, summaries and comparisons cannot disagree.
- Keep each card's existing period selector and default.
- Keep the top weekly summary, the annual calendar and all stored data untouched.

**Non-Goals:**

- Unifying the selectors into one global control.
- Changing the dashboard layout beyond the extra streak card.
- Changing tempo's existing week/month selector to a year option.
- Changing the annual calendar's natural-year range or labels.
- Changing session storage, Supabase or the iOS app.

## Decisions

### D1 - `getComparisonSpans` defines every rolling window

Extend `getComparisonSpans(period, today)` to return the current and previous windows for all three periods:

- **Week**: current `[today - 6, today]`, previous `[today - 13, today - 7]`.
- **Month**: current `[today - 29, today]`, previous `[today - 59, today - 30]` (unchanged).
- **Year**: current starts on the first day of the month eleven months before today's month and ends today; previous starts on the same calendar date one year earlier and ends on the same calendar date one year earlier as today, clamped to the last valid day (29 February → 28 February).

`getPracticeChartRanges` derives its ranges from `current`, so the chart and its comparison always share the same window. Alternative considered: compute each caller's range independently; rejected because the current code already drifted between chart ranges and comparison spans.

### D2 - Year buckets are twelve clipped calendar months

The year chart and wellbeing series split the year span into calendar-month buckets, first and last clipped to the window. Labels stay short month names. Alternative considered: twelve fixed 30-day buckets; rejected because the card is labelled by month and users reason in calendar months.

### D3 - One rhythm period drives the period-less cards

`DashboardView` owns `rhythmPeriod` (default `week`) and passes it to `PracticeTimeChart`. The metric cards and `TopPracticeContent` use the same `getComparisonSpans(rhythmPeriod, today).current` window. `PracticeTimeChart` stops owning its period state.

- `getPracticeStatistics` gains an optional range and computes sessions, total seconds and most-practised skill inside it.
- `getPracticeContentRankings` gains a range and only iterates phases inside it.
- Average BPM filters the window's sessions with `averageBpm > 0`.
- The streak values are computed once from the full history and never filtered by the window.

Alternative considered: give the metric cards their own selector; rejected because the user asked for "all fields" to share a reference period, and the rhythm card is the first selector on the page.

### D4 - Longest streak is a pure history function

Add `getLongestStreak(history)` next to `getStreakCount`: build the sorted set of practice date keys and walk it once, keeping the best run. Empty history returns 0. Add a `longestStreak` metric card after the current streak; the metric grid moves to four columns on wide viewports so seven cards wrap without a single orphan on large screens.

### D5 - The annual calendar stays on the natural year

`getYearlyHeatmapData`, `createCalendarCells`, `getMonthMarkers` and `YearPracticeCalendar` keep their year-based API and their existing hover, focus, touch, preview and navigation logic. Only the dashboard periods that the change targets use rolling windows. Alternative considered: extend the calendar to a rolling twelve-month range; rejected because the user wants the calendar overview as before.

### D6 - The wellbeing card follows its settings

`DashboardView` reads the local mood/focus preference with `usePracticeFeedbackPreference`. The card renders only when at least one metric is enabled and the history has a value for an enabled metric. `PracticeWellbeing` receives the two flags, builds its metric list from the enabled ones and ignores the disabled series in the summaries, chart, legend and tooltips. Alternative considered: keep showing the card whenever old values exist; rejected because a disabled metric should not keep surfacing in the dashboard.

### D7 - Copy becomes window-neutral

Replace fixed labels such as "Tiempo en 30 días", "tiempo total del historial" and "prácticas completadas" with period-neutral or rolling-window strings in both dictionaries. Add the longest-streak label and description. The top weekly summary and the natural-year calendar keep their current wording.

## Risks / Trade-offs

- **Numbers change for existing users** → Expected; the change is display-only and no stored session is rewritten.
- **Year window covers parts of thirteen calendar labels** → The window is twelve calendar-month buckets, so the first and last are clipped; the specs and tooltips name the exact bucket range.
- **The wellbeing card depends on a local preference** → Read it on mount and on storage events; until it resolves, the card is absent instead of flashing stale data.
- **Seven metric cards leave a gap at some breakpoints** → Use a responsive grid that fills the row at the common widths and verify at 390, 768 and 1280 px.
- **Lower coverage if tests are only adjusted** → Rewrite the affected tests around the new windows and add boundary cases (mid-week, mid-year, leap day, 12-month crossing).

## Migration Plan

No data migration. Ship the new window functions and UI together; if rolled back, the dashboard returns to the old calendar windows without touching stored data.
