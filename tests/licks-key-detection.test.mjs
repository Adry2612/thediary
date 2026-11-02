import assert from "node:assert/strict";
import test from "node:test";
import { detectScoreKey, detectTabKey } from "../src/utils/licks/key-detection.ts";

function tab(notes, tuning = "EADGBE") {
  return { tuning, measures: 2, subdivision: 8, notes };
}

function note(string, fret, column, extra = {}) {
  return { string, fret, column, ...extra };
}

test("detecta menor y mayor por el peso de la frase", () => {
  assert.equal(
    detectTabKey(
      tab([
        note(0, 0, 0),
        note(0, 3, 1),
        note(0, 5, 2),
        note(0, 7, 3),
        note(0, 10, 4),
        note(0, 12, 5),
      ]),
    ),
    "Em",
  );
  assert.equal(
    detectTabKey(
      tab([
        note(0, 8, 0),
        note(0, 10, 1),
        note(0, 12, 2),
        note(0, 13, 3),
        note(0, 15, 4),
        note(0, 17, 5),
        note(0, 19, 6),
      ]),
    ),
    "C",
  );
  assert.equal(
    detectTabKey(
      tab([
        note(0, 5, 0),
        note(0, 7, 1),
        note(0, 8, 2),
        note(0, 10, 3),
        note(0, 12, 4),
        note(0, 13, 5),
        note(0, 15, 6),
      ]),
    ),
    "Am",
  );
});

test("respeta la afinación alternativa", () => {
  assert.equal(
    detectTabKey(
      tab(
        [
          note(0, 0, 0),
          note(0, 3, 1),
          note(0, 5, 2),
          note(0, 7, 3),
          note(0, 8, 4),
          note(0, 10, 5),
        ],
        "DADGBE",
      ),
    ),
    "Dm",
  );
});

test("no adivina con muy pocas notas y descarta las notas muertas", () => {
  assert.equal(detectTabKey(tab([note(0, 0, 0), note(0, 3, 1)])), null);
  assert.equal(
    detectTabKey(
      tab([
        note(0, 0, 0, { dead: true }),
        note(0, 3, 1, { dead: true }),
        note(0, 5, 2, { dead: true }),
      ]),
    ),
    null,
  );
});

function score(frets, tuning = "EADGBE") {
  return {
    tuning,
    bars: [
      {
        id: "bar-a",
        beats: frets.map((fret, index) => ({
          id: `b${index}`,
          duration: 4,
          rest: false,
          notes: [{ string: 0, fret }],
        })),
      },
    ],
  };
}

test("detecta tonalidad desde la partitura visual", () => {
  assert.equal(detectScoreKey(score([5, 7, 8, 10, 12, 13, 15])), "Am");
  assert.equal(detectScoreKey(score([8, 10, 12, 13, 15, 17, 19])), "C");
});

test("la detección de partitura respeta la afinación y las notas muertas", () => {
  assert.equal(detectScoreKey(score([0, 3, 5, 7, 8, 10], "DADGBE")), "Dm");

  assert.equal(
    detectScoreKey({
      tuning: "EADGBE",
      bars: [
        {
          id: "bar-a",
          beats: [
            { id: "b0", duration: 4, rest: false, notes: [{ string: 0, fret: 0, dead: true }] },
            { id: "b1", duration: 4, rest: false, notes: [{ string: 0, fret: 3, dead: true }] },
            { id: "b2", duration: 4, rest: false, notes: [{ string: 0, fret: 5, dead: true }] },
          ],
        },
      ],
    }),
    null,
  );
});

test("no adivina desde la partitura con pocas notas o clases", () => {
  assert.equal(detectScoreKey(score([5, 7])), null);
  assert.equal(detectScoreKey(score([5, 5, 5])), null);
  assert.equal(detectScoreKey(score([5, 7, 8], "XYZ")), null);
});
