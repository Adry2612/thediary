# Design

## Context

See `proposal.md` for the motivation. The relevant current state:

- `PAGE_COLUMN_CLASSES` in `src/components/ui/PageShell.tsx` is the single column used by both page content and `SiteNavigation`: `max-w-7xl` until the `2xl` breakpoint, then `2xl:max-w-[96rem]`. The header and the content therefore stop at the same width.
- The dashboard's `PracticeWellbeing` receives a month-only `PracticeWellbeingSummary` from `getPracticeWellbeing` and renders one emoji per metric. `PracticeMetricScale` is a five-card emoji carousel, and `PracticeSessionDetails` repeats the emoji.
- `usePracticeTimer` has no notion of a session-level target. `TimerCard` hides its settings button entirely for count-up sessions (`!isCountUp`).
- A quick repertoire practice is launched automatically by `useRequestedLaunch` as soon as the stores hydrate. `createQuickRepertoirePlan` copies `item.guitarType` or leaves it unset; no confirmation is shown.
- Count-up sessions never satisfy `synchronizePracticeTimer`'s `completed` condition, so `PracticeSession.saveCompletedSession` stores `completed: false`, and `PracticeSessionDetails` hard-codes "Finalizada antes de completar la rutina".
- `PracticeTimeChart` already defines the period vocabulary (`week | month | year`) and the month/week/year bucket boundaries, but those bucket builders are private to `practice-analytics.ts`.
- `ToolsView` already renders the four tools as a vertical `space-y-5` stack of `ToolSection` rows. The main `practice-tools` spec still says "one tool at a time with an accessible selector", which contradicts the page and the unarchived `redesign-tools-and-recording-ui` delta.
- `useTuner` creates its `AudioContext` after `getUserMedia` without resuming it, and only accepts `window.AudioContext` (no `webkitAudioContext`). On browsers that start the context suspended, the analyser never receives audio and the panel stays at "no signal" with no error.

Constraints: no new dependency; no change to the persisted session schema or cloud sync; all user-facing copy goes through `src/i18n`.

## Goals / Non-Goals

**Goals:**

- Widen only the header/navigation column on ultrawide screens, progressively and with a hard cap, leaving page content untouched.
- Replace the month/emoji wellbeing summary with a period-based time chart whose buckets match the existing rhythm chart.
- Remove emoji characters from the wellbeing capture and display surfaces while keeping the five-level scale.
- Store count-up practices as completed and stop labelling them as interrupted.
- Add a pre-start confirmation for quick repertoire practices with a required guitar type and an optional session target.
- Add an optional session time target that pauses and alerts exactly at the target, available during planned and free practices.
- Keep the tools page as a single column of full-width rows, never a two-column grid.
- Make the tuner start reliably in browsers whose audio context is suspended or prefixed, and fail visibly instead of silently.
- Replace the persistent target and block-complete panels with brief toasts, and neutralise the completion summary copy.

**Non-Goals:**

- No change to the saved `SessionRecord` shape or to sync/merge behaviour.
- No migration of historical sessions that were stored with `completed: false`.
- No target persistence between sessions, notifications outside the open tab, or background timers.
- No redesign of the rhythm, skill, guitar or tempo charts.

## Decisions

### 1. A dedicated header column that grows after the content cap

Add `HEADER_COLUMN_CLASSES` beside `PAGE_COLUMN_CLASSES` in `PageShell.tsx`:

- Below `2xl`: `max-w-7xl`, identical to the content column, so header and content stay aligned.
- At `2xl` and above: `max-w-[max(96rem,min(120rem,88vw))]`.

This keeps the header at the content width until the viewport is wide enough for 88 vw to exceed 96 rem (about 1745 px), then grows it smoothly up to 120 rem (1920 px) while always leaving at least 12 vw of breathing room. `SiteNavigation` uses the new constant for the desktop nav, the mobile section label and the mobile menu panel; `PageShell` keeps its current constant, so pages do not widen.

Alternative considered: widening the shared column. Rejected because it would stretch reading lines and contradict `app-layout`'s cap.

