import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_PRACTICE_END_SOUND,
  DEFAULT_PRACTICE_START_SOUND,
  getPracticeSoundDuration,
  getPracticeSoundInstrument,
  getPracticeStrike,
  isPracticeSound,
  normalizePracticeSound,
  PRACTICE_SOUNDS,
} from "../src/utils/practice-sounds.ts";

const MOMENTS = ["start", "end"];

test("there are two alerts with distinct values", () => {
  assert.deepEqual(PRACTICE_SOUNDS, ["wood", "marimba"]);
  assert.equal(new Set(PRACTICE_SOUNDS).size, PRACTICE_SOUNDS.length);

  for (const sound of PRACTICE_SOUNDS) {
    assert.equal(isPracticeSound(sound), true);
  }
  assert.equal(isPracticeSound("bell"), false);
  assert.equal(isPracticeSound("gong"), false);
  assert.equal(isPracticeSound(3), false);
});

test("the defaults are wood to start and marimba to end", () => {
  assert.equal(DEFAULT_PRACTICE_START_SOUND, "wood");
  assert.equal(DEFAULT_PRACTICE_END_SOUND, "marimba");

  assert.equal(normalizePracticeSound("marimba", "wood"), "marimba");
  assert.equal(normalizePracticeSound(undefined, "wood"), "wood");
  assert.equal(normalizePracticeSound("bell", "marimba"), "marimba");
  assert.equal(normalizePracticeSound("whistle", "wood"), "wood");
});

test("every alert keeps two strikes to start and three to end", () => {
  for (const sound of PRACTICE_SOUNDS) {
    const instrument = getPracticeSoundInstrument(sound);

    assert.equal(instrument.startNotes.length, 2);
    assert.equal(instrument.endNotes.length, 3);
    assert.ok(instrument.startGapSeconds > 0);
    assert.ok(instrument.endGapSeconds > 0);
    assert.ok(instrument.startTailSeconds > 0);
    assert.ok(instrument.gain > 0 && instrument.gain <= 1);
    assert.ok(instrument.strike.partials.length > 0);
  }
});

test("the start stays under a second and the end lasts longer", () => {
  for (const sound of PRACTICE_SOUNDS) {
    const start = getPracticeSoundDuration(sound, "start");
    const end = getPracticeSoundDuration(sound, "end");

    assert.ok(start < 1, `${sound} start lasts ${start}s`);
    assert.ok(end > start, `${sound} end ${end}s does not outlast ${start}s`);
    assert.ok(end >= 0.6, `${sound} end lasts only ${end}s`);
  }
});

test("the start call is not the end melody cut short", () => {
  for (const sound of PRACTICE_SOUNDS) {
    const instrument = getPracticeSoundInstrument(sound);

    assert.notDeepEqual(
      instrument.startNotes,
      instrument.endNotes.slice(0, 2),
      `${sound} start repeats the beginning of its end`,
    );
  }
});

test("the two alerts use different notes", () => {
  const wood = getPracticeSoundInstrument("wood");
  const marimba = getPracticeSoundInstrument("marimba");

  assert.notDeepEqual(wood.startNotes, marimba.startNotes);
  assert.notDeepEqual(wood.endNotes, marimba.endNotes);
});

test("a strike scales its partials from the note it plays", () => {
  const strike = getPracticeStrike("marimba", 440);
  const frequencies = strike.partials.map(({ frequency }) => frequency);

  assert.equal(strike.partials.length, 4);
  assert.ok(Math.abs(frequencies[0] - 440) < 1e-9);
  assert.ok(Math.abs(frequencies[1] - 440 * 3.93) < 1e-9);
  assert.ok(Math.abs(frequencies[3] - 440 * 16.7) < 1e-9);
});

test("a capped tail shortens the strike without silencing it", () => {
  const full = getPracticeStrike("marimba", 440);
  const capped = getPracticeStrike("marimba", 440, 0.1);

  assert.ok(capped.durationSeconds < full.durationSeconds);
  assert.ok(capped.durationSeconds > 0);
  for (const partial of capped.partials) {
    assert.ok(partial.decaySeconds >= 0.001);
  }
});

test("every alert and every moment can be described", () => {
  for (const sound of PRACTICE_SOUNDS) {
    for (const moment of MOMENTS) {
      const duration = getPracticeSoundDuration(sound, moment);
      assert.ok(Number.isFinite(duration) && duration > 0);
    }
  }
});
