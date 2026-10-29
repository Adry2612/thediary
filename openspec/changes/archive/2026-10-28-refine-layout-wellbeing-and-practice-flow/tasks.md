# Tasks

## 1. Navigation column on ultrawide

- [x] 1.1 Add `HEADER_COLUMN_CLASSES` next to `PAGE_COLUMN_CLASSES` in `src/components/ui/PageShell.tsx`, with the current width below `2xl` and the progressive capped width at `2xl`, and verify `npm run typecheck` passes.
- [x] 1.2 Use `HEADER_COLUMN_CLASSES` for the desktop nav, the mobile section label and the mobile menu panel in `src/components/layout/SiteNavigation.tsx`, and verify at 1536, 1920 and 3440 px that the header grows without touching the edges while page content keeps its 96 rem cap.
- [x] 1.3 Verify at 375 and 768 px that the header keeps its previous gutters, has no horizontal scrollbar and the mobile menu still opens and aligns with the page content.

## 2. Shared wellbeing series

- [x] 2.1 Extract the private week/month/year bucket ranges of `src/utils/practice-analytics.ts` into an exported `getPracticeChartRanges(period, today)` helper and refactor the existing time buckets to use it; verify `npm test` still passes `tests/practice-analytics.test.mjs` with unchanged results.
- [x] 2.2 Add `getPracticeWellbeingSeries`, `getPracticeWellbeingSummary` and `hasPracticeWellbeingData` to `src/utils/practice-metrics.ts`, reusing `getPracticeMetricSummary` and the shared ranges, and verify `npm run typecheck` passes.
- [x] 2.3 Replace the month-only `getPracticeWellbeing` and its callers, and rewrite `tests/practice-metrics.test.mjs` to cover gaps as `null`, per-bucket averages, week/month/year summaries and the previous-period comparison; verify `node --test tests/practice-metrics.test.mjs` passes.

## 3. Wellbeing chart in the dashboard

- [x] 3.1 Rewrite `src/components/dashboard/PracticeWellbeing.tsx` with its own period selector, the numeric summary row, an SVG line chart with gaps and distinguishable markers, a detail row for the consulted bucket and a visually hidden value table; verify it renders week, month and year data without a colour-only signal.
- [x] 3.2 Update `src/components/dashboard/DashboardView.tsx` to pass `history` and `today`, render the card when the history has any wellbeing value and keep its full-width position; verify the card is absent with no wellbeing history and shows an empty state for an empty selected period.
- [x] 3.3 Add the chart labels, legends, aria text, bucket detail and empty states to `src/i18n/es.ts`, `src/i18n/en.ts` and `src/i18n/dictionary.ts`; verify both languages typecheck and the chart reads correctly with a screen reader.

## 4. Wellbeing capture and detail without emojis

- [x] 4.1 Remove `PRACTICE_METRIC_EMOJIS` from `src/utils/practice-metrics.ts` and update `src/components/practice/PracticeMetricScale.tsx` to show the number and the textual label in each option; verify `grep -r "PRACTICE_METRIC_EMOJIS" src` returns nothing and the carousel, keyboard controls and clear action still work.
- [x] 4.2 Update `src/components/dashboard/PracticeSessionDetails.tsx` to show the metric label, its textual value and `n/5` without an emoji; verify a session with both metrics shows both, one metric shows one and no metric leaves no gap.
- [x] 4.3 Update the settings descriptions and scale hint in `src/i18n/es.ts` and `src/i18n/en.ts` so they no longer mention emojis; verify no emoji character remains in the wellbeing copy.

## 5. Free practices finish as complete

- [x] 5.1 Add an optional `completed` override to `createPracticeSessionRecord` in `src/utils/practice-session-record.ts` and verify `tests/practice-session-record.test.mjs` covers an override of `false` to `true`.
- [x] 5.2 Pass `completed: session.isCountUp ? true : pendingResult.completed` from `PracticeSession.saveCompletedSession` and verify a quick practice saves as complete while a planned routine ended early still saves as incomplete.
- [x] 5.3 Move the registered/completed/finished-early status strings of `PracticeSessionDetails` into the `practice` section of `src/i18n/es.ts`, `src/i18n/en.ts` and `dictionary.ts`; verify a saved free practice no longer reads as finished before completing the routine in either language.
- [x] 5.4 Verify editing a free practice keeps it complete unless the completion checkbox is changed explicitly, and that the day summary and history totals stay consistent.

## 6. Quick repertoire practice confirmation

