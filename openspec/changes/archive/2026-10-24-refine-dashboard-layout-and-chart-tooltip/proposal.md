# Proposal

## Why

The rhythm card now takes the whole row by itself, which leaves the dashboard unbalanced: the chart stretches while the skill and guitar cards sit in narrower rows, and the period summary spreads across more width than its four figures need. The extra detail the user actually wanted belongs in the chart's hover card, where it can explain each individual bar. Today that tooltip only repeats the bucket label and its total time, so it cannot answer how many sessions a day held, how long they lasted, or how that day compares with the best one in the period.

## What Changes

- Pair "Ritmo de práctica" with "Balance de habilidades" in the same row, each taking half the width with equal height on wide viewports and stacking full-width on narrow ones. Below, pair "Balance de guitarras" with "Progreso de tempo" in the same half-and-half arrangement.
- Keep the period summary added in the previous change, but lay its four figures in a two-column grid so they stay readable inside the narrower card.
- Extend the chart's hover card so each bucket shows, besides its label and total time, the number of sessions, the average time per session and what percentage of the best day/week/month in the selected period it represents. The same card appears on keyboard focus.
- Introduce no new dependencies, storage or persisted data.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `practice-dashboard`: adds the pairing of the rhythm card with the skill balance and of the guitar balance with tempo progress, and enriches the chart tooltip with per-bucket sessions, average per session and comparison with the best unit of the period.

## Impact

- `src/components/dashboard/DashboardView.tsx` for the two half-width rows.
- `src/components/dashboard/PracticeTimeChart.tsx` for the summary grid and the detailed tooltip.
- `src/utils/practice-analytics.ts` so each time bucket carries its session count.
- `src/types/dashboard.ts` and `src/utils/practice-chart-tooltip.ts` for the tooltip fields and its larger size.
- `src/i18n/dictionary.ts`, `es.ts` and `en.ts` for the tooltip copy.
- `tests/practice-analytics.test.mjs` and `tests/practice-chart-tooltip.test.mjs` for bucket session counts and the new tooltip size.
- Archive note: apply and archive this change **after** `improve-practice-dashboard`, `refine-practice-dashboard`, `refine-practice-plans-and-insights` and `refine-dashboard-and-repertoire-actions`, because it assumes the layout and summary introduced by them.
