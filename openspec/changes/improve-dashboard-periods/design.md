# Design

## Context

See `proposal.md` - Why. The dashboard currently mixes three anchoring rules:

- `getComparisonSpans` treats the week as Monday-to-today and the year as 1 January-to-today.
- `getPracticeChartRanges` draws seven Monday-to-Sunday days and twelve calendar months of the current year, including future intervals.
- `getYearlyHeatmapData` and `createCalendarCells` are hard-wired to a natural calendar year.
- `PracticeTimeChart`, `TempoProgress`, `PracticeWellbeing` and the balance cards each own a period selector; `DashboardView` owns a separate balance period.
- The metric cards and `getPracticeContentRankings` still read the full history.

The top weekly summary uses `getSessionsForWeek` / `getPracticeWeekDays` and must keep the calendar week.

## Goals / Non-Goals

**Goals:**

- One date-window source of truth for every period, so charts, summaries, comparisons and the calendar cannot disagree.
- Keep each card's existing period selector and default.
- Keep the top weekly summary and all stored data untouched.

**Non-Goals:**

- Unifying the selectors into one global control.
- Changing the dashboard layout beyond the extra streak card.
- Changing tempo's existing week/month selector to a year option.
- Changing session storage, Supabase or the iOS app.

## Decisions

### D1 - `getComparisonSpans` defines every rolling window

Extend `getComparisonSpans(period, today)` to return the current and previous windows for all three periods:

- **Week**: current `[today - 6, today]`, previous `[today - 13, today - 7]`.
- **Month**: current `[today - 29, today]`, previous `[today - 59, today - 30]` (unchanged).
- **Year**: current starts on the first day of the month eleven months before today's month and ends today; previous starts on the same calendar date one year earlier and ends on the same calendar date one year earlier as today, clamped to the last valid day (29 February → 28 February).

`getPracticeChartRanges` derives its ranges from `current`, so the chart and its comparison always share the same window. Alternative considered: compute each caller's range independently; rejected because the current code already drifted between chart ranges and comparison spans.

### D2 - Year buckets are twelve clipped calendar months

The year chart and wellbeing series split the year span into calendar-month buckets, first and last clipped to the window. Labels stay short month names; the calendar's month markers add the year at the first month and whenever the year changes. Alternative considered: twelve fixed 30-day buckets; rejected because the card is labelled by month and users reason in calendar months.

### D3 - One rhythm period drives the period-less cards

`DashboardView` owns `rhythmPeriod` (default `week`) and passes it to `PracticeTimeChart`. The metric cards and `TopPracticeContent` use the same `getComparisonSpans(rhythmPeriod, today).current` window. `PracticeTimeChart` stops owning its period state.

- `getPracticeStatistics` gains an optional range and computes sessions, total seconds and most-practised skill inside it.
- `getPracticeContentRankings` gains a range and only iterates phases inside it.
- Average BPM filters the window's sessions with `averageBpm > 0`.
- The streak values are computed once from the full history and never filtered by the window.

Alternative considered: give the metric cards their own selector; rejected because the user asked for "all fields" to share a reference period, and the rhythm card is the first selector on the page.

### D4 - Longest streak is a pure history function

Add `getLongestStreak(history)` next to `getStreakCount`: build the sorted set of practice date keys and walk it once, keeping the best run. Empty history returns 0. Add a `longestStreak` metric card after the current streak; the metric grid moves to four columns on wide viewports so seven cards wrap without a single orphan on large screens.

### D5 - The calendar takes a date range, not a year

Replace `getYearlyHeatmapData(year, history)` with a range-based generator that returns one `DailyStats` per day from the year window's start through today. Generalize `createCalendarCells` and `getMonthMarkers` to accept the window start and its weekday instead of a year. `YearPracticeCalendar` receives the days, the range and today; the year prop disappears. The grid starts on the Monday on or before the range start and draws no future day. Existing hover, focus, touch, preview and navigation logic is unchanged.

### D6 - Copy becomes window-neutral

Replace fixed labels such as "Tiempo en 30 días", "tiempo total del historial", "prácticas completadas" and "El calendario muestra todo {year}" with period-neutral or rolling-window strings in both dictionaries. Add the longest-streak label and description. The top weekly summary keeps its current wording.

## Risks / Trade-offs

- **Numbers change for existing users** → Expected; the change is display-only and no stored session is rewritten.
- **Year window covers parts of thirteen calendar labels** → The window is twelve calendar-month buckets, so the first and last are clipped; the specs and tooltips name the exact bucket range.
- **Calendar grid refactor touches touch/preview logic** → Keep the existing interaction code and only change the data source; cover the range boundary with tests.
- **Seven metric cards leave a gap at some breakpoints** → Use a responsive grid that fills the row at the common widths and verify at 390, 768 and 1280 px.
- **Lower coverage if tests are only adjusted** → Rewrite the affected tests around the new windows and add boundary cases (mid-week, mid-year, leap day, 12-month crossing).

## Migration Plan

No data migration. Ship the new window functions and UI together; if rolled back, the dashboard returns to the old calendar windows without touching stored data.
