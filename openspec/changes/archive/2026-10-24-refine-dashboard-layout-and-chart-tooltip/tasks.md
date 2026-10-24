# Tasks

## 1. Balanced dashboard rows

- [x] 1.1 Pair `PracticeTimeChart` with `SkillBalance` in one `lg:grid-cols-2` row and `GuitarBalance` with `TempoProgress` in the next, both using `items-stretch`, in `src/components/dashboard/DashboardView.tsx`. Verify with `npx tsc --noEmit`.
- [x] 1.2 Change the period summary grid in `PracticeTimeChart` to two columns so its four figures stay readable inside the narrower card. Verify with `npx tsc --noEmit`.
- [x] 1.3 Verify in the browser at 320, 768 and 1280 px that each pair starts on the same row with equal width and height on wide viewports, stacks full-width on narrow ones, keeps the summary readable and produces no horizontal overflow.

## 2. Detailed chart tooltip

- [x] 2.1 Add `sessionCount` to `PracticeTimeBucket`, fill it in the bucket builder from the sessions whose start date falls inside the range, and make `getPracticeTimeSummary` sum the bucket counts instead of filtering again. Add tests for session counts in week, month and year buckets and rerun `node --test tests/practice-analytics.test.mjs`.
- [x] 2.2 Extend `ChartTooltip` in `src/types/dashboard.ts` with the session count, average per session and best-unit percentage, grow the tooltip size in `src/utils/practice-chart-tooltip.ts`, and update its edge test. Verify with `node --test tests/practice-chart-tooltip.test.mjs` and `npx tsc --noEmit`.
- [x] 2.3 Add the tooltip copy to `src/i18n/dictionary.ts`, `src/i18n/es.ts` and `src/i18n/en.ts`: session singular and plural, the average suffix and the best-day, best-week and best-month comparisons. Verify with `node --test tests/i18n.test.mjs` and `npx tsc --noEmit`.
- [x] 2.4 Render the detailed tooltip in `PracticeTimeChart` with the bucket's sessions, average per session and percentage of the period's best bucket, using the period-specific best wording and keeping the existing total, period selector and empty state. Verify with `npx tsc --noEmit`.
- [x] 2.5 Verify in the browser at 320, 768 and 1280 px that the tooltip shows the expected sessions, average and percentage for week, month and year, that the best bucket reads 100 %, that it also appears on keyboard focus, that empty buckets show no card, that it is not clipped at the card edges and that the console has no errors.

## 3. Integration checks

- [x] 3.1 Run `npm test` and confirm every suite passes.
- [x] 3.2 Run `npx tsc --noEmit` and `npm run build` and confirm both complete without errors.
- [x] 3.3 Run `openspec validate refine-dashboard-layout-and-chart-tooltip --strict` and confirm the change is valid.
- [x] 3.4 Do a final browser pass over the dashboard, confirming both paired rows and the detailed tooltip at the three breakpoints.

## Workflow follow-up

- Archive this change after `improve-practice-dashboard`, `refine-practice-dashboard`, `refine-practice-plans-and-insights` and `refine-dashboard-and-repertoire-actions`, because it assumes the layout and summary introduced by them.
