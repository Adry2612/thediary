# Design

## Context

See `proposal.md` for motivation and the delta specs for behavior.

Current state that shapes the approach:

- `ToolsView` is a tablist with local state and renders exactly one panel at a time. `MetronomeCard variant="large"` is capped at `max-w-3xl` and draws its own card; the tuner, tone generator and calculator each draw their own layout without a shared frame.
- `TunerPanel` already has detection, presets, A4 reference, a flat ruler and string chips. `useTuner` owns the microphone lifecycle.
- `ToneGeneratorPanel` uses a normal `TextField`, a level `RangeSlider` and a status pill. `DelayCalculatorPanel` uses a normal `TextField` and a table.
- The dashboard establishes the card language: `rounded-xl border border-line bg-surface p-5`, uppercase eyebrow, clear heading and muted description.
- `PracticeAudioRecorder` currently stacks the name field, the framed display and the transport row. The transport is a separate row below the display.
- `PracticeAudioPlayer` renders a `RangeSlider` plus optional rewind/forward buttons; `PracticeWaveformBars` is presentational (`role="img"`) with an optional playhead.
- `usePracticeAudioPlayer` already exposes `currentTime`, `duration`, `seek` and `seekBy`.
- `usePracticeFeedbackPreference` reads `localStorage` on mount. `PracticeCompletionDialog` mounts with `PracticeSession`, so the value can be stale when the sheet opens.
- There is no service worker or push infrastructure; notifications are intentionally outside this change.

## Goals / Non-Goals

**Goals:**

- One tools page that reads as a set of study blocks, using the dashboard card language.
- A tuner that is legible at a glance and still keyboard/screen-reader usable.
- Big primary numbers for the tone generator and the calculator, with secondary data below.
- A recorder whose transport sits with the recording name, and saved takes that are seeked directly on the wave.
- Feedback preferences applied at the moment the practice closes.

**Non-Goals:**

- Push notifications or a service worker.
- Changing microphone detection, audio scheduling, storage, sync or the recording format.
- New tools, new tuning presets or new delay divisions.
- Reordering or restyling the rest of the practice screen.

## Decisions

### D1. Tools page as a stack of shared blocks

`ToolsView` drops the tablist and renders a vertical stack of four sections. A new `ToolSection` component owns the shared frame: an anchor id, a header with eyebrow, title, description and an optional status/action slot, and a body. Advanced tool state stays inside each tool component, so the page keeps one scroll and every block remains visible.

`MetronomeCard` gains a `block` variant that keeps the large controls but removes its own max width and outer card, so it can live inside `ToolSection` without a card inside a card.

- Alternative considered: keep tabs and add a “show all” mode. Two navigation models for one page and the same hidden-content problem.
- Alternative considered: a dashboard-style two-column grid. The tone generator and calculator need horizontal room for their result tables and the tuner needs a wide gauge, so full-width blocks read better.

### D2. Tuner as a large note plus an arc gauge

`TunerPanel` becomes three layers:

1. A compact toolbar with the tuning preset, the A4 reference and the start/stop action.
2. A large readout: the note and octave at display size, the cents value, the “afinada/baja/alta” label and an SVG arc with a needle positioned by the cents, clamped to ±50. The arc uses the accent green when the deviation is within ±5 cents and the muted/amber states outside it.
3. The preset's strings as a row of target chips, with the nearest one highlighted.

The existing `useTuner`, presets and note math stay. The gauge is an SVG with `role="img"` and an accessible label, while the note/cents line is a polite live region throttled by the existing detection cadence so it does not announce every frame. No new dependency and no canvas.

- Alternative considered: a needle drawn with CSS transforms. It works, but an SVG arc gives precise tick marks and scales cleanly.
- Alternative considered: a chromatic strobe tuner. It adds behavior and detection work that the request does not ask for.

### D3. Big numbers for tones and calculator

Both blocks put the primary number first and the secondary results under it.

- Tone generator: frequency at display size with its unit, the equivalent note and cents under it, then a level slider and transport. The frequency stays editable through the large number or the ±1/±10 steppers; the note is derived, never typed.
- Calculator: the BPM at display size with ± steppers, the beat in milliseconds under it and the divisions table below. The table keeps the three variant columns and scrolls inside its own container on narrow screens.

