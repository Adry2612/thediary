import assert from "node:assert/strict";
import test from "node:test";
import {
  createEmptyBeats,
  createEmptyScore,
  createRestBar,
  normalizeTabScore,
} from "../src/utils/tab-score/model.ts";
import { getBeatTicks } from "../src/utils/tab-score/ticks.ts";

function beat(overrides = {}) {
  return {
    id: "beat-a",
    duration: 4,
    notes: [{ string: 0, fret: 3 }],
    ...overrides,
  };
}

function score(overrides = {}) {
  return {
    version: 2,
    tuning: "EADGBE",
    tempo: 90,
    bars: [{ id: "bar-a", beats: [beat()] }],
    ...overrides,
  };
}

test("empty input creates a 4/4 score with a whole rest", () => {
  const normalized = normalizeTabScore(null);

  assert.equal(normalized.version, 2);
  assert.equal(normalized.tempo, 90);
  assert.equal(normalized.bars.length, 1);
  assert.deepEqual(normalized.bars[0].timeSignature, {
    numerator: 4,
    denominator: 4,
  });
  assert.equal(normalized.bars[0].beats.length, 1);
  assert.equal(normalized.bars[0].beats[0].duration, 1);
  assert.equal(normalized.bars[0].beats[0].rest, true);
  assert.deepEqual(normalized.bars[0].beats[0].notes, []);
});

test("keeps a valid note and its techniques", () => {
  const normalized = normalizeTabScore(
    score({
      bars: [
        {
          id: "bar-a",
          beats: [
            beat({
              duration: 8,
              dots: 1,
              notes: [
                {
                  string: 0,
                  fret: 3,
                  palmMute: true,
                  harmonic: "pinch",
                  bend: { semitones: 1, release: true },
                },
              ],
            }),
          ],
        },
      ],
    }),
  );

  const note = normalized.bars[0].beats[0].notes[0];
  assert.equal(normalized.bars[0].beats[0].duration, 8);
  assert.equal(normalized.bars[0].beats[0].dots, 1);
  assert.equal(note.fret, 3);
  assert.equal(note.palmMute, true);
  assert.equal(note.harmonic, "pinch");
  assert.deepEqual(note.bend, { semitones: 1, release: true });
});

test("drops notes with an out-of-range fret or string", () => {
  const normalized = normalizeTabScore(
    score({
      bars: [
        {
          id: "bar-a",
          beats: [
            beat({ notes: [{ string: 0, fret: 25 }] }),
            beat({ notes: [{ string: 6, fret: 3 }] }),
            beat({ notes: [{ string: 5, fret: 24 }] }),
          ],
        },
      ],
    }),
  );

  assert.equal(normalized.bars[0].beats[0].notes.length, 0);
  assert.equal(normalized.bars[0].beats[0].rest, true);
  assert.equal(normalized.bars[0].beats[1].notes.length, 0);
  assert.equal(normalized.bars[0].beats[2].notes[0].fret, 24);
});

test("drops an unknown technique but keeps the note", () => {
  const normalized = normalizeTabScore(
    score({
      bars: [
        {
          id: "bar-a",
          beats: [
            beat({
              notes: [
                {
                  string: 1,
                  fret: 7,
                  legato: "unknown",
                  palmMute: true,
                  harmonic: "space",
                },
              ],
            }),
          ],
        },
      ],
    }),
  );

  const note = normalized.bars[0].beats[0].notes[0];
  assert.equal(note.fret, 7);
  assert.equal(note.legato, undefined);
  assert.equal(note.harmonic, undefined);
  assert.equal(note.palmMute, true);
});

test("drops an invalid bend amount but keeps the note", () => {
  const normalized = normalizeTabScore(
    score({
      bars: [
        {
          id: "bar-a",
          beats: [beat({ notes: [{ string: 0, fret: 3, bend: { semitones: 3 } }] })],
        },
      ],
    }),
  );

  const note = normalized.bars[0].beats[0].notes[0];
  assert.equal(note.fret, 3);
  assert.equal(note.bend, undefined);
});

test("truncates to 64 bars and keeps at least one", () => {
  const many = Array.from({ length: 65 }, (_, index) => ({
    id: `bar-${index}`,
    beats: [{ id: `beat-${index}`, duration: 4, notes: [] }],
  }));

  assert.equal(normalizeTabScore(score({ bars: many })).bars.length, 64);
  assert.equal(normalizeTabScore(score({ bars: [] })).bars.length, 1);
});

test("a rest removes its notes and a legacy beat without notes is a rest", () => {
  const normalized = normalizeTabScore(
    score({
      bars: [
        {
          id: "bar-a",
          beats: [
            beat({ rest: true, notes: [{ string: 0, fret: 3 }] }),
            beat({ notes: [] }),
          ],
        },
      ],
    }),
  );

  assert.deepEqual(normalized.bars[0].beats[0].notes, []);
  assert.equal(normalized.bars[0].beats[0].rest, true);
  assert.equal(normalized.bars[0].beats[0].empty, undefined);
  assert.equal(normalized.bars[0].beats[1].rest, true);
  assert.equal(normalized.bars[0].beats[1].empty, undefined);
});

