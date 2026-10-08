import assert from "node:assert/strict";
import test from "node:test";
import { scheduleMetronomeClick } from "../src/lib/metronome-audio.ts";

function createAudioContextMock() {
  const oscillators = [];
  const gains = [];

  return {
    oscillators,
    gains,
    destination: {},
    createOscillator() {
      const oscillator = {
        frequency: {
          setValueAtTime(value, time) {
            oscillator.frequencyValue = { value, time };
          },
        },
        connect() {},
        addEventListener(_type, listener) {
          oscillator.onEnded = listener;
        },
        start(time) {
          oscillator.startedAt = time;
        },
        stop(time) {
          oscillator.stoppedAt = time;
        },
        disconnect() {
          oscillator.disconnected = true;
        },
      };
      oscillators.push(oscillator);
      return oscillator;
    },
    createGain() {
      const gain = {
        gain: {
          setValueAtTime(value, time) {
            gain.initialValue = { value, time };
          },
          linearRampToValueAtTime(value, time) {
            gain.peakValue = { value, time };
          },
          exponentialRampToValueAtTime(value, time) {
            gain.endValue = { value, time };
          },
        },
        connect() {},
        disconnect() {
          gain.disconnected = true;
        },
      };
      gains.push(gain);
      return gain;
    },
  };
}

test("schedules accented and regular clicks with distinct pitches", () => {
  const context = createAudioContextMock();
  const activeOscillators = new Set();

  scheduleMetronomeClick({
    context,
    scheduledAt: 2,
    volume: 0.5,
    isDownbeat: true,
    activeOscillators,
  });
  scheduleMetronomeClick({
    context,
    scheduledAt: 3,
    volume: 0.5,
    isDownbeat: false,
    activeOscillators,
  });

  assert.deepEqual(
    context.oscillators.map(({ frequencyValue }) => frequencyValue.value),
    [1_000, 760],
  );
  assert.deepEqual(
    context.gains.map(({ peakValue }) => peakValue.value),
    [0.5, 0.39],
  );
  assert.deepEqual(
    context.oscillators.map(({ startedAt, stoppedAt }) => [
      startedAt,
      stoppedAt,
    ]),
    [
      [2, 2.075],
      [3, 3.075],
    ],
  );
  assert.equal(activeOscillators.size, 2);
});

test("skips silent clicks and disconnects nodes after an oscillator ends", () => {
  const context = createAudioContextMock();
  const activeOscillators = new Set();

  scheduleMetronomeClick({
    context,
    scheduledAt: 1,
    volume: 0,
    isDownbeat: true,
    activeOscillators,
  });
  scheduleMetronomeClick({
    context,
    scheduledAt: 1,
    volume: 0.3,
    isDownbeat: true,
    activeOscillators,
  });

  assert.equal(context.oscillators.length, 1);
  const [oscillator] = context.oscillators;
  oscillator.onEnded();

  assert.equal(activeOscillators.size, 0);
  assert.equal(oscillator.disconnected, true);
  assert.equal(context.gains[0].disconnected, true);
});
