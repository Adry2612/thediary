# Tasks

## 1. Beat pattern model

- [x] 1.1 Add `src/utils/metronome-beat-pattern.ts` with the four states (`normal`, `accent`, `accentClosed`, `muted`), `createDefaultBeatPattern`, `normalizeBeatPattern`, `cycleBeatState`, `toggleBeatAccent` and `toggleBeatMute`, so that each beat holds exactly one state; verify `npm run typecheck` passes.
- [x] 1.2 Cover the default downbeat, truncating and padding a stored pattern, invalid states, both toggles and the four-step cycle in `tests/metronome-beat-pattern.test.mjs`; verify the suite passes.
- [x] 1.3 Add `src/services/metronome-beat-pattern-storage.ts` that reads a meter-to-pattern map and writes one meter at a time, returning empty defaults on any read failure and ignoring write failures; verify `npm run typecheck` passes.

## 2. Scheduling and audio

- [x] 2.1 Give `getScheduledMetronomeBeats` the beat pattern and emit a `click` of `"accent" | "accentClosed" | "normal" | "none"`, where a muted beat silences its whole beat and its subdivisions; update `tests/metronome-scheduler.test.mjs` and verify it passes.
- [x] 2.2 Let `scheduleMetronomeClick` take the click kind instead of a boolean and update `tests/metronome-audio.test.mjs`; verify the suite passes.
- [x] 2.3 Add the closed-accent variant to `src/utils/metronome-voice.ts`: the accent recipe a tenth higher, noise filter included, with every decay cut to 40 ms; cover it in `tests/metronome-voice.test.mjs`.
- [x] 2.4 Wire the pattern through `src/hooks/useMetronome.ts`: keep it in state and in a ref, expose the two toggles and the cycle, load the meter's pattern on mount and on every meter change, save it on every change, pass it to the scheduler and skip the click when it is `"none"`; verify `npm run typecheck` passes.

## 3. Beat dots

- [x] 3.1 Turn each beat dot in `src/components/practice/MetronomeCard.tsx` into a button that cycles normal → open accent → closed accent → muted on every activation, applied immediately, with no timer and no double-click handler.
- [x] 3.2 Give the four states a shape as well as a colour, set each dot's accessible name to its beat number and state, and add the visually hidden hint for the cycle and the `M` key; use `touch-action: manipulation` on the dots.
- [x] 3.3 Handle `M` from the keyboard on a focused dot to mute or restore it directly, and make Enter and Space cycle the state like a click.
- [x] 3.4 Add the four beat-state labels and the hint copy to `src/i18n/es.ts`, `src/i18n/en.ts` and `src/i18n/dictionary.ts`; verify both languages typecheck.
- [x] 3.5 Replace the fixed four-column grid of the beat dots with a centred row, so a meter with two or three beats does not leave them against the left edge.

## 4. Verification

- [x] 4.1 Run `npm test`, `npm run typecheck` and `npm run build`; verify all three finish without failures.
- [x] 4.2 In the browser, cycle one dot through its four states and verify each one applies on the first activation: the open accent rings, the closed one is choked a tenth higher, and the muted one still pulses in time.
- [x] 4.3 Reload and return from another screen: verify the pattern is restored, including a closed accent, and that changing the meter and coming back keeps each meter's own pattern.
- [x] 4.4 Verify a 2-beat meter (6/8) and a 4-beat meter (4/4) at 375, 768 and 1280 px: every dot stays inside the card without horizontal overflow and remains reachable.
- [ ] 4.5 Check on a real touch device that a single tap cycles the four states and that every state is reachable without a keyboard; record the result before archiving.
- [x] 4.6 Measure the dots against the card in 4/4, 6/8 and 9/8: the group must stay centred, with zero offset, and the page must not overflow.

## Workflow follow-up

- Archive the change after the project's review requirements are satisfied.
- Verify the archived `practice-tools` spec keeps its four original requirements and gains the four new ones.