test("keeps an explicit empty beat distinct from a rest", () => {
  const normalized = normalizeTabScore(
    score({
      bars: [
        {
          id: "bar-a",
          beats: [
            beat({ empty: true, notes: [] }),
            beat({ rest: true, empty: true, notes: [] }),
          ],
        },
      ],
    }),
  );

  const empty = normalized.bars[0].beats[0];
  assert.equal(empty.rest, false);
  assert.equal(empty.empty, true);
  assert.deepEqual(empty.notes, []);

  const rest = normalized.bars[0].beats[1];
  assert.equal(rest.rest, true);
  assert.equal(rest.empty, undefined);
});

test("a beat with notes never stays empty", () => {
  const normalized = normalizeTabScore(
    score({
      bars: [
        {
          id: "bar-a",
          beats: [beat({ empty: true, notes: [{ string: 1, fret: 5 }] })],
        },
      ],
    }),
  );

  const beatWithNote = normalized.bars[0].beats[0];
  assert.equal(beatWithNote.empty, undefined);
  assert.equal(beatWithNote.rest, false);
  assert.deepEqual(beatWithNote.notes, [{ string: 1, fret: 5 }]);
});

test("createEmptyBeats fills a total with empty beats", () => {
  const beats = createEmptyBeats(2400);

  assert.equal(beats.length, 2);
  assert.deepEqual(
    beats.map((entry) => [entry.duration, entry.rest, entry.empty]),
    [
      [2, false, true],
      [8, false, true],
    ],
  );
  assert.equal(
    beats.reduce((total, entry) => total + getBeatTicks(entry), 0),
    2400,
  );
});

test("clamps the initial tempo and discards an invalid bar tempo change", () => {
  const high = normalizeTabScore(score({ tempo: 500 }));
  const low = normalizeTabScore(score({ tempo: 10 }));
  const barTempo = normalizeTabScore(
    score({
      bars: [
        { id: "bar-a", tempo: 500, beats: [beat()] },
        { id: "bar-b", tempo: 120, beats: [beat()] },
      ],
    }),
  );

  assert.equal(high.tempo, 300);
  assert.equal(low.tempo, 30);
  assert.equal(barTempo.bars[0].tempo, undefined);
  assert.equal(barTempo.bars[1].tempo, 120);
});

test("rejects another version and keeps the fallback tuning", () => {
  const normalized = normalizeTabScore({ ...score(), version: 3 }, "DADGAD");

  assert.equal(normalized.tuning, "DADGAD");
  assert.equal(normalized.bars.length, 1);
  assert.equal(normalized.bars[0].beats[0].rest, true);
});

test("createEmptyScore starts with one 4/4 whole rest", () => {
  const empty = createEmptyScore("DADGAD");

  assert.equal(empty.tuning, "DADGAD");
  assert.equal(empty.tempo, 90);
  assert.equal(empty.bars.length, 1);
  assert.equal(empty.bars[0].beats.length, 1);
  assert.equal(empty.bars[0].beats[0].duration, 1);
  assert.equal(empty.bars[0].beats[0].rest, true);
});

test("createRestBar fills its time signature", () => {
  const bar = createRestBar({ numerator: 3, denominator: 4 });

  assert.equal(bar.beats.length, 1);
  assert.equal(bar.beats[0].duration, 2);
  assert.equal(bar.beats[0].dots, 1);
  assert.equal(bar.timeSignature.numerator, 3);

  const sevenEight = createRestBar({ numerator: 7, denominator: 8 });
  assert.equal(sevenEight.beats.length, 2);
  assert.equal(
    sevenEight.beats.reduce((total, beat) => total + (beat.dots ? 1 : 0), 0),
    1,
  );
});

test("keeps every allowed subdivision and drops unknown ones", () => {
  for (const tuplet of [3, 5, 6, 7, 9, 10, 12]) {
    const normalized = normalizeTabScore({
      version: 2,
      tuning: "EADGBE",
      tempo: 90,
      bars: [{ id: "bar-a", beats: [beat({ tuplet })] }],
    });
    assert.equal(normalized.bars[0].beats[0].tuplet, tuplet);
  }

  const dropped = normalizeTabScore({
    version: 2,
    tuning: "EADGBE",
    tempo: 90,
    bars: [{ id: "bar-a", beats: [beat({ tuplet: 4 })] }],
  });
  assert.equal(dropped.bars[0].beats[0].tuplet, undefined);
  assert.equal(dropped.bars[0].beats[0].duration, 4);
  assert.deepEqual(dropped.bars[0].beats[0].notes, [{ string: 0, fret: 3 }]);
});
