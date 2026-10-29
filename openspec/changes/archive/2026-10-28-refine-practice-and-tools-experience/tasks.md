# Tasks

## 1. Flujo de práctica

- [x] 1.1 Extract the `choose | review | practise` machine into a pure `src/utils/practice-flow.ts` with tests for every transition; verify a routine moves to review, the back action returns to choose and quick practice starts without review.
- [x] 1.2 Rework `PracticeWorkspace` around that machine: saved routines as the primary list, quick practice and the routine editor as secondary actions, and one primary action per state; verify the screen shows a single primary button in each state.
- [x] 1.3 Build the review state on top of `PracticePlanTable` with name, blocks, total time, guitar type, a primary start and a back link; verify the started session receives exactly the reviewed blocks.
- [x] 1.4 Keep the builder reachable as a secondary path from the choosing state and after reviewing; verify saving a routine from there returns to the flow without losing the current step.

## 2. Cierre de práctica, mood y focus

- [x] 2.1 Add optional `mood` and `focus` (1–5) to `SessionRecord` and create `src/utils/practice-metrics.ts` with the scale, labels, averages and trend; verify Node tests cover clamping, average with missing values and trend direction.
- [x] 2.2 Add `src/services/practice-feedback-preference.ts` and its hook with both toggles off by default and independent; verify tests cover reading, saving and ignored invalid values.
- [x] 2.3 Add the two toggles to `SettingsView` with copy in both languages; verify the state persists after reload and that leaving both off never shows the questions.
- [x] 2.4 Redesign `PracticeCompletionDialog` as the compact sheet: summary first, notes behind a disclosure, emoji scales for the enabled metrics, routine update offer and one primary save; verify saving with and without metrics stores the expected session.
- [x] 2.5 Add the emoji scale component with keyboard support and an accessible group label; verify arrow keys and click select the same value and that it can stay unanswered.
- [x] 2.6 Show mood and focus in `PracticeSessionDetails` when present and nothing when absent; verify the day detail of a session with and without metrics.
- [x] 2.7 Add the mood/focus summary to the dashboard for the selected period with averages, trend and sample count; verify tests for the period calculation and the empty state when only one metric has data.

## 3. Grabadora tipo pletina

- [x] 3.1 Create `src/utils/recording-waveform.ts` additions for the rolling history buffer and for peaks from decoded audio; verify Node tests cover buffer order, bucket count and the decode fallback.
- [x] 3.2 Build the framed waveform display: rolling right-to-left drawing while recording, static full waveform after stopping and no continuous animation under reduced motion; verify by recording, stopping and reloading the take.
- [x] 3.3 Replace the single recorder button with the transport row (record, stop, play, pause, rewind, forward) wired to the recorder and player states; verify each control is disabled when it cannot act and keeps an accessible name.
- [x] 3.4 Extend `PracticeAudioPlayer` with the take waveform, a playhead and a ±5 s seek step used by rewind and forward; verify playback position and waveform stay in sync.

## 4. Herramientas

- [x] 4.1 Create the `/tools` section with an accessible tab selector, move the metronome into its first panel, rename the navigation entry to Herramientas and redirect `/metronome` to `/tools`; verify old links land on the section and only one tool is visible.
- [x] 4.2 Create the tuner: pure detection and preset utilities in `src/utils/tuner.ts`, microphone lifecycle in a hook, and a panel with detected note, cents, in-tune state, preset and A4 reference; verify tests for detection and presets and that switching tools releases the microphone.
- [x] 4.3 Create the tone generator with frequency in Hz, equivalent note, level and start/stop; verify the tone follows frequency changes, stops when leaving the panel and does not touch the metronome.
- [x] 4.4 Create the delay calculator from a pure BPM → milliseconds utility with whole, dotted and triplet divisions; verify Node tests for known tempos, two-decimal rounding and invalid ranges, plus the panel showing them live.
- [x] 4.5 Add all tools copy to both dictionaries and the section header; verify no literal text is left in the components and switching the language updates every panel.

## 5. Ultrawide

- [x] 5.1 Widen `PageShell` once to 96 rem at the ultrawide breakpoint and keep the gutters; verify at 2560 px that the column measures 1536 px, stays centred and every screen keeps the same left edge.

## 6. Movimiento y confirmaciones

- [x] 6.1 Add the shared motion styles for the backdrop and panel to `ModalDialog`, `PortalModal` and `ConfirmDialog`, with an exit shorter than the entrance and a no-motion variant; verify opening and closing a confirm dialog and with reduced motion enabled.
- [x] 6.2 Add the deferred-close hook and adopt it in the hand-written dialogs (completion, finish practice, manual practice, lick editor and pickers) so Escape, backdrop and buttons all run through the exit; verify focus and Escape still work immediately.
- [x] 6.3 Confirm routine saves in `PracticePlanBuilder` with a `role="status"` message that names the routine, an update variant, a three-second clear and an error path; verify both save modes and a forced failure.

## 7. Verificación

- [x] 7.1 Run `npm run typecheck`, `npm test` and `npm run build`; verify all three exit zero.
- [x] 7.2 Walk the practice flow on a phone and on desktop: choose → review → back, choose → review → start, quick practice; verify the plan reviewed matches the session started.
- [x] 7.3 Walk the completion sheet with both metrics off, only one on and both on; verify the answers persist, skip works and the dashboard and day detail reflect only answered sessions.
- [x] 7.4 Record, stop, play and seek a take; verify the waveform scrolls during recording, stays complete after stopping and the transport states match, including reduced motion.
- [x] 7.5 Use every tool: tuner with and without microphone permission, tone generator start/stop, calculator values; verify audio stops when switching tools or leaving the section.
- [x] 7.6 Verify overlays across the app open and close with the transition, and that no screen shifts its margins at 2560 px.

## Workflow follow-up

- Archive `fix-mobile-shell-and-manual-practice` before archiving this change, so `openspec/specs/app-layout/spec.md` exists when the ultrawide delta is applied.
