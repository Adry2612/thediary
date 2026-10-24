# Tasks

## 1. Remove the practice schedule

- [x] 1.1 Remove the `PracticeSchedule` import, the `getPracticeSchedule` calculation, the schedule card from the dashboard layout and delete `src/components/dashboard/PracticeSchedule.tsx`; give `PracticeTimeChart` its own full row. Verify with `npx tsc --noEmit` and `grep -rn "PracticeSchedule" src`.
- [x] 1.2 Remove `getPracticeSchedule`, `PracticeSchedule`, `PracticeTimeBand`, `PRACTICE_TIME_BANDS`, `getPracticeTimeBand` from `src/utils/practice-analytics.ts` and `PRACTICE_TIME_BAND_LABEL_KEYS` from `src/utils/dashboard-data.ts`, and delete the schedule tests from `tests/practice-analytics.test.mjs`. Verify with `node --test tests/practice-analytics.test.mjs`, `npx tsc --noEmit` and `grep -rn "getPracticeSchedule\|PracticeTimeBand\|PRACTICE_TIME_BANDS\|scheduleWeekday" src tests`.
- [x] 1.3 Remove the retired schedule copy (`schedule`, `scheduleDescription`, `scheduleSubtitle`, `scheduleAria`, `scheduleWeekday`, `scheduleBand`, `scheduleNight`, `scheduleMorning`, `scheduleAfternoon`, `scheduleEvening`, `schedulePeakWeekday`, `schedulePeakBand`, `scheduleEmpty`) from `src/i18n/dictionary.ts`, `src/i18n/es.ts` and `src/i18n/en.ts`. Verify with `npx tsc --noEmit` and `node --test tests/i18n.test.mjs`.

## 2. Period summary for the rhythm card

- [x] 2.1 Add `PracticeTimeSummary` and `getPracticeTimeSummary(history, period, today)` to `src/utils/practice-analytics.ts`, reusing the existing bucket builders for the total, session count, average per session, best bucket and previous-period total, with a null ratio when the previous period has none. Add tests for week/month/year, session boundaries, best unit, previous-period comparison, no previous data and an empty period; verify with `node --test tests/practice-analytics.test.mjs`.
- [x] 2.2 Add the summary copy to `src/i18n/dictionary.ts`, `src/i18n/es.ts` and `src/i18n/en.ts`: sessions, average per session, best day/week/month, previous-period label, same-as-before and no-previous-data states. Verify with `npx tsc --noEmit` and `node --test tests/i18n.test.mjs`.
- [x] 2.3 Render the summary in `src/components/dashboard/PracticeTimeChart.tsx` as a definition list below the total and above the chart, keeping the period selector, total, tooltip and empty-chart message intact. Verify with `npx tsc --noEmit`.
- [x] 2.4 Verify in the browser with a seeded history at 320, 768 and 1280 px: the summary matches the week/month/year totals, switches with the period selector, shows the no-previous-data state, keeps the empty-period layout without horizontal overflow and logs no console errors.

## 3. Repertoire header action

- [x] 3.1 Replace the repertoire header's "Preparar práctica" link with "Añadir nuevo elemento" pointing to `/repertoire/new` with the plus icon, delete the standalone add-item block and its description, and remove the now-unused `prepare` key from the repertoire dictionary while keeping `newItemDescription` for the new-item page. Verify with `npx tsc --noEmit`, `grep -rn "text.prepare" src` and `node --test tests/i18n.test.mjs`.
- [x] 3.2 Verify in the browser at 320, 768 and 1280 px that the header add action opens `/repertoire/new`, no prepare action or duplicate add block remains, the summary and rankings keep their position and there is no horizontal overflow.

## 4. Integration checks

- [x] 4.1 Run `npm test` and confirm every suite passes.
- [x] 4.2 Run `npx tsc --noEmit` and `npm run build` and confirm both complete without errors.
- [x] 4.3 Run `openspec validate refine-dashboard-and-repertoire-actions --strict` and confirm the change is valid.
- [x] 4.4 Do a final browser pass over dashboard and repertoire, confirming the rhythm summary, the removed schedule card and the repertoire header action.

## Workflow follow-up

- Archive this change after `improve-practice-dashboard`, `refine-practice-dashboard` and `refine-practice-plans-and-insights`, because the removed dashboard requirements live in those pending deltas.
