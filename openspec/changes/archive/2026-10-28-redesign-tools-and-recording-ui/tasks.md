# Tasks

## 1. Herramientas en una sola página

- [x] 1.1 Create a shared `ToolSection` frame with anchor id, eyebrow, title, description and an optional status/action slot; verify four sections render with their own heading and that no element has `role="tablist"`.
- [x] 1.2 Refactor `ToolsView` into a stacked page of four blocks and add the `block` variant to `MetronomeCard`; verify all four tools are present at once, only one page scrolls and `/metronome` still redirects to `/tools`.
- [x] 1.3 Redesign `TunerPanel` with the large note readout, the ±50-cent SVG arc and the string targets, keeping preset, A4 and start/stop; verify the gauge label, live region and in-tune/below/above states in a browser.
- [x] 1.4 Redesign `ToneGeneratorPanel` with the frequency as the large number, the equivalent note and level below, and working ± steppers; verify the tone follows frequency and level changes and stops on unmount.
- [x] 1.5 Redesign `DelayCalculatorPanel` with the BPM as the large number, the beat below and the divisions table under it; verify known values, live updates and horizontal scrolling on a phone.
- [x] 1.6 Add the new tools copy to both dictionaries and replace remaining literals in the blocks; verify the language switch updates every block and no component keeps hard-coded Spanish.

## 2. Grabadora y grabaciones guardadas

- [x] 2.1 Move the recorder transport into the recording-name row, wrapping under the field on narrow viewports; verify the row at desktop and phone widths and that each control keeps its disabled state and accessible name.
- [x] 2.2 Build `PracticeWaveformSeeker` as a presentational-plus-interaction wrapper with pointer drag, slider ARIA and keyboard steps, and add `seekToRatio` to `usePracticeAudioPlayer`; verify unit tests for ratio→seconds and clamping plus keyboard seeking in a browser.
- [x] 2.3 Use the seeker in `PracticeAudioPlayer` when peaks exist, remove the separate progress slider for that take and keep it as a fallback when peaks are missing; verify tap, drag, arrow keys, time labels and the playhead.
- [x] 2.4 Update the saved-recording card around the new player and keep sync/delete actions intact; verify a saved take plays, seeks on the wave and still exposes its synchronization options.

## 3. Mood y foco al cerrar

- [x] 3.1 Add `refresh` and the `storage` listener to `usePracticeFeedbackPreference` and read the preference when the completion sheet opens; verify enabling or disabling a metric during a running practice changes the questions without reloading.

## 4. Verificación

- [x] 4.1 Run `npm run typecheck`, `npm test` and `npm run build`; verify all three exit zero.
- [x] 4.2 Walk `/tools` on desktop and phone: verify no tabs, four differentiated blocks, tuner gauge with and without microphone permission, tone start/stop and calculator values.
- [x] 4.3 Walk the recorder on desktop and phone: verify the transport beside the name, recording/stopping, playback, waveform click/drag/keyboard seek and the saved-recording card.
- [x] 4.4 Walk the feedback preference flows and check reduced motion and a 2560 px viewport; verify no animation regressions and no layout shift.

## Workflow follow-up

- Push notifications are a separate change; keep them out of this one.
- Archive `fix-mobile-shell-and-manual-practice` and then `refine-practice-and-tools-experience` before archiving this change, so the pending `practice-session-management` requirements land in the main spec first.
- `openspec/specs/practice-tools/spec.md` was synced from `refine-practice-and-tools-experience` to unblock the `MODIFIED` delta in this change.