- [x] 6.1 Add `targetMinutes` to `PracticeLaunchSession`, `ActivePracticeSession` and the quick-plan options, extend `createQuickRepertoirePlan` to accept `{ guitarType?, targetMinutes? }` and verify `tests/practice-launch.test.mjs` covers the overrides and the unchanged inheritance without options.
- [x] 6.2 Change `src/hooks/useRequestedLaunch.ts` to return the matched quick repertoire item instead of launching it, and wire `PracticeWorkspace` to open the new dialog once per request; verify the URL request is not processed twice and cancelling does not start a session.
- [x] 6.3 Create `src/components/practice/FreePracticeStartDialog.tsx` with the item title and artist, a required electric/acoustic choice preselected from the item or the last used type, an optional whole-minute target and cancel/start actions; verify start is disabled without a guitar type and the chosen type is remembered.
- [x] 6.4 Add the dialog copy to `src/i18n/es.ts`, `src/i18n/en.ts` and `dictionary.ts`; verify both languages render the dialog and the start action carries the chosen type and target into the session.

## 7. Session time target

- [x] 7.1 Add an optional `limitMs` to `synchronizePracticeTimer` so it consumes only the time left until the target and reports `targetReached`, and verify `tests/practice-timer.test.mjs` covers the clamp, the single signal and simultaneous completion.
- [x] 7.2 Extend `usePracticeTimer` and `useActivePracticeSessionStore` with the target state, the one-time end sound, the resume/no-repeat rule and hydration normalization; verify the active-session tests and `npm run typecheck` pass.
- [x] 7.3 Add the target section and reached notice to `src/components/practice/TimerCard.tsx`, show the settings button for count-up sessions and keep the block-flow options hidden there; verify a free practice can set a target and a planned practice keeps the block options.
- [x] 7.4 Pass `session.targetMinutes` from `PracticeWorkspace` through `PracticeSession` to the timer and from the pre-start dialog into the session; verify the timer pauses exactly at 30 minutes, shows the notice, resumes without repeating the sound and finishes normally.
- [x] 7.5 Add the target settings, notice and validation copy to `src/i18n/es.ts`, `src/i18n/en.ts` and `dictionary.ts`; verify zero, negative and fractional values are rejected in both languages.

## 8. Herramientas en filas y afinador

- [x] 8.1 Lay `src/components/tools/ToolsView.tsx` out as a responsive grid: one column below 1280 px, two columns from 1280 px, with the metronome and tuner paired, the tone generator and calculator paired, and the string block spanning both columns; verify at 375, 768, 1280, 1536 and 3440 px that no section overflows horizontally and no tab selector returns.
- [x] 8.2 Harden `src/hooks/useTuner.ts`: resolve `AudioContext` or `webkitAudioContext`, await `context.resume()` before reporting listening, route the analyser through a zero-gain node to the destination, and surface a `failed` error when the context is not running; verify `npm run typecheck` passes.
- [x] 8.3 Update `src/components/tools/TunerPanel.tsx` and `src/i18n/es.ts`, `en.ts` and `dictionary.ts` for the listening/error states, including the secure-context and audio-start failures; verify both languages show the error instead of an idle tuner.
- [x] 8.4 Run `node --test tests/tuner.test.mjs` and verify with a real microphone on desktop and a mobile browser that the tuner shows the note and cents, resumes a suspended context, and stops listening when leaving the tools page.

## 9. Integration verification

- [x] 9.1 Run `npm test` and `npm run typecheck` and verify both finish without failures.
- [x] 9.2 Verify in the browser at 375, 768, 1536, 1920 and 3440 px that the navigation, dashboard, tools rows, free practice dialog, target notice and session detail behave as specified and cause no horizontal overflow.
- [x] 9.3 Verify a full free repertoire practice end to end: confirmation, electric/acoustic choice, optional 30-minute target, pause and notice at the target, finish and save as complete.
- [x] 9.4 Search `src` and the i18n files for leftover emoji characters or "emoji" copy and verify the wellbeing surfaces are text-only.
- [x] 9.5 Verify the tuner starts from its control, shows a detected note, reports a clear error without permission, and stops the microphone after leaving the tools page.

## 10. Avisos del temporizador

- [x] 10.1 Add `src/components/ui/Toast.tsx` as an auto-dismissing, non-interactive status message and verify it disappears after its duration without trapping pointer events.
- [x] 10.2 Replace the persistent target and block notices in `src/components/practice/TimerCard.tsx` with the toast, keeping the target pause and the next-block action; verify both notices disappear while the timer state remains usable.
- [x] 10.3 Neutralise the completion summary copy in `src/i18n/es.ts`, `src/i18n/en.ts` and `dictionary.ts`; verify the dialog reads as a session summary in both languages and still saves normally.
- [x] 10.4 Verify the target toast, block toast and completion copy in the browser, including reduced motion and a 375 px viewport.

## Workflow follow-up

- Archive the change after the project's review requirements are satisfied and the in-flight `refine-practice-and-tools-experience` and `redesign-tools-and-recording-ui` changes have been archived first.
- Verify the archived specs describe the chart, the scale without emojis, the completed free practice, the session target, the tools rows and the tuner start.
