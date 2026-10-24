# Tasks

## 1. Internationalization

- [x] 1.1 Add the dashboard keys for guitar balance, most-practiced content, schedule and tempo progress (titles, descriptions, period captions, empty states, movers, small-sample note, metronome note) to `src/i18n/dictionary.ts`, `src/i18n/es.ts` and `src/i18n/en.ts`; verify `npm test` keeps `tests/i18n.test.mjs` parity green.
- [x] 1.2 Add the guitar labels (electric, acoustic, unclassified) and the `session.guitarType` practice/timer labels used by the selector and editor; verify both locales expose the same keys with the i18n test.

## 2. Skill analytics correctness

- [x] 2.1 Replace the local skill arrays in `src/utils/practice-analytics.ts` and `src/utils/manual-practice.ts` with the `PRACTICE_SKILLS` constant from `src/types/practice.ts`; verify `npm test` and add a manual-practice case with a `lick` block in `tests/manual-practice.test.mjs`.
- [x] 2.2 Add `sessionCount` to each `SkillDistribution` category and compute it in `getSkillDistribution` when a session has positive seconds for that skill; update `tests/practice-analytics.test.mjs` to assert the new field and a lick-only month.
- [x] 2.3 Extend `getPracticeStatistics` coverage so `lick` can be the most-practiced skill; verify a new analytics test with lick seconds selects it.

## 3. Session model, normalization and per-block BPM

- [x] 3.1 Add `guitarType?: GuitarType` to `SessionRecord` and `averageBpm?: number` to `SessionPhaseRecord` in `src/types/practice.ts`; verify `npm run typecheck`.
- [x] 3.2 Validate both new fields in `normalizeSessionRecord`: keep only `electric`/`acoustic`, and keep only a finite positive per-block BPM, dropping invalid values without losing the session; verify with new cases in `tests/practice-session-record.test.mjs` and a storage-state test.
- [x] 3.3 Add a pure helper in `src/utils/metronome-bpm.ts` that splits the session BPM timeline by cumulative block elapsed seconds and returns each block's time-weighted average; verify boundary, tempo-change, zero-duration and no-metronome cases in `tests/metronome-bpm.test.mjs`.
- [x] 3.4 Extend `createPracticeSessionRecord` with optional `guitarType` and `bpmSamples`, store the type on the session and the derived value on each block; verify with a new multi-block case in `tests/practice-session-record.test.mjs` and keep the existing case passing by omitting absent values.
- [x] 3.5 Extend `ManualPracticeInput`/`createManualPracticeRecord` with an optional guitar type and no per-block BPM; verify with new cases in `tests/manual-practice.test.mjs`.
- [x] 3.6 Extend `EditableSession`/`EditableSessionBlock` and `applySessionEdit` with the guitar type and preservation of existing per-block BPM, including the no-block branch; verify with new cases in `tests/practice-session-editing.test.mjs`.
- [x] 3.7 Add a localStorage-backed guitar preference service and `useGuitarPreference` hook that reads only a valid last-used type and remembers changes; verify the pure validation with a unit test and the hook with `npm run typecheck`.

## 4. Guitar type in the practice flows

- [x] 4.1 Add the optional guitar type to `ActivePracticeSession` and a store action to change it while the practice runs; verify the active-session persistence test in `tests/active-practice-session.test.mjs`.
- [x] 4.2 Show the electric/acoustic/unset selector in the running practice header, initialise it from the last-used preference when the session has none, and pass the final value to `createPracticeSessionRecord`; verify the saved record through the record test and manually in `/practice`.
- [x] 4.3 Add the session-level guitar selector to `ManualPracticeEntry`, initialised from the preference; verify the created record in `tests/manual-practice.test.mjs` and manually in the dashboard entry dialog.
- [x] 4.4 Add the guitar selector (including "not specified") to `SessionEditor`; verify editing keeps or clears the type in `tests/practice-session-editing.test.mjs` and manually in a saved practice.
- [x] 4.5 Verify the type survives reload and cloud merge by extending `tests/practice-storage-state.test.mjs` and `tests/practice-data-merge.test.mjs` with valid, invalid and absent values.

## 5. Interactive day summary

- [x] 5.1 Extend `usePracticeDayTooltip` with a close delay, a card ref, `cancelHide`/`scheduleHide` handlers, and window scroll/resize/Escape listeners that ignore scrolls inside the card; verify with `npm run typecheck` and the manual interaction checks below.
- [x] 5.2 Make `PracticeDayTooltip` enterable (`pointer-events-auto`) and accept the enter/leave handlers from the hook while keeping its portal, id and role; verify it can be hovered, scrolled internally and closed with Escape.
- [x] 5.3 Wire the calendar and weekly summary triggers to the delayed hide and cancel-on-card-enter behavior without changing their click navigation; verify day-to-day hover switching and the empty-day summary.
- [x] 5.4 Extend `tests/practice-tooltip.test.mjs` with viewport clamping, the 10 px gap and the above/below decision, including a mocked element and window size.
- [x] 5.5 Manually verify: pointer moves from day into the card, the card survives the gap, internal scrolling keeps it open, page scroll closes it, resize closes it, Escape closes it, and keyboard focus opens it.

