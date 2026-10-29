# Design

## Context

See `proposal.md` for motivation and the delta specs for behavior.

Current state that shapes the approach:

- `PracticeWorkspace` renders the page header, two primary buttons (“Crear práctica” and “Práctica rápida”), an explanatory paragraph, `SavedPracticeRoutines` and, in the same column, `PracticePlanBuilder`. There is no separate review step: starting a routine calls `setActiveSession` directly.
- `ActivePracticeSessionHost` renders `PracticeSession` globally; the running timer owns its own container and the floating bar.
- `PracticeCompletionDialog` is a native `<dialog>` with summary, session notes, per-block notes, the routine-update checkbox and two buttons; `FinishPracticeDialog` covers the early finish.
- `PracticeAudioRecorder` is a form: title field, one button to start/stop and a 32-bar live level canvas (`PracticeRecordingWaveform`). Saved takes are rendered by `PracticeRecordingItem` with `PracticeAudioPlayer` (play/pause/volume, no seek).
- The metronome lives at `/metronome` with `MetronomeCard`, `MetronomeSettings` and a global `MetronomeProvider`; audio scheduling lives in `services/metronome-audio*`.
- Modals use `ModalDialog` / `PortalModal` plus several hand-written `<dialog>` elements. There is no shared enter or exit transition.
- `SessionRecord` has optional `guitarType`, `notes`, `averageBpm` and per-phase fields, and persistence tolerates absent optional fields.
- Preferences that belong to the device (guitar type) are stored in `localStorage` through `services/guitar-preference.ts`.
- `PageShell` (added in `fix-mobile-shell-and-manual-practice`) fixes the column at `max-w-7xl` (1280 px).

## Goals / Non-Goals

**Goals:**

- A practice flow that always answers “what do I do next?” with one primary action.
- End-of-practice capture of notes plus optional mood/focus with the least input possible.
- A recorder that reads as hardware and shows its waveform inside a frame.
- One tools section that reuses the existing metronome instead of duplicating it.
- Consistent, restrained motion for every overlay.
- A page column that uses ultrawide space without stretching text.

**Non-Goals:**

- A circle of fifths, audio editing or multi-track recording.
- New dashboard periods, exports or analytics APIs.
- Replacing the metronome scheduler or the audio session service.
- Restyling screens outside the flow, tools, recorder and overlays.

## Decisions

### D1. Practice flow as an explicit three-state machine

`PracticeWorkspace` becomes a small state machine (`choose | review | practise`) driven by a hook, with the builder as a secondary state reachable from `choose`. `choose` keeps the saved routines as the primary list, quick practice as a secondary button and “crear rutina” as a tertiary action. `review` renders the existing `PracticePlanTable` with name, total time and guitar type, plus a single primary “Empezar” and a back link. `practise` delegates to the existing `ActivePracticeSessionHost`.

- Alternative considered: keep the builder and add a confirmation dialog. It hides the plan behind a modal and keeps two primary actions on the first screen.
- Alternative considered: separate routes (`/practice/review`). It adds navigation state and browser-back edge cases for a flow that never leaves the screen.

### D2. The reviewed plan is the started plan

The review step holds a `PracticeLaunchPlan` copy; starting it passes that exact object to the session store, so what the user reviewed cannot change silently. Quick practice skips review by design.

### D3. Completion sheet: summary, collapsed notes, metrics

`PracticeCompletionDialog` is reordered around a summary block (time, blocks, skill split), a collapsed “Añadir notas” disclosure that reveals session notes and per-block notes, the emoji scales when enabled, the existing routine-update offer, and one primary save button with the discard action as a secondary link. It keeps the native `<dialog>` and the same save payload, extended with the metrics.

- Alternative considered: a multi-step wizard. Two taps to save is worse than one collapsed section.

### D4. Mood and focus as optional session fields

`SessionRecord` gains `mood?: 1..5` and `focus?: 1..5`; no migration is needed because both are optional and persistence already tolerates absent fields. A new `services/practice-feedback-preference.ts` stores the two toggles (`false` by default) following the guitar preference pattern, exposed through `usePracticeFeedbackPreference`. A pure `utils/practice-metrics.ts` owns the scale (labels, emoji, clamp), the average and the trend, so the dashboard and the tests share one definition. The capture asks retrospectively about the start of the practice, one row per enabled metric, and saving without a value leaves it empty.

`PracticeSessionDetails` shows the two values per session when present. `DashboardView` gains one paired card group with the average and trend for the selected period, reusing the existing insight-card layout.

