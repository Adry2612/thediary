# Tasks

## 1. Voice catalogue

- [ ] 1.1 Rework the wood, bell and hi-hat recipes in `src/utils/metronome-voice.ts` as described in the design: inharmonic modes for the woodblock, seven inharmonic partials on a 700 Hz base for the bell (lower, longer and less telephone-like), and filtered noise plus high square partials for the hi-hat; verify `npm run typecheck` passes.
- [ ] 1.2 Extend `tests/metronome-voice.test.mjs` with the accent margin: every accent keeps its layers, its total gain is at least 1.5× the normal variant, its highest frequency is higher, and no recipe exceeds a peak gain of 1.0; keep the audible-range and fallback checks; verify the suite passes.

## 2. Synthesis

- [x] 2.1 Rewrite `src/services/metronome-audio.ts` to render a recipe: one oscillator per partial plus an optional filtered noise layer, each with its own gain envelope, all scheduled at the same time and stopped at the recipe's duration.
- [x] 2.2 Create and cache the white-noise buffer per `AudioContext`, and track every scheduled source as `AudioScheduledSourceNode` so stopping the metronome also silences the noise.
- [x] 2.3 Update `src/hooks/useMetronome.ts` for the new source type: the ref, the stop loop and the cleanup of the live nodes.
- [ ] 2.4 Update `tests/metronome-audio.test.mjs` for the new layering: the clean click schedules one oscillator, the bell seven, the wood four (three tones and a filtered noise), the hi-hat one noise source plus five squares, and the accent of every voice schedules at a higher frequency than its normal variant; verify the suite passes.

## 3. State and persistence

- [x] 3.1 Add `src/services/metronome-voice-storage.ts` that reads and writes the chosen voice under `thediary.metronome-voice`, returning the clean click on any failure.
- [x] 3.2 Wire the voice through `src/hooks/useMetronome.ts`: state and ref, load on mount, save on change, and pass it to every scheduled click.

## 4. Settings

- [x] 4.1 Add a "Sonido" select with the seven voices to `src/components/practice/MetronomeSettings.tsx`, keeping it usable while the metronome runs.
- [x] 4.2 Add the voice names to `src/i18n/es.ts`, `src/i18n/en.ts` and `src/i18n/dictionary.ts`; verify both languages typecheck.
- [x] 4.3 In the browser, change the voice while the metronome is running and verify the following beats change timbre without stopping or restarting.

## 5. Verification

- [x] 5.1 Run `npm test`, `npm run typecheck` and `npm run build`; verify all three finish without failures.
- [ ] 5.2 By ear, compare the seven voices at the same volume and check that each is distinguishable and that none is much louder than the rest; adjust gains if one stands out. This one needs a person listening: record the outcome.
- [x] 5.3 Reload and return from another screen: verify the chosen voice is still selected, and that an unknown stored value falls back to the clean click.
- [x] 5.4 Verify the settings dialog with the new select at 375, 768 and 1280 px without horizontal overflow.

## Workflow follow-up

- Archive the change after the project's review requirements are satisfied, and after `add-metronome-beat-accents`, which this change builds on.
- The clipping of the sound-select dropdown is a `SelectField` defect, not this change's; it is covered by `fix-select-listbox-positioning`.
- Verify the archived `practice-tools` spec keeps its previous requirements and gains the two voice requirements.
