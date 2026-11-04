# Tasks

## 1. Floating bar shows one overtime value

- [x] 1.1 Render either the countdown or the overtime in the floating bar, never both: with overtime above zero show only the green `+mm:ss`, and without overtime keep the normal `0:00` or remaining time; verify in the browser with a block that runs past zero and with the option off.
- [x] 1.2 Keep the bar's visibility, finish button and current-block name unchanged; verify by scrolling the timer card out of view during overtime.
- [x] 1.3 Update the floating-bar section of `docs/practice.md`; verify the documented behaviour matches the built bar.

## 2. Remove the in-app reminder row

- [x] 2.1 Remove `ReminderRow` from the start screen and delete its component, `useInAppReminder`, and the strings, styles and tests that exist only for it; verify the start screen renders without a reminder row and `npm test` passes.
- [x] 2.2 Trim the open `add-practice-reminders` change so it no longer promises the home row: drop its `home-overview` delta, the in-app parts of its design and the related tasks, and adjust its proposal; verify `openspec validate add-practice-reminders --strict` passes and a search for the removed row finds nothing in that change.
- [x] 2.3 Confirm push delivery, preferences and the service worker are untouched; verify the existing reminder tests still pass and `docs/push-reminders.md` explains that reminders are notifications only.

## 3. Equal weekday cards

- [x] 3.1 Make the weekly routine planner's seven cards share one track size, full-height layout, fixed label line and full-width select; verify at 390 px, 768 px and 1280 px with all days assigned, some empty and one long routine name.
- [x] 3.2 Verify long names truncate inside the select without widening the card and that the narrower layout has no horizontal overflow.
- [x] 3.3 Document the equal-size behaviour in `docs/practice.md` under "Rutina por día"; verify the description matches the screen.

## 4. Chart motion

- [x] 4.1 Add the chart entrance keyframes and the reduced-motion opt-out to `src/app/globals.css`; verify with the browser's reduced-motion emulation that no animation runs.
- [x] 4.2 Animate the rhythm bars with `scaleY` from the baseline, a capped stagger and a key tied to the selected period; verify the bars animate once on load, replay on a period change, and do not replay on hover, focus or an unrelated re-render.
- [x] 4.3 Animate the skill-balance bars with `scaleX` from the left without changing their layout width; verify the surrounding labels do not move.
- [x] 4.4 Animate the heatmap cells with opacity and a small scale, keyed by the visible month, and the annual calendar as a single grid fade keyed by the visible year so hundreds of cells are not animated one by one; verify a month or year change replays once and an empty month or year shows its state without motion.
- [x] 4.5 Verify the animation stays within 500 ms, the last element starts within 250 ms and no chart reads layout during the animation; record the timings in the change notes.
- [x] 4.6 Create `docs/dashboard.md` with the chart motion rules and the reduced-motion behaviour; verify the description matches the built charts.

## 5. Integration

- [x] 5.1 Run `npm test`, `npm run typecheck` and `npm run build`; verify all three finish green.
- [x] 5.2 Re-check the start screen, the weekly planner and the evolution screen together on a phone viewport; verify no row, card or chart overflows.

## Workflow follow-up

- Trim `add-practice-reminders` before archiving either change so the two changes never disagree about the home row.
- Archive the change after the project's review requirements are satisfied.
- Verify the archived result.
