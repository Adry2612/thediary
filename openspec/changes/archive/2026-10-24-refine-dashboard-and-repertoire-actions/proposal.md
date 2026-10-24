# Proposal

## Why

The "Cuándo practicas" card does not earn the space it takes: it splits the dashboard's time story across two cards and repeats information the user rarely needs, while "Ritmo de práctica" only shows a single total for the selected period. Without a few extra figures, the rhythm card cannot answer whether practice was consistent, which day carried the period, or whether the month is going better than the last one. In the repertoire, the header's main action sends the user to practice instead of the more frequent task of adding an item, and the standalone add-item block repeats the same call to action below a description that explains nothing new.

## What Changes

- Remove the "Cuándo practicas" card and the analytics behind it: the weekday/time-band distribution, its labels, and its tests. The "Ritmo de práctica" card takes the full row on its own.
- Enrich "Ritmo de práctica" with a summary for the selected period (week, month, year): session count, average time per session, the best day/week/month and how the total compares with the previous equivalent period. The period selector keeps driving both the chart and the summary.
- Replace the repertoire header's "Preparar práctica" action with "Añadir nuevo elemento", pointing to the existing new-item page. Remove the standalone add-item block, including its description text; the button alone is self-explanatory and stays in the header.
- Keep every other dashboard card and the skill/guitar pairing unchanged, and introduce no new dependencies or persistence.
- Archive note: apply and archive this change **after** `improve-practice-dashboard`, `refine-practice-dashboard` and `refine-practice-plans-and-insights`, because the removed dashboard requirements live in those pending deltas.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `practice-dashboard`: removes the practice schedule card and its requirement family, and adds the per-period summary shown by the practice rhythm card.
- `repertoire-library`: the repertoire header offers "add new item" instead of "prepare practice", and the duplicate add-item block disappears.

## Impact

- `src/components/dashboard/DashboardView.tsx` for the new full-width rhythm card and the removed schedule calculation.
- `src/components/dashboard/PracticeTimeChart.tsx` for the summary figures; `src/components/dashboard/PracticeSchedule.tsx` is deleted.
- `src/utils/practice-analytics.ts` loses `getPracticeSchedule` and the weekday/time-band types, and gains the period summary helper; `src/utils/dashboard-data.ts` loses the time-band label map.
- `src/components/repertoire/RepertoireView.tsx` for the header action and the removed block.
- `src/i18n/dictionary.ts`, `es.ts`, and `en.ts` for the new summary copy and the retired schedule/repertoire strings.
- Tests: `tests/practice-analytics.test.mjs` for the removed schedule and the new summary, plus `tests/i18n.test.mjs` for copy parity.
