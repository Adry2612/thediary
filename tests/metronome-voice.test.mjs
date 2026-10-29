import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_METRONOME_VOICE,
  getVoiceRecipe,
  isMetronomeVoice,
  METRONOME_VOICES,
  normalizeMetronomeVoice,
} from "../src/utils/metronome-voice.ts";

const AUDIBLE_MIN_HZ = 20;
const AUDIBLE_MAX_HZ = 20_000;
/** ≈ +3,5 dB: por debajo de esto el acento se percibe igual que el normal. */
const ACCENT_GAIN_MARGIN = 1.5;
const KINDS = ["normal", "accent", "accentClosed"];

function getFrequencies({ partials, noise }) {
  return [
    ...partials.map((partial) => partial.frequency),
    ...(noise ? [noise.frequency] : []),
  ];
}

function getTotalGain({ partials, noise }) {
  return (
    partials.reduce((total, partial) => total + partial.gain, 0) +
    (noise?.gain ?? 0)
  );
}

test("there are seven voices and the clean click is the default", () => {
  assert.equal(METRONOME_VOICES.length, 7);
  assert.equal(DEFAULT_METRONOME_VOICE, "studio");
  assert.equal(normalizeMetronomeVoice(undefined), "studio");
  assert.equal(normalizeMetronomeVoice(null), "studio");
  assert.equal(normalizeMetronomeVoice("marimba"), "studio");
  assert.equal(normalizeMetronomeVoice(42), "studio");
  assert.equal(normalizeMetronomeVoice("shaker"), "shaker");
});

test("recognises exactly the catalogue values", () => {
  for (const voice of METRONOME_VOICES) {
    assert.equal(isMetronomeVoice(voice), true);
  }
  assert.equal(isMetronomeVoice("STUDIO"), false);
  assert.equal(isMetronomeVoice(""), false);
});

test("every voice and every accent sounds through at least one layer", () => {
  for (const voice of METRONOME_VOICES) {
    for (const kind of KINDS) {
      const recipe = getVoiceRecipe(voice, kind);
      assert.ok(
        recipe.partials.length > 0 || recipe.noise,
        `${voice} (${kind}) needs a layer`,
      );
      assert.ok(recipe.durationSeconds > 0);
    }
  }
});

test("the accent variant is clearly brighter and louder, never another instrument", () => {
  for (const voice of METRONOME_VOICES) {
    const normal = getVoiceRecipe(voice, "normal");
    const accent = getVoiceRecipe(voice, "accent");

    assert.notDeepEqual(accent, normal, `${voice} needs a distinct accent`);
    assert.equal(
      accent.noise !== undefined,
      normal.noise !== undefined,
      `${voice} accent keeps the same layers`,
    );
    assert.equal(
      accent.partials.length,
      normal.partials.length,
      `${voice} accent keeps the same partial count`,
    );

    const brighter =
      Math.max(...getFrequencies(accent)) > Math.max(...getFrequencies(normal));
    const louder =
      getTotalGain(accent) >= getTotalGain(normal) * ACCENT_GAIN_MARGIN;
    assert.ok(brighter, `${voice} accent needs brighter frequencies`);
    assert.ok(
      louder,
      `${voice} accent must add at least ${ACCENT_GAIN_MARGIN}× the gain`,
    );
  }
});

test("a closed accent is a tenth higher and cuts its tail", () => {
  for (const voice of METRONOME_VOICES) {
    const open = getVoiceRecipe(voice, "accent");
    const closed = getVoiceRecipe(voice, "accentClosed");
    const openFrequencies = getFrequencies(open);
    const closedFrequencies = getFrequencies(closed);

    assert.equal(closed.partials.length, open.partials.length);
    assert.equal(closedFrequencies.length, openFrequencies.length);
    closedFrequencies.forEach((frequency, index) => {
      const ratio = frequency / openFrequencies[index];
      assert.ok(
        Math.abs(ratio - 1.1) < 1e-9,
        `${voice} closed accent is ${ratio.toFixed(3)}× the open one`,
      );
    });
    assert.ok(
      closed.durationSeconds < open.durationSeconds,
      `${voice} closed accent must be shorter`,
    );
    for (const partial of closed.partials) {
      assert.ok(
        partial.decaySeconds <= 0.04 + 1e-9,
        `${voice} closed accent still rings`,
      );
    }
  }
});

test("no recipe peaks above the clipping ceiling", () => {
  for (const voice of METRONOME_VOICES) {
    for (const kind of KINDS) {
      assert.ok(
        getTotalGain(getVoiceRecipe(voice, kind)) <= 1,
        `${voice} (${kind}) would clip`,
      );
    }
  }
});

test("every scheduled frequency stays audible and every gain is positive", () => {
  for (const voice of METRONOME_VOICES) {
    for (const kind of KINDS) {
      const recipe = getVoiceRecipe(voice, kind);

      for (const frequency of getFrequencies(recipe)) {
        assert.ok(
          frequency >= AUDIBLE_MIN_HZ && frequency <= AUDIBLE_MAX_HZ,
          `${voice} uses ${frequency} Hz`,
        );
      }
      for (const partial of recipe.partials) {
        assert.ok(partial.gain > 0);
        assert.ok(partial.decaySeconds > 0);
      }
      if (recipe.noise) {
        assert.ok(recipe.noise.gain > 0);
        assert.ok(recipe.noise.decaySeconds > 0);
        assert.ok(recipe.noise.q > 0);
      }
    }
  }
});

test("the duration covers the longest layer", () => {
  for (const voice of METRONOME_VOICES) {
    for (const kind of KINDS) {
      const recipe = getVoiceRecipe(voice, kind);
      const layerEnds = [
        ...recipe.partials.map(
          ({ delaySeconds = 0, attackSeconds = 0.004, decaySeconds }) =>
            delaySeconds + attackSeconds + decaySeconds,
        ),
        ...(recipe.noise
          ? [recipe.noise.attackSeconds + recipe.noise.decaySeconds]
          : []),
      ];

      assert.ok(
        Math.abs(recipe.durationSeconds - Math.max(...layerEnds)) < 1e-9,
      );
    }
  }
});
