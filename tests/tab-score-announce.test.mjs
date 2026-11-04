import assert from "node:assert/strict";
import test from "node:test";
import {
  announceSelection,
  describeBeatDuration,
} from "../src/utils/tab-score/announce.ts";
import { createEmptyScore } from "../src/utils/tab-score/model.ts";

const labels = {
  barLabel: "compás",
  beatLabel: "pulso",
  stringLabel: "cuerda",
  fretLabel: "traste",
  restLabel: "silencio",
  emptyLabel: "vacío",
  noNoteLabel: "sin nota",
  noSelectionLabel: "Sin selección",
  durationWhole: "redonda",
  durationHalf: "blanca",
  durationQuarter: "negra",
  durationEighth: "corchea",
  durationSixteenth: "semicorchea",
  durationThirtySecond: "fusa",
  durationSixtyFourth: "semifusa",
  dottedSuffix: "con puntillo",
  tupletSuffixes: {
    3: "tresillo",
    5: "quintillo",
    6: "seisillo",
    7: "septillo",
    9: "nonillo",
    10: "decimillo",
    12: "doceavo",
  },
};

function score(beats) {
  return {
    bars: [
      {
        id: "bar-a",
        timeSignature: { numerator: 4, denominator: 4 },
        beats,
      },
    ],
  };
}

test("announces a note with its string, fret and duration", () => {
  const state = score([
    {
      id: "b1",
      duration: 8,
      dots: 1,
      rest: false,
      notes: [{ string: 0, fret: 3 }],
    },
  ]);

  assert.equal(
    announceSelection({
      score: state,
      selection: { bar: 0, beat: 0, string: 0 },
      stringCount: 6,
      labels,
    }),
    "Compás 1, pulso 1, cuerda 6, traste 3, corchea con puntillo.",
  );
});

test("announces a rest and an empty string", () => {
  const state = score([
    { id: "b1", duration: 4, rest: true, notes: [] },
  ]);

  assert.equal(
    announceSelection({
      score: state,
      selection: { bar: 0, beat: 0, string: 2 },
      stringCount: 6,
      labels,
    }),
    "Compás 1, pulso 1, cuerda 4, silencio, negra.",
  );

  const withNote = score([
    { id: "b1", duration: 4, rest: false, notes: [{ string: 0, fret: 3 }] },
  ]);
  assert.equal(
    announceSelection({
      score: withNote,
      selection: { bar: 0, beat: 0, string: 4 },
      stringCount: 6,
      labels,
    }),
    "Compás 1, pulso 1, cuerda 2, sin nota, negra.",
  );
});

test("announces an empty beat differently from a rest", () => {
  const state = score([
    { id: "b1", duration: 4, rest: false, empty: true, notes: [] },
  ]);

  assert.equal(
    announceSelection({
      score: state,
      selection: { bar: 0, beat: 0, string: 2 },
      stringCount: 6,
      labels,
    }),
    "Compás 1, pulso 1, cuerda 4, vacío, negra.",
  );
});

test("announces nothing selected", () => {
  assert.equal(
    announceSelection({
      score: createEmptyScore(),
      selection: null,
      stringCount: 6,
      labels,
    }),
    "Sin selección",
  );
});

test("describes every duration with dots and subdivisions", () => {
  assert.equal(describeBeatDuration({ duration: 1 }, labels), "redonda");
  assert.equal(describeBeatDuration({ duration: 2 }, labels), "blanca");
  assert.equal(describeBeatDuration({ duration: 4 }, labels), "negra");
  assert.equal(describeBeatDuration({ duration: 16 }, labels), "semicorchea");
  assert.equal(describeBeatDuration({ duration: 32 }, labels), "fusa");
  assert.equal(describeBeatDuration({ duration: 64 }, labels), "semifusa");
  assert.equal(
    describeBeatDuration({ duration: 4, dots: 1, tuplet: 3 }, labels),
    "negra con puntillo tresillo",
  );
});

test("names every subdivision", () => {
  const names = [
    [3, "tresillo"],
    [5, "quintillo"],
    [6, "seisillo"],
    [7, "septillo"],
    [9, "nonillo"],
    [10, "decimillo"],
    [12, "doceavo"],
  ];

  for (const [tuplet, name] of names) {
    assert.equal(
      describeBeatDuration({ duration: 8, tuplet }, labels),
      `corchea ${name}`,
    );
  }
});

test("announces the marks of the selected beat and bar", () => {
  const state = {
    bars: [
      {
        id: "bar-a",
        timeSignature: { numerator: 4, denominator: 4 },
        section: "Intro",
        repeat: { start: true },
        pickup: true,
        beats: [
          {
            id: "b1",
            duration: 4,
            rest: false,
            notes: [{ string: 0, fret: 3 }],
            dynamic: "mf",
            text: "let it ring",
            chord: "Em",
            stroke: "up",
            fermata: true,
            grace: { fret: 2, timing: "on" },
          },
        ],
      },
    ],
  };

  const text = announceSelection({
    score: state,
    selection: { bar: 0, beat: 0, string: 0 },
    stringCount: 6,
    labels,
  });

  assert.match(text, /mf/);
  assert.match(text, /texto: let it ring/);
  assert.match(text, /acorde: Em/);
  assert.match(text, /púa arriba/);
  assert.match(text, /calderón/);
  assert.match(text, /apoyatura 2 sobre/);
  assert.match(text, /sección: Intro/);
  assert.match(text, /abre repetición/);
  assert.match(text, /anacrusa/);
});