## 6. Time chart durations

- [x] 6.1 Replace `formatExactDuration` with `formatPracticeDuration` in the `PracticeTimeChart` summary so one hour or more reads in hours and minutes and shorter values read in minutes; verify `tests/format.test.mjs` covers 300 and 252 minutes and manually check the bars.

## 7. Skill balance summary

- [x] 7.1 Change `SkillBalance` to receive the `SkillDistribution`, add `activeSkill` state, and swap the donut centre to the hovered/focused skill's minutes, percentage and session count; restore the monthly total when the pointer leaves the card; verify with `npm run typecheck` and manually.
- [x] 7.2 Make the legend rows keyboard-focusable controls with complete accessible names and keep the arcs pointer-interactive, without making colour the only signal; verify tab order, focus summary and screen-reader labels manually.
- [x] 7.3 Update `DashboardView` to pass the distribution instead of a totals map and remove the now-unused `getSkillPercentages` path if nothing else uses it; verify `npm test` and `npm run typecheck`.

## 8. Electric/acoustic balance

- [x] 8.1 Add a pure `getGuitarBalance(history, range)` to `src/utils/practice-analytics.ts` returning electric, acoustic and unclassified seconds for the month; verify classified, one-type, mixed and empty cases in `tests/practice-analytics.test.mjs`.
- [x] 8.2 Create `src/components/dashboard/GuitarBalance.tsx` with a hand-written semicircle, per-type minutes and percentages, a separate unclassified note and an empty state; verify `npm run typecheck` and manual rendering in the dashboard.
- [x] 8.3 Add the card to `DashboardView` with a memoized monthly balance and an accessible name that includes both values; verify keyboard/screen-reader text and the empty state with no classified sessions.

## 9. Most-practiced content and schedule

- [x] 9.1 Add pure `getPracticeContentRankings(history, repertoireItems)` returning top songs, techniques and theory topics with seconds and distinct session counts, grouping names case/accent-insensitively and falling back to the stored block name for deleted items; verify song, part, deleted-item, normalization, ordering and empty cases in `tests/practice-analytics.test.mjs`.
- [x] 9.2 Add pure `getPracticeSchedule(history)` with seven weekday seconds, four time-band seconds, and peak weekday/band assigned from local start time; verify weekday, band, midnight-crossing and empty cases in `tests/practice-analytics.test.mjs`.
- [x] 9.3 Create `src/components/dashboard/TopPracticeContent.tsx` with three ranked columns, text values, proportional bars and per-column empty states; verify `npm run typecheck` and manual rendering.
- [x] 9.4 Create `src/components/dashboard/PracticeSchedule.tsx` with weekday bars, band bars and a peak summary; verify `npm run typecheck` and manual rendering, including the empty history.
- [x] 9.5 Add both cards to `DashboardView` with full-history captions and memoized inputs; verify `npm test` and `npm run typecheck`.

## 10. Tempo progress

- [x] 10.1 Add pure content-key and period-window helpers for the tempo card: rolling 7/30-day windows, song/part, lick and normalized skill-name keys; verify window boundaries and key normalization in a new `tests/practice-analytics.test.mjs` block.
- [x] 10.2 Implement `getTempoTrend(history, period, today, repertoireItems)` with recent-level averaging (up to three sessions), five-minute minimum per content/window, time-weighted aggregate delta, percentage from aggregate levels, compared count, small-sample flag and movers; verify multi-content, one-window-only, legacy single-block, legacy multi-block, no-metronome and empty cases.
- [x] 10.3 Create `src/components/dashboard/TempoProgress.tsx` with week/month toggle, big BPM and percentage delta, period caption, compared count, small-sample note, metronome note and movers list; verify `npm run typecheck` and manual interaction with the toggle and empty states.
- [x] 10.4 Add the tempo card to `DashboardView` alongside the guitar balance and verify `npm test` and `npm run typecheck`.

## 11. Dashboard integration

- [x] 11.1 Arrange the new cards in `DashboardView` (guitar + tempo row, full-width content ranking, schedule before the metric grid) while keeping the existing time chart, skill balance, metric grid and suggested practice; verify the layout at mobile, tablet and desktop widths manually.
- [x] 11.2 Verify every new card states its period, exposes text values and has an empty state; check with the browser at 320 px, 768 px and 1280 px.
- [x] 11.3 Review the new components against `docs/component-conventions.md` (layering, `"use client"`, no logic in components) and extract any calculation left in a component into `utils`; verify `tests/architecture-layers.test.mjs`.

## 12. Final verification

- [x] 12.1 Run `npm test`, `npm run typecheck` and `npm run build`; fix regressions without weakening assertions.
- [x] 12.2 Manually verify the hover card (enter, internal scroll, page scroll, resize, Escape, keyboard), the skill balance summary, the time-chart format, the guitar balance, the rankings, the schedule and the tempo card with both an empty and a populated history.
- [x] 12.3 Confirm no old day or session data is lost after hydration and cloud merge, and that invalid stored guitar/BPM values are dropped without losing the record.

## Workflow follow-up

- Archive the change after review and after the manual verification is accepted.
- Verify the archived specs and the updated main specs.
