import assert from "node:assert/strict";
import test from "node:test";
import { scheduleMetronomeClick } from "../src/services/metronome-audio.ts";

function createAudioContextMock() {
  const oscillators = [];
  const gains = [];
  const bufferSources = [];
  const filters = [];
  const buffers = [];

  function createEnvelope() {
    return {
      setValueAtTime(value, time) {
        this.initial = { value, time };
      },
      linearRampToValueAtTime(value, time) {
        this.peak = { value, time };
      },
      exponentialRampToValueAtTime(value, time) {
        this.end = { value, time };
      },
    };
  }

  return {
    oscillators,
    gains,
    bufferSources,
    filters,
    buffers,
    sampleRate: 48_000,
    destination: {},
    createOscillator() {
      const oscillator = {
        type: "sine",
        frequency: {
          setValueAtTime(value, time) {
            oscillator.frequencyValue = { value, time };
          },
        },
        connect(node) {
          oscillator.connectedTo = node;
        },
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
    createBufferSource() {
      const source = {
        buffer: null,
        connect(node) {
          source.connectedTo = node;
        },
        addEventListener(_type, listener) {
          source.onEnded = listener;
        },
        start(time) {
          source.startedAt = time;
        },
        stop(time) {
          source.stoppedAt = time;
        },
        disconnect() {
          source.disconnected = true;
        },
      };
      bufferSources.push(source);
      return source;
    },
    createBiquadFilter() {
      const filter = {
        type: "lowpass",
        frequency: {
          setValueAtTime(value, time) {
            filter.frequencyValue = { value, time };
          },
        },
        Q: {
          setValueAtTime(value, time) {
            filter.qValue = { value, time };
          },
        },
        connect(node) {
          filter.connectedTo = node;
        },
        disconnect() {
          filter.disconnected = true;
        },
      };
      filters.push(filter);
      return filter;
    },
    createGain() {
      const gain = {
        gain: createEnvelope(),
        connect(node) {
          gain.connectedTo = node;
        },
        disconnect() {
          gain.disconnected = true;
        },
      };
      gains.push(gain);
      return gain;
    },
    createBuffer(channels, length, sampleRate) {
      const data = new Float32Array(length);
      const buffer = {
        channels,
        length,
        sampleRate,
        data,
        getChannelData() {
          return data;
        },
      };
      buffers.push(buffer);
      return buffer;
    },
  };
}

function schedule(context, options = {}) {
  scheduleMetronomeClick({
    context,
    scheduledAt: 2,
    volume: 0.5,
    voice: "studio",
    click: "normal",
    activeSources: new Set(),
    ...options,
  });
}

function getScheduledFrequencies(context) {
  return [
    ...context.oscillators.map(({ frequencyValue }) => frequencyValue.value),
    ...context.filters.map(({ frequencyValue }) => frequencyValue.value),
  ];
}

test("the clean click keeps one sine oscillator and the accent is higher", () => {
  const context = createAudioContextMock();
  const activeSources = new Set();

  schedule(context, { activeSources, voice: "studio", click: "normal" });
  schedule(context, {
    activeSources,
    voice: "studio",
    click: "accent",
    scheduledAt: 3,
  });

  assert.equal(context.oscillators.length, 2);
  assert.equal(context.bufferSources.length, 0);
  assert.deepEqual(
    context.oscillators.map(({ frequencyValue }) => frequencyValue.value),
    [760, 1_000],
  );
  assert.deepEqual(
    context.oscillators.map(({ type }) => type),
    ["sine", "sine"],
  );
  assert.deepEqual(
    context.gains.map(({ gain }) => gain.peak.value),
    [0.33, 0.5],
  );
  assert.deepEqual(
    context.oscillators.map(({ startedAt, stoppedAt }) => [
      startedAt,
      stoppedAt,
    ]),
    [
      [2, 2.079],
      [3, 3.079],
    ],
  );
  assert.equal(activeSources.size, 2);
});

test("the woodblock layers three short modes and a click", () => {
  const context = createAudioContextMock();

  schedule(context, { voice: "wood", click: "normal" });

  assert.equal(context.oscillators.length, 3);
  assert.deepEqual(
    context.oscillators.map(({ frequencyValue }) => frequencyValue.value),
    [880, 1_320, 2_050],
  );
  assert.ok(context.oscillators.every(({ stoppedAt }) => stoppedAt < 2.06));
  assert.equal(context.bufferSources.length, 1);
  const [filter] = context.filters;
  assert.equal(filter.type, "highpass");
  assert.equal(filter.frequencyValue.value, 5_000);
});

test("the bell layers five inharmonic partials with a long tail", () => {
  const context = createAudioContextMock();

  schedule(context, { voice: "bell", click: "normal" });
  const normalFrequencies = context.oscillators.map(
    ({ frequencyValue }) => frequencyValue.value,
  );

  assert.equal(normalFrequencies.length, 5);
  assert.deepEqual(normalFrequencies, [980, 1_960, 2_352, 2_940, 4_116]);
  assert.ok(context.oscillators[0].stoppedAt > 2.5);

  const accentContext = createAudioContextMock();
  schedule(accentContext, { voice: "bell", click: "accent" });
  const accentFrequencies = accentContext.oscillators.map(
    ({ frequencyValue }) => frequencyValue.value,
  );

  assert.equal(accentFrequencies.length, 5);
  for (let index = 0; index < 5; index += 1) {
    assert.ok(accentFrequencies[index] > normalFrequencies[index]);
  }
});

test("the hi-hat plays filtered noise plus five high squares and shares the buffer", () => {
  const context = createAudioContextMock();
  const activeSources = new Set();

  schedule(context, { activeSources, voice: "hihat", click: "normal" });
  schedule(context, { activeSources, voice: "hihat", click: "normal" });
  schedule(context, { activeSources, voice: "shaker", click: "accent" });

  assert.equal(context.oscillators.length, 10, "five squares per hit");
  assert.ok(
    context.oscillators.every(
      ({ type, frequencyValue }) =>
        type === "square" && frequencyValue.value >= 7_400,
    ),
  );
  assert.equal(context.bufferSources.length, 3);
  assert.equal(context.filters.length, 3);
  assert.equal(context.buffers.length, 1, "one noise buffer per context");
  assert.equal(context.bufferSources[0].buffer, context.buffers[0]);

  const [hihatFilter] = context.filters;
  assert.equal(hihatFilter.type, "highpass");
  assert.equal(hihatFilter.frequencyValue.value, 9_000);
  assert.ok(hihatFilter.qValue.value > 0);
});

test("the rimshot layers noise and a body tone", () => {
  const context = createAudioContextMock();

  schedule(context, { voice: "rimshot", click: "normal" });

  assert.equal(context.bufferSources.length, 1);
  assert.equal(context.oscillators.length, 1);
  assert.equal(context.oscillators[0].type, "sine");
  assert.ok(context.oscillators[0].frequencyValue.value < 1_000);
});

test("every accent schedules higher frequencies than its normal variant", () => {
  for (const voice of [
    "studio",
    "wood",
    "bell",
    "hihat",
    "beep",
    "rimshot",
    "shaker",
  ]) {
    const normalContext = createAudioContextMock();
    const accentContext = createAudioContextMock();

    schedule(normalContext, { voice, click: "normal" });
    schedule(accentContext, { voice, click: "accent" });

    assert.ok(
      Math.max(...getScheduledFrequencies(accentContext)) >
        Math.max(...getScheduledFrequencies(normalContext)),
      `${voice} accent is not brighter`,
    );
  }
});

test("skips silent clicks and disconnects every node after it ends", () => {
  const context = createAudioContextMock();
  const activeSources = new Set();

  schedule(context, { activeSources, volume: 0 });
  schedule(context, { activeSources, voice: "wood", volume: 0.3 });

  assert.equal(context.oscillators.length, 3);
  assert.equal(context.bufferSources.length, 1);
  assert.equal(activeSources.size, 4);

  for (const source of [...activeSources]) source.onEnded();

  assert.equal(activeSources.size, 0);
  assert.ok(context.oscillators.every(({ disconnected }) => disconnected));
  assert.equal(context.bufferSources[0].disconnected, true);
  assert.ok(context.gains.every(({ disconnected }) => disconnected === true));
  assert.equal(context.filters[0].disconnected, true);
});

test("every voice schedules at the requested time", () => {
  for (const voice of [
    "studio",
    "wood",
    "bell",
    "hihat",
    "beep",
    "rimshot",
    "shaker",
  ]) {
    const context = createAudioContextMock();

    schedule(context, { voice, click: "normal" });

    const sources = [...context.oscillators, ...context.bufferSources];
    assert.ok(sources.length > 0, `${voice} scheduled nothing`);
    for (const source of sources) {
      assert.equal(source.startedAt, 2);
      assert.ok(source.stoppedAt > source.startedAt);
    }
  }
});