- Alternative considered: keep the current side-by-side form. It buries the number the user came to read.
- Alternative considered: a slider for frequency. A linear 20–20 000 Hz slider makes the guitar range unusable.

### D4. Recorder: name and transport share a row

The recorder keeps its header, status and framed display. The name field and the transport move into one row: the field grows, the transport sits to its right with the record control visually distinct and the playback controls grouped. Below the small breakpoint the transport wraps under the field. The display stays below the row, so the wave is never squeezed by the buttons.

`PracticeAudioRecorder` keeps the same hook and state; only the layout changes. Buttons keep their labels, disabled states and the `role="group"` wrapper.

- Alternative considered: put the transport inside the framed display. It looks like hardware but shrinks the wave and crowds the touch targets.
- Alternative considered: keep the transport below and only right-align it. It does not meet the request.

### D5. Waveform as the seek control

`PracticeWaveformBars` stays presentational. A new `PracticeWaveformSeeker` wraps it with pointer and keyboard interaction:

- `role="slider"`, `tabIndex=0`, `aria-valuemin=0`, `aria-valuemax=duration`, `aria-valuenow=currentTime` and a readable `aria-valuetext`.
- `pointerdown` captures the pointer and seeks to the ratio under it; `pointermove` keeps seeking while captured; `pointerup` releases. `touch-action: none` applies only to the seeker.
- Arrow keys seek by a short step, Home/End jump to the start/end, PageUp/PageDown by a larger step.

`PracticeAudioPlayer` uses the seeker instead of the `RangeSlider` whenever the take has peaks. The time labels stay on both sides, and the rewind/forward buttons stay. When peaks are unavailable (still decoding or decode failed) the player keeps the slider as a fallback so the take is never unseekable.

`usePracticeAudioPlayer` gains a `seekToRatio` helper that clamps the ratio and reuses `seek`, so the component does not duplicate the duration math.

- Alternative considered: make the existing bars focusable and interactive. It would mix presentation and behavior and break the bars' use inside the recorder display.
- Alternative considered: keep the slider and overlay it on the wave. Two seek affordances in the same place, and the slider still needs its own row.

### D6. Feedback preference read at open

`usePracticeFeedbackPreference` gains a `refresh` function that re-reads storage, and listens for the `storage` event. `PracticeCompletionDialog` calls `refresh` when it becomes visible, so the sheet asks for exactly the metrics enabled at that moment. The preference remains the single source of truth and stays off by default.

- Alternative considered: move the preference to a Zustand store. More moving parts for one boolean pair that changes rarely.

### D7. One visual language, no new primitives

All new blocks reuse `PageShell`, `PageHeader`, `ToolSection`, `Button`, `TextField`, `RangeSlider`, `AdjustableNumber` and the existing line/surface/accent tokens. No new colors, no gradients, no animation beyond the existing reduced-motion-aware transitions. The tuner gauge and the waveform seeker are the only new visual primitives.

## Risks / Trade-offs

- **A single tools page gets long** → Keep each block's height proportional to its use, separate them with the same `space-y-5` rhythm and keep controls inside their block.
- **A large tuner note plus gauge can crowd a phone** → Scale the note and gauge with responsive sizes and stack the toolbar controls.
- **Waveform dragging can fight page scroll** → Apply `touch-action: none` only to the seeker and capture the pointer only after a pointerdown on it.
- **Removing the range input loses built-in slider semantics** → The seeker must implement the slider role, values, keyboard steps and visible focus.
- **Decoding peaks for every saved take costs memory and audio contexts** → Peaks stay cached by recording id, decoding runs once per take and the player falls back to the slider when peaks are missing.
- **Reading the preference on every open can surprise** → Only enabled metrics are asked; the sheet still allows skipping and stores nothing when unanswered.

## Migration Plan

No data migration. Preferences and recordings keep their current shape, and the change is reversible by revert. The only public component contract that grows is `PracticeWaveformBars`/`PracticeAudioPlayer` (new optional props).

## Open Questions

None.