### 2. One bucket vocabulary shared by both dashboard charts

Extract the private bucket-range builders of `practice-analytics.ts` into an exported helper, e.g. `getPracticeChartRanges(period, today): { label, startDate, endDate }[]`, keeping the current boundaries: seven days for the week, calendar weeks clipped to the month for the month, twelve months for the year. `getPracticeTimeBuckets` uses it unchanged, and the new wellbeing series uses the same ranges.

`practice-metrics.ts` gains:

- `getPracticeWellbeingSeries(sessions, period, today)`: for each range, the average and answer count of mood and focus, or `null` when the range has no answers. Gaps stay `null`, never `0`.
- `getPracticeWellbeingSummary(sessions, period, today)`: current-period average and count plus the previous equivalent period's average, reusing `getPracticeMetricSummary`. The previous ranges come from the same helper (`today - 7 days`, previous calendar month, previous calendar year).
- `hasPracticeWellbeingData(sessions)`: whether the history contains at least one mood or focus value, used to decide whether the card exists at all.

`getPracticeWellbeing` (month-only) is replaced by these functions; its tests are rewritten. `PracticeChartPeriod` is imported from `practice-analytics`.

### 3. Chart rendering and accessibility

Rewrite `PracticeWellbeing` as `PracticeWellbeing` (same file) receiving `history` and `today`. It owns a period selector mirroring the rhythm card's control and renders:

- Summary row: for each metric, its average, trend label, change and answer count, or an empty state.
- SVG line chart with a fixed 1–5 y-axis and one point per bucket. Each series is a `polyline` broken at gaps plus visible markers (circle for mood, diamond for focus), a colour and a text legend, so colour is not the only distinction.
- Categories derived from the shared ranges: weekday + day for the week, week range for the month, month abbreviation for the year. Reuse the same labels as the rhythm chart.
- One transparent focusable/hoverable column per bucket that sets a selected bucket; a compact detail row below the chart shows the bucket label, both averages and the number of answers. This avoids a floating tooltip and keeps the detail readable on touch.
- A visually hidden table with one row per bucket and the two values, linked from the figure's accessible name, so screen readers get the whole series. The chart exposes no colour-only information.

If the whole history has no wellbeing data the card is not rendered, matching today's behaviour. If only the selected period is empty, the card stays with its selector and an empty state.

### 4. Scale without emojis

Delete `PRACTICE_METRIC_EMOJIS` from `practice-metrics.ts`. Keep `PRACTICE_METRIC_VALUES` and `getPracticeMetricLabelKey`.

`PracticeMetricScale` keeps its carousel interaction, keyboard handling and clear action, but replaces the emoji glyph with the large number (`1`–`5`) and keeps the existing textual label under it. The radio's accessible name becomes `<metric label>: <number>, <label>` (the question already names the group). The hint and the two settings descriptions stop saying "five emojis".

`PracticeSessionDetails` drops the emoji span and renders the metric title, the textual label and `n/5` (for example "Ánimo · Bien · 4/5"). `PracticeWellbeing` no longer formats an average into an emoji.

### 5. Count-up practices are complete when the user ends them

`createPracticeSessionRecord` accepts an optional `completed` override. `PracticeSession.saveCompletedSession` passes `completed: session.isCountUp ? true : pendingResult.completed`.

Rationale: `completed` already means "the practice is considered complete", not "the last planned block ended". A free practice has no planned total to fall short of. Planned sessions keep the timer's result, so an early exit still stores `false`.

`PracticeSessionDetails` moves its three hard-coded status strings to the `practice` dictionary section (`statusRegistered`, `statusCompleted`, `statusFinishedEarly`) so the fix also applies in English. Historical sessions stored with `completed: false` keep their current value; the UI wording now comes from the catalog.

### 6. Pre-start dialog for a quick repertoire practice

`useRequestedLaunch` stops launching the quick repertoire plan itself. It returns the matched item as `pendingQuickRepertoire` (after marking the URL request as handled) so the URL is not processed twice. `PracticeWorkspace` renders a new `FreePracticeStartDialog` when that value is set:

