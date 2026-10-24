# Tasks

## 1. Annual calendar hover stability

- [x] 1.1 Add a pending-switch timer to `src/hooks/usePracticeDayTooltip.ts` with `HOVER_INTENT_MS = 180`: keep `showTooltip` immediate, add `scheduleTooltip` for switches, and cancel both pending switch and hide when the card is entered or the tooltip is hidden. Verify with `npx tsc --noEmit`.
- [x] 1.2 Wire `YearPracticeCalendar.tsx` to use `scheduleTooltip` on cell `onMouseEnter`, `showTooltip` on focus, and move the hide boundary from each cell to the grid wrapper's `onMouseLeave`; keep the card-enter/leave handlers. Verify with `npx tsc --noEmit`.
- [x] 1.3 Verify in the browser at 1280 px: hover a practised day, move slowly to the card across neighbouring cells, and confirm the date does not change; dwell on another day and confirm it switches; scroll the page, resize and press Escape to confirm dismissal; focus a day with Tab and confirm it opens immediately.
- [x] 1.4 Verify a day without practice still opens its empty summary from the annual calendar and that the weekly summary's hover behavior is unchanged.

## 2. Skill balance floating card

- [x] 2.1 Create `src/utils/skill-summary-tooltip.ts` with `getSkillSummaryPosition(anchor, viewport)` that picks right/left/below/above, centres on the trigger, clamps to a 12 px margin and handles a viewport smaller than the 224 × 104 card. Add `tests/skill-summary-tooltip.test.mjs` covering right, left, below, above, edges and a tiny viewport; verify `node --test tests/skill-summary-tooltip.test.mjs`.
- [x] 2.2 Add `SkillSummaryCard.tsx` (or an equivalent local component) with `role="tooltip"`, the skill name, minutes, percentage, session count and a fixed-position card using `getSkillSummaryPosition`; verify with `npx tsc --noEmit`.
- [x] 2.3 Rewrite `SkillBalance.tsx`: keep the monthly total in the centre at all times, track the hovered/focused trigger element, show the card on arc hover and legend hover/focus, add `aria-describedby` while a legend row is active, and close on section leave, blur, Escape, page scroll and resize. Verify with `npx tsc --noEmit`.
- [x] 2.4 Verify in the browser: hovering an arc, hovering a legend row, moving between rows, keyboard focus, Escape, leaving the card, the centre always showing the month total, and the card staying inside the viewport near the window edges.

## 3. Schedule label layout

- [x] 3.1 Rework `src/components/dashboard/PracticeSchedule.tsx` row layout into a three-column grid with a 5.25 rem label slot, a flexible bar and a 4.5 rem right-aligned value; keep `getBarPercentage`, add `whitespace-nowrap` to labels and keep the empty state rows aligned. Verify with `npx tsc --noEmit`.
- [x] 3.2 Verify in the browser at 320, 768 and 1280 px that "Madrugada", "Mañana", "Tarde" and "Noche" never touch their bars or values, and that rows without practice still show label, empty bar and "—" without overlap.

## 4. Remove the quick-access planner

- [x] 4.1 Delete `src/components/dashboard/SuggestedPractice.tsx`, remove its import and render block from `DashboardView.tsx`, and verify no reference remains with `grep -rn "SuggestedPractice" src tests`.
- [x] 4.2 Remove `directAccess`, `howMuchTime`, `suggestedDescription`, `availableTime` and `startSuggested` from `src/i18n/dictionary.ts`, `src/i18n/es.ts` and `src/i18n/en.ts`; verify `node --test tests/i18n.test.mjs`.
- [x] 4.3 Remove `SUGGESTED_DURATIONS`, `createSuggestedPhases`, the `minutes` search parameter and the suggested-plan ternary from `src/app/(workspace)/practice/page.tsx`, leaving `phases` as the default; verify `npx tsc --noEmit`.
- [x] 4.4 Verify in the browser that `/dashboard` no longer shows the quick-access card or the "¿Cuánto tiempo tienes hoy?" text, that `/practice` opens the usual three-block plan, and that `/practice?minutes=30` opens the same default plan instead of a time-based split.

## 5. Streak flame

- [x] 5.1 Add `STREAK_FIRE_MIN_DAYS = 7` and `isStreakOnFire(streak)` to `src/utils/practice-analytics.ts`; add boundary tests (0, 6, 7, 30) to `tests/practice-analytics.test.mjs` and verify `node --test tests/practice-analytics.test.mjs`.
- [x] 5.2 Extend `src/components/dashboard/MetricCard.tsx` with an optional `highlight?: ReactNode` rendered after the description, without changing the other metrics or the repertoire summary; verify `npx tsc --noEmit`.
- [x] 5.3 Create `src/components/dashboard/StreakFlame.tsx` with a two-path flame (`aria-hidden`), the visible message from `dashboard.streakOnFire`, and the warm accent colour; add `streakOnFire` to the dictionary and both locales and verify `node --test tests/i18n.test.mjs`.
- [x] 5.4 Add the `.streak-flame` keyframes and class to `src/app/globals.css`, including the `prefers-reduced-motion: reduce` override; verify the CSS compiles with `npm run build`.
- [x] 5.5 In `DashboardView.tsx`, compute the streak once, pass it to the metric value, and supply the flame highlight only when `isStreakOnFire(streak)` is true; verify with `npx tsc --noEmit`.
- [x] 5.6 Verify in the browser with a seeded 7-day streak: the flame and message appear, the flame animates with normal motion and stays still with reduced motion emulated, a 6-day streak shows neither, and a screen reader reads the message but not the flame.

## 6. Integration verification

- [x] 6.1 Run `npm test` and confirm zero failures, including the new tooltip-position, analytics and i18n tests.
- [x] 6.2 Run `npx tsc --noEmit` and `npm run build`, and confirm both succeed.
- [x] 6.3 Run `openspec validate refine-practice-dashboard --strict` and confirm the change is valid.
- [x] 6.4 Do a final browser pass at 320/768/1280 px over the whole dashboard: no horizontal overflow, the annual and weekly hover cards work, the skill card and schedule labels behave, and the streak card is the only metric with the flame.

## Workflow follow-up

- Archive `improve-practice-dashboard` before archiving this change, because this delta removes one of its skill-balance requirements.
- Archive this change after implementation review.
