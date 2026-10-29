import assert from "node:assert/strict";
import test from "node:test";
import { createPracticeSoundScheduler } from "../src/services/practice-sound.ts";

function createAudioContextMock({ currentTime = 10 } = {}) {
  const oscillators = [];
  const buffers = [];
  const sources = [];
  const filters = [];
  const gains = [];

  return {
    oscillators,
    buffers,
    sources,
    filters,
    gains,
    currentTime,
    sampleRate: 44_100,
    destination: {},

    createBuffer(channels, length, sampleRate) {
      return {
        length,
        sampleRate,
        getChannelData: () => new Float32Array(length),
      };
    },
    createOscillator() {
      const oscillator = {
        type: "sine",
        frequency: {
          setValueAtTime(value) {
            oscillator.frequencyValue = value;
          },
        },
        connect() {},
        disconnect() {
          oscillator.disconnected = true;
        },
        addEventListener(_type, listener) {
          oscillator.onEnded = listener;
        },
        start(time) {
          oscillator.startedAt = time;
        },
        stop(time) {
          oscillator.stopCalls.push(time);
          if (time !== undefined) oscillator.stoppedAt = time;
        },
        stopCalls: [],
      };
      oscillators.push(oscillator);
      return oscillator;
    },
    createBufferSource() {
      const source = {
        buffer: null,
        connect() {},
        disconnect() {
          source.disconnected = true;
        },
        addEventListener(_type, listener) {
          source.onEnded = listener;
        },
        start(time) {
          source.startedAt = time;
        },
        stop(time) {
          source.stopCalls.push(time);
          if (time !== undefined) source.stoppedAt = time;
        },
        stopCalls: [],
      };
      buffers.push(source);
      return source;
    },
    createBiquadFilter() {
      const filter = {
        type: "highpass",
        frequency: { setValueAtTime() {} },
        Q: { setValueAtTime() {} },
        connect() {},
        disconnect() {
          filter.disconnected = true;
        },
      };
      filters.push(filter);
      return filter;
    },
    createGain() {
      const gain = {
        gain: {
          setValueAtTime() {},
          linearRampToValueAtTime() {},
          exponentialRampToValueAtTime() {},
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

/** Cada nota deja una fuente de ruido, así que las fuentes cuentan los golpes. */
function getStrikeStarts(context) {
  return context.buffers.map(({ startedAt }) => Number(startedAt.toFixed(3)));
}

test("a start alert plays two strikes of the chosen sound", () => {
  const context = createAudioContextMock();
  const scheduler = createPracticeSoundScheduler({ context });

  scheduler.play("wood", "start");

  assert.deepEqual(getStrikeStarts(context), [10.02, 10.18]);
  // Tres parciales por golpe.
  assert.equal(context.oscillators.length, 6);
  assert.deepEqual(
    context.oscillators.map(({ frequencyValue }) => frequencyValue),
    [880, 1_320, 2_050.4, 1_320, 1_980, 3_075.6],
  );
});

test("an end alert plays three strikes", () => {
  const context = createAudioContextMock();
  const scheduler = createPracticeSoundScheduler({ context });

  scheduler.play("marimba", "end");

  assert.deepEqual(getStrikeStarts(context), [10.02, 10.42, 10.82]);
  assert.equal(context.oscillators.length, 12);
  const firstNote = context.oscillators.slice(0, 4).map(({ frequencyValue }) => frequencyValue);
  assert.ok(Math.abs(firstNote[0] - 440) < 1e-9);
  assert.ok(Math.abs(firstNote[1] - 440 * 3.93) < 1e-9);
  assert.ok(Math.abs(firstNote[2] - 440 * 9.24) < 1e-9);
  assert.ok(Math.abs(firstNote[3] - 440 * 16.7) < 1e-9);
});

test("the start alert fits in under a second", () => {
  for (const sound of ["wood", "marimba"]) {
    const context = createAudioContextMock();
    const scheduler = createPracticeSoundScheduler({ context });

    scheduler.play(sound, "start");

    const firstStart = Math.min(...context.buffers.map(({ startedAt }) => startedAt));
    const lastStop = Math.max(...context.buffers.map(({ stoppedAt }) => stoppedAt));
    assert.ok(
      lastStop - firstStart < 1,
      `${sound} start lasts ${lastStop - firstStart}s`,
    );
  }
});

test("the end alert lets the last strike ring", () => {
  const context = createAudioContextMock();
  const scheduler = createPracticeSoundScheduler({ context });

  scheduler.play("marimba", "end");

  const first = context.buffers[0];
  const lastNote = context.oscillators.filter(
    ({ startedAt }) => Math.abs(startedAt - 10.82) < 1e-9,
  );
  assert.equal(lastNote.length, 4);
  const lastStop = Math.max(...lastNote.map(({ stoppedAt }) => stoppedAt));
  assert.ok(lastStop - first.startedAt >= 1.5);
  assert.ok(lastStop - 10.82 > 0.85);
});

test("starting a new alert cuts the previous one", () => {
  const context = createAudioContextMock();
  const scheduler = createPracticeSoundScheduler({ context });

  scheduler.play("marimba", "end");
  const firstAlert = [...context.buffers, ...context.oscillators];

  scheduler.play("wood", "start");
  const secondAlert = context.buffers.slice(3);

  for (const source of firstAlert) {
    assert.ok(
      source.stopCalls.includes(undefined),
      "the previous alert must stop immediately",
    );
  }
  for (const source of secondAlert) {
    assert.equal(
      source.stopCalls.includes(undefined),
      false,
      "the new alert keeps its own envelope",
    );
  }
});

test("stopping the scheduler silences what is playing", () => {
  const context = createAudioContextMock();
  const scheduler = createPracticeSoundScheduler({ context });

  scheduler.play("wood", "end");
  scheduler.stop();

  const everySource = [...context.buffers, ...context.oscillators];
  assert.ok(everySource.every(({ stopCalls }) => stopCalls.includes(undefined)));
});

test("the scheduler accepts a volume without breaking", () => {
  const context = createAudioContextMock();
  const scheduler = createPracticeSoundScheduler({ context, volume: 0 });

  scheduler.play("marimba", "start");

  // Con volumen cero no se programa nada: no hay fuentes vivas.
  assert.equal(context.oscillators.length, 0);
  assert.equal(context.buffers.length, 0);
});

test("every alert and every moment can be scheduled", () => {
  for (const sound of ["wood", "marimba"]) {
    for (const moment of ["start", "end"]) {
      const context = createAudioContextMock();
      const scheduler = createPracticeSoundScheduler({ context });
      scheduler.play(sound, moment);
      assert.ok(context.buffers.length >= 2);
    }
  }
});