- Item title and artist.
- Required `ToggleGroup` for electric/acoustic, preselected from `item.guitarType ?? lastGuitarType`; "start" stays disabled until one is selected.
- Optional whole-minute target with an on/off control; off by default.
- Cancel clears the pending item and replaces the URL with `/practice`; start calls `rememberGuitarType` and launches.

`createQuickRepertoirePlan(item, options?)` accepts `{ guitarType?, targetMinutes? }`. Without options it keeps its current inheritance behaviour, so existing callers and tests remain valid. `PracticeLaunchSession` and `ActivePracticeSession` gain `targetMinutes?: number`.

The dialog is a `ModalDialog` with the same dismissal/motion hooks as the other dialogs. It is not a review step for the blocks: the plan is still a single free block.

### 7. Session target in the timer

Add `targetMinutes?: number` to `ActivePracticeSession` with `setTargetMinutes(value: number | null)`; normalize it on hydration to a positive integer. It lives only for the active session; `createPracticeSessionRecord` does not copy it.

`usePracticeTimer(..., targetSeconds?)`:

- Exposes `isTargetReached` and `resume` clears it.
- `synchronizePracticeTimer` receives an optional `limitMs`. It consumes only the time remaining until the limit, so elapsed, phase and skill totals stop exactly at the target. When the limit is reached it returns `targetReached: true` and pauses instead of continuing.
- The hook plays the end sound once on the rising edge of `targetReached`, records the fired target in a ref, and never fires it again for the same target after a resume. A new target resets the ref.
- If a new target is set at or below the elapsed time, an effect pauses the timer and shows the notice immediately.
- If the target and the final block end in the same tick, normal completion wins and the completion dialog opens.

`TimerCard` gains a target section in the settings dialog: an on/off control plus a whole-minute input. The settings button is shown for count-up sessions too; the flow subsection (auto-advance/continue after block) stays hidden for count-up. A target notice appears near the timer with the reached time and a "Continuar" action that resumes and clears it; the existing finish button stays available. `PracticeWorkspace` passes `session.targetMinutes` to `PracticeSession`, which passes the seconds to the hook.

Alternative considered: auto-finishing at the target. Rejected by the chosen behaviour: the user asked to be warned and decide.

### 8. Herramientas as a responsive grid

`ToolsView` lays the tools out in a grid: one column below `xl`, two columns from 1280 px. The metronome pairs with the tuner and the tone generator with the delay calculator; the string block spans both columns because it is a list of rows, not a panel. `items-stretch` keeps the two cards of a row at the same height, so the borders align even when one panel is shorter. The tab selector does not return.

The page maxes out at 1536 px, so each column is 726 px at the widest: enough for the tuner gauge and for the calculator's four-column table, which was the reason the earlier single-column layout existed. Measured at 1280 and 1536 px, no section overflows horizontally.

- Alternative considered: full-width rows at every breakpoint. Rejected on review: on a 1536 px screen it left most of the page empty below the fold.
- Alternative considered: masonry or a 2-column layout at medium sizes. Rejected: the calculator table and the tuner gauge need the width.
- Alternative considered: restoring the tab selector. Rejected: it hides tools and adds a second navigation model to one page.

### 9. Tuner start that actually reaches the analyser

`useTuner` keeps the existing detection loop and `detectPitch` math, but fixes the audio start:

1. Resolve the constructor as `window.AudioContext ?? window.webkitAudioContext`, matching the metronome and recording code.
2. Create the context and `await context.resume()` before marking the tuner as listening. `getUserMedia` is awaited first, so the context can be created outside the original user activation; resuming explicitly is what makes it run.
3. Connect `source -> analyser -> zero-gain gain -> destination`, so browsers that only process graphs reaching the destination still pull audio through the analyser while nothing is played back.
4. If the context is still not `running` after the resume attempt, set the `failed` error and leave the tuner stopped. `TunerPanel` already renders that error; add the specific copy if the current text does not explain it.
5. On stop, cancel the frame, stop the tracks, disconnect the nodes and close the context.

The note/cents display, presets, A4 reference and target chips are unchanged.