- Alternative considered: ask at the start and at the end. It interrupts the practice and doubles the input.
- Alternative considered: a free 1–10 slider. The five emoji scale is faster and matches the reference the user gave.

### D5. Recorder as a deck with a scrolling frame

The frame becomes a dedicated component: a rounded display with a canvas that keeps a rolling buffer of levels, drawn right to left while recording, plus the transport underneath. State is derived from the recorder hook: `idle`, `recording`, `saving`, `ready`, `playing`, `paused`. The transport maps to: record (start), stop (stop and save), play/pause (take playback), rewind/forward (±5 s). Saved takes get their waveform by decoding the stored blob once (peaks cached in memory); if decoding fails, the take keeps a neutral bar. `PracticeAudioPlayer` gains an optional waveform and seek step so playback can render a playhead.

- Alternative considered: keep the live bars and only reframe them. It does not answer the “over time” part of the request.
- Alternative considered: persist peaks with each recording. It changes the stored recording shape and cloud sync for a visual detail.

### D6. Tools section with local tab state

`/tools` renders a tablist (Metrónomo, Afinador, Tonos, Calculadora) with one panel at a time; the metronome tab reuses `MetronomeCard variant="large"`. `/metronome` becomes a server redirect to `/tools` and the navigation entry changes to Herramientas. The tuner runs pitch detection (autocorrelation over the time-domain buffer) in `utils/tuner.ts`, with the microphone lifecycle in `hooks/useTuner.ts`; presets and the A4 reference live in pure data. The tone generator uses its own audio context and stops on unmount and on tab change. The calculator is a pure `utils/delay-calculator.ts` (BPM → beat ms, divisions, dotted, triplet) covered by Node tests.

- Alternative considered: keep `/metronome` and add the tools as separate routes. It scatters related tools and keeps a misleading navigation label.
- Alternative considered: one long scrolling page with all tools. It hides the microphone permission and audio state of inactive tools.

### D7. One ultrawide step in the shell

`PageShell` adds `2xl:max-w-[96rem]`, so at 1536 px and above the column widens to 1536 px and stops. No per-screen overrides.

### D8. Shared overlay motion with deferrable close

`ModalDialog` and `PortalModal` gain a shared motion layer: backdrop fade plus panel fade/rise/scale (enter ~180 ms, exit ~120 ms). For native dialogs, `onCancel` and the close handlers go through a small `useDialogMotion` hook that sets a closing state, waits for the exit, then calls `close()`. `@starting-style` + `transition-behavior: allow-discrete` cover the enter animation where supported; the deferred close covers the exit. `prefers-reduced-motion` removes durations entirely. Focus behavior and Escape are untouched.

- Alternative considered: animate only with CSS on `dialog[open]`. Native `close()` removes the element from the top layer immediately, so the exit never shows.
- Alternative considered: a dependency such as Radix or Framer Motion. The app already solves its motion with CSS and presence hooks; adding a library for two transitions is not justified.

### D9. Routine save confirmation as an inline status

`PracticePlanBuilder` shows a `role="status"` line next to the save actions on success and a `role="alert"` error on failure, clearing the success after ~3 s without shifting the buttons. No toast system.

## Risks / Trade-offs

- **The review step adds a tap to start a routine** → Keep “Empezar” as the only primary action and show the plan instantly; quick practice still starts in one tap.
- **Tuner accuracy in noisy rooms** → Clamp the detection window to guitar range, smooth across frames and show “sin señal” instead of a wrong note; pure functions are tested with synthetic buffers.
- **Audio contexts multiplying** → One context per tool, stopped on unmount and on tab change; the metronome keeps its provider.
- **Peaks computed per take can cost on long recordings** → Decode once, cache by recording id, and cap the bucket count; fall back to a plain level bar if decoding fails.
- **Native dialog exit support differs** → Deferred close with a timeout works everywhere; unsupported browsers simply show a shorter or no exit.
- **Optional metrics can bias the dashboard** → Averages only include sessions that answered, and the card states the sample count.
- **`app-layout` exists only in the pending `fix-mobile-shell-and-manual-practice` delta** → That change must be archived before this one so the main spec exists; the implementation itself only touches `PageShell`, already present in the worktree.

## Migration Plan

No data migration: `mood` and `focus` are optional fields, preferences default to off, and stored sessions untouched. Rolling back is a revert; recordings keep their current storage shape.

## Open Questions

None.
