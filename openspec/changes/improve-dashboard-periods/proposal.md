# Proposal

## Why

The dashboard's periods are anchored to the calendar: the rhythm chart starts on Monday, the year starts on 1 January, and several cards still summarize the whole history. Mid-week, mid-month and mid-year the figures are therefore not comparable with the previous period, and two cards can mean different things by "the period". The streak card also reports only the current run, so the best run is never visible.

## What Changes

- Every dashboard period becomes a rolling window that ends today:
  - **Week**: the 7 days ending today, so on a Tuesday the first day is the previous Wednesday.
  - **Month**: the 30 days ending today, as already documented.
  - **Year**: the 12 months ending with the current month, instead of 1 January to today.
- Every comparison uses the immediately preceding window of the same length; the year compares the same months one year earlier.
- Cards without their own period selector — the metric cards and the top-content ranking — follow the practice-rhythm period instead of the full history.
- The metric cards stop using the full history: time, sessions, average BPM, hours and most-practised content are computed over the selected window. The two streaks remain historical by nature and are not windowed.
- Add a **longest streak** metric card with the best consecutive-day run in the full history, next to the current streak.
- The annual calendar becomes a 12-month rolling heatmap ending today instead of the natural calendar year.
- Reword the labels that name a fixed window ("30 days", "this year") so they name the rolling period, and keep the top weekly summary describing the current Monday-to-Sunday week, unchanged.

No stored data changes: this is a read-only dashboard change.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `practice-dashboard`: rolling period windows and equivalent previous windows, all cards following a period, the longest streak card, the rolling 12-month calendar and the renamed labels.

## Impact

- **Code**: `src/components/dashboard/` (`DashboardView`, `PracticeTimeChart`, `SkillBalance`, `GuitarBalance`, `TempoProgress`, `PracticeWellbeing`, `TopPracticeContent`, `YearPracticeCalendar`, `MetricCard`), `src/utils/practice-analytics.ts`, `src/utils/period-comparison.ts`, `src/utils/practice-calendar.ts`, `src/utils/practice-metrics.ts`, `src/i18n/es.ts` and `src/i18n/en.ts`.
- **Tests**: `tests/practice-analytics.test.mjs`, `tests/period-comparison.test.mjs`, `tests/practice-calendar.test.mjs` and any dashboard helper tests.
- **Docs**: `docs/dashboard.md`.
- **Unchanged**: stored sessions, Supabase schema, the home screen and the top weekly summary.