- Alternative considered: only adding `webkitAudioContext`. It fixes older Safari but not the suspended context on modern mobile browsers.
- Alternative considered: starting the tuner automatically on mount. It would request the microphone without a clear user action and break the "ask only when started" requirement.

### 10. Timer notices as brief toasts

A new presentational `Toast` renders a fixed, non-interactive `role="status"` message that dismisses itself after about five seconds. `TimerCard` owns one toast message and picks the target message first, then the block message; the message state is cleared when the corresponding timer state clears. The target and block panels are removed from the card.

The timer state itself remains unchanged: the target still pauses the timer, and the block waiting state still changes the primary action to "Bloque terminado/Continuar" and keeps the next-block action available. That persistent affordance is what tells the user what to do after the toast has gone.

The completion dialog keeps its save flow but changes its heading to a neutral "Resumen de la sesión" and its primary copy to "Revisa y guarda"; a completed routine still reads "Rutina completada". No toast replaces the dialog because the dialog collects notes, metrics and the save action.

- Alternative considered: a modal for the target. Rejected: it interrupts the practice and the user asked for something that disappears.
- Alternative considered: a persistent inline notice. Rejected: it is the current behaviour the user dislikes.

### 11. Copy and tests

New strings go to `es.ts`, `en.ts` and the `Dict` type in `dictionary.ts`: chart legend/aria/empty states/detail, status labels, dialog copy, target settings and notice, and updated settings descriptions. No emoji characters remain in the wellbeing copy.

Tests (Node, utilities only):

- `practice-metrics.test.mjs`: series gaps, per-bucket averages, period summary and previous-period comparison for week/month/year; remove the emoji assertion.
- `practice-timer.test.mjs`: target clamp, single alert, resume without repeat, simultaneous completion.
- `practice-session-record.test.mjs`: free session stores `completed: true`; planned early exit keeps `false`.
- `practice-launch.test.mjs`: quick repertoire plan overrides and unchanged inheritance without options.
- `practice-session-details.test.mjs` / a small status helper test: free session no longer reports an early finish.
- `tuner.test.mjs`: the existing pitch-detection coverage stays green; the audio start itself is verified manually with a microphone because Node has no Web Audio or `getUserMedia`.

## Risks / Trade-offs

- **Header wider than content looks misaligned** → below `2xl` both columns are identical; above it the contrast is intentional and the header still uses the same gutters, so it reads as a wider navigation bar, not a broken grid.
- **Month series bucket mismatch with the rhythm chart** → both charts consume the same exported range helper, preventing drift.
- **Target overshoot between 250 ms ticks** → the limit is applied inside `synchronizePracticeTimer`, not after the fact, so stored elapsed time does not exceed the target.
- **Target alert can be missed if the tab is backgrounded** → the timer already pauses on the next tick when the tab resumes; no background notification is promised in the specs.
- **Forcing a guitar choice adds friction** → the dialog preselects the item's type or the last used one, so confirming is one tap in the common case.
- **Old free practices remain marked as early** → no reliable stored marker distinguishes them from genuinely interrupted planned practices, so they are left untouched; only new practices get the corrected state.
- **Tools page regresses to a two-column grid** → the spec now states rows explicitly and the integration check inspects the page at 768/1536/3440 px.
- **Autoplay policy keeps the audio context suspended** → resume is awaited before the listening state, and a context that still is not running becomes a visible error instead of a silent idle tuner.
- **Microphone requires a secure context** → the tuner keeps its existing unsupported/permission messages; local testing must use `localhost` or HTTPS.
- **Overlap with the unarchived `refine-practice-and-tools-experience` and `redesign-tools-and-recording-ui`** → they introduced the emoji wellbeing cards and the tools page. Archive them before this one, or apply this delta after them, so the final spec describes the chart without emojis and the row layout.

## Migration Plan

No data migration. The active-session localStorage key gains an optional `targetMinutes`; unknown or invalid values are discarded on read, and older entries load unchanged. Saved sessions, sync payloads and backups are untouched. Rollback is a code revert: the extra active-session field is ignored by older builds.

## Open Questions

None.
