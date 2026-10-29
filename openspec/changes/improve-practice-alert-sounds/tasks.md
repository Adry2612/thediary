# Tasks

## 1. Catálogo

- [x] 1.1 Reduce `PRACTICE_SOUNDS` in `src/utils/practice-sounds.ts` to `wood` and `marimba`, with translations `soundWood` and `soundMarimba` and defaults `wood` at the start and `marimba` at the end.
- [x] 1.2 Describe each alert as a strike recipe (partial ratios, decays and optional noise) plus the two start notes and the three end notes, with `getPracticeStrike` and `getPracticeSoundDuration`.
- [x] 1.3 Rebuild the marimba with bar modes (1 / 3.93 / 9.24 / 16.7) and keep the metronome's woodblock modes (1 / 1.5 / 2.33 plus a high-pass click).

## 2. Reproductor

- [x] 2.1 Rewrite `src/services/practice-sound.ts` to schedule each strike with `scheduleVoiceRecipe`, cap the tail of the last start strike, leave the end to decay, stop the previous alert and drop the fetch/decode/cache path.
- [x] 2.2 Rewrite `tests/practice-sound.test.mjs` against a fake context: two strikes at the start, three at the end, the start under a second, the end ringing longer, the previous alert cut and `stop` silencing everything.
- [x] 2.3 Rewrite `tests/practice-sounds.test.mjs`: the two sounds, the defaults, the retired values falling back, the note counts, the durations and the start melody apart from the end.

## 3. Estado e interfaz

- [x] 3.1 Keep the start and end choices under `thediary.practice-start-sound` and `thediary.practice-end-sound`.
- [x] 3.2 Keep `useMetronome` exposing both choices and `usePracticeTimer` playing them through `playPracticeSound`.
- [x] 3.3 Keep the two chip rows in `TimerCard`, now with madera and marimba and the preview on selection.
- [x] 3.4 Delete the unused audio assets: `public/sounds/` and its `LICENSE.md`.

## 4. Verificación

- [x] 4.1 Run `npm test`, `npm run typecheck` and `npm run build`; all three finish without failures.
- [ ] 4.2 In the browser, choose madera and marimba in both rows, verify the start plays two strikes and the end three, then reload and verify both choices persist and a retired value falls back.
- [ ] 4.3 With a backing track at practice volume, listen to the end alert of each sound and confirm it is noticed without looking at the screen. This one needs a person listening.

## Workflow follow-up

- Archive after the listening task passes, and verify `practice-session-management` keeps its existing requirements and gains the two new ones.
- The metronome's synthesis renderer is untouched; both features now share `voice-synth.ts`.
