import assert from "node:assert/strict";
import test from "node:test";
import {
  getTabColumnSeconds,
  getTabPlaybackDuration,
  getTabPlaybackEvents,
  getTabTuningMidi,
  midiToFrequency,
  pitchClassToMidi,
} from "../src/lib/tab-playback.ts";

function tab(overrides = {}) {
  return {
    tuning: "EADGBE",
    measures: 2,
    subdivision: 16,
    notes: [],
    ...overrides,
  };
}

test("calcula la altura MIDI de afinaciones estándar y alternativas", () => {
  assert.deepEqual(getTabTuningMidi("EADGBE"), [40, 45, 50, 55, 59, 64]);
  assert.deepEqual(getTabTuningMidi("DADGBE"), [38, 45, 50, 55, 59, 64]);
  assert.deepEqual(getTabTuningMidi("DADGAD"), [38, 45, 50, 55, 57, 62]);
  assert.equal(pitchClassToMidi(4, 40), 40);
  assert.equal(midiToFrequency(69), 440);
});

test("convierte resolución y BPM en segundos por columna", () => {
  assert.equal(getTabColumnSeconds(tab(), 120), 0.125);
  assert.equal(getTabColumnSeconds(tab({ subdivision: 8 }), 120), 0.25);
  assert.equal(getTabPlaybackDuration(tab(), 120), 4);
});

test("ordena los ataques y limita la duración a la siguiente nota de la cuerda", () => {
  const events = getTabPlaybackEvents(
    tab({
      notes: [
        { string: 0, fret: 3, column: 0 },
        { string: 1, fret: 5, column: 2 },
        { string: 0, fret: 5, column: 4, letRing: true },
      ],
    }),
    120,
  );

  assert.deepEqual(
    events.map((event) => [event.column, event.string, event.time]),
    [
      [0, 0, 0],
      [2, 1, 0.25],
      [4, 0, 0.5],
    ],
  );
  assert.equal(events[0].duration, 0.5);
  assert.equal(events[1].duration, 0.5);
  assert.equal(events[2].duration, 1);
});

test("aplica armónicos, apagados y palm mute al evento", () => {
  const events = getTabPlaybackEvents(
    tab({
      notes: [
        { string: 0, fret: 5, column: 0, harmonic: "natural" },
        { string: 1, fret: 5, column: 1, dead: true },
        { string: 2, fret: 5, column: 2, palmMute: true },
      ],
    }),
    120,
  );

  assert.equal(events[0].midi, 57);
  assert.equal(events[1].duration, 0.08);
  assert.ok(events[2].duration < 0.125);
});
