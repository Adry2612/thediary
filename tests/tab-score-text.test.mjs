import assert from "node:assert/strict";
import test from "node:test";
import { createEmptyScore, normalizeTabScore } from "../src/utils/tab-score/model.ts";
import { scoreToText } from "../src/utils/tab-score/text.ts";

test("describes an empty score", () => {
  const text = scoreToText(createEmptyScore());

  assert.equal(text, "Compás 1 (4/4)\n  Pulso 1: 1/1, silencio");
});

test("describes chords, durations, rests, tempo changes and techniques", () => {
  const score = {
    version: 2,
    tuning: "EADGBE",
    tempo: 90,
    bars: [
      {
        id: "bar-a",
        timeSignature: { numerator: 4, denominator: 4 },
        beats: [
          {
            id: "beat-a",
            duration: 4,
            notes: [
              { string: 0, fret: 3, legato: "hammer", palmMute: true },
              { string: 2, fret: 5 },
            ],
          },
          { id: "beat-b", duration: 8, dots: 1, rest: true, notes: [] },
        ],
      },
      {
        id: "bar-b",
        tempo: 120,
        beats: [
          {
            id: "beat-c",
            duration: 2,
            tuplet: 3,
            notes: [{ string: 5, fret: 7, bend: { semitones: 1, release: true } }],
          },
        ],
      },
    ],
  };

  const text = scoreToText(score);
  const lines = text.split("\n");

  assert.equal(lines[0], "Compás 1 (4/4)");
  assert.equal(
    lines[1],
    "  Pulso 1: 1/4, cuerda 1 traste 3 (ligado (hammer-on), palm mute), cuerda 3 traste 5",
  );
  assert.equal(lines[2], "  Pulso 2: 1/8 con puntillo, silencio");
  assert.equal(lines[3], "Compás 2 (4/4) · tempo 120");
  assert.equal(
    lines[4],
    "  Pulso 1: 1/2 (tresillo), cuerda 6 traste 7 (bend de 1 tono con liberación)",
  );
});

test("does not include ids and is stable for the same content", () => {
  const first = scoreToText(createEmptyScore());
  const second = scoreToText(createEmptyScore());

  assert.equal(first, second);
  assert.equal(first.includes("beat-"), false);
  assert.equal(first.includes("bar-"), false);
});

test("text is unchanged after normalizing the same score", () => {
  const raw = {
    version: 2,
    tuning: "EADGBE",
    tempo: 90,
    bars: [
      {
        id: "bar-a",
        beats: [
          {
            id: "beat-a",
            duration: 4,
            notes: [{ string: 1, fret: 3, vibrato: "wide" }],
          },
        ],
      },
    ],
  };

  assert.equal(scoreToText(normalizeTabScore(raw)), scoreToText(raw));
});
