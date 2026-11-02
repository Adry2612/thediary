import assert from "node:assert/strict";
import test from "node:test";
import { migrateGridTab } from "../src/utils/tab-score/migration.ts";
import { getBarTicks } from "../src/utils/tab-score/ticks.ts";

function grid(overrides = {}) {
  return {
    tuning: "EADGBE",
    measures: 1,
    subdivision: 4,
    notes: [],
    ...overrides,
  };
}

test("derives each note's duration up to the next note or the bar end", () => {
  const score = migrateGridTab(
    grid({
      notes: [
        { string: 0, column: 0, fret: 3 },
        { string: 1, column: 2, fret: 5 },
      ],
    }),
  );

  assert.equal(score.version, 2);
  assert.equal(score.tempo, 90);
  assert.equal(score.tuning, "EADGBE");
  assert.equal(score.bars.length, 1);
  assert.deepEqual(
    score.bars[0].beats.map((beat) => beat.duration),
    [2, 2],
  );
  assert.equal(getBarTicks(score.bars[0]), 3840);
});

test("fills the gap before the first note with rests", () => {
  const score = migrateGridTab(
    grid({ notes: [{ string: 0, column: 2, fret: 3 }] }),
  );

  assert.equal(score.bars[0].beats[0].rest, true);
  assert.equal(score.bars[0].beats[0].duration, 2);
  assert.equal(score.bars[0].beats[1].duration, 2);
  assert.equal(score.bars[0].beats[1].notes[0].fret, 3);
});

test("groups notes in the same column into one beat", () => {
  const score = migrateGridTab(
    grid({
      notes: [
        { string: 0, column: 0, fret: 3 },
        { string: 2, column: 0, fret: 5 },
        { string: 1, column: 0, fret: 7 },
      ],
    }),
  );

  assert.equal(score.bars[0].beats.length, 1);
  assert.equal(score.bars[0].beats[0].notes.length, 3);
  assert.equal(score.bars[0].beats[0].duration, 1);
});

test("an empty bar becomes a whole-bar rest", () => {
  const score = migrateGridTab(grid({ measures: 2 }));

  assert.equal(score.bars.length, 2);
  for (const bar of score.bars) {
    assert.equal(bar.beats.length, 1);
    assert.equal(bar.beats[0].rest, true);
    assert.equal(bar.beats[0].duration, 1);
  }
});

test("decomposes a duration that is not directly representable", () => {
  const score = migrateGridTab(
    grid({
      subdivision: 16,
      notes: [
        { string: 0, column: 0, fret: 3 },
        { string: 1, column: 3, fret: 5 },
      ],
    }),
  );

  const beats = score.bars[0].beats;
  assert.equal(beats[0].duration, 8);
  assert.equal(beats[0].dots, 1);
  assert.equal(beats[0].notes[0].fret, 3);
  assert.equal(beats[1].duration, 2);
  assert.equal(beats[1].dots, 1);
  assert.equal(beats[2].duration, 16);
  assert.equal(beats[2].rest, true);
  assert.equal(getBarTicks(score.bars[0]), 3840);
});

test("keeps techniques and drops unknown values without losing the note", () => {
  const score = migrateGridTab(
    grid({
      notes: [
        { string: 0, column: 0, fret: 3, palmMute: true, vibrato: "wide" },
        {
          string: 0,
          column: 1,
          fret: 5,
          legato: "hammer",
          bend: { semitones: 1, release: true },
        },
        { string: 2, column: 1, fret: 7 },
        { string: 2, column: 2, fret: 9, legato: "unknown", slide: "up" },
      ],
    }),
  );

  const notes = score.bars[0].beats.flatMap((beat) => beat.notes);
  assert.equal(notes[0].palmMute, true);
  assert.equal(notes[0].vibrato, "wide");
  assert.equal(notes[1].legato, "hammer");
  assert.deepEqual(notes[1].bend, { semitones: 1, release: true });
  assert.equal(notes[3].legato, undefined);
  assert.equal(notes[3].slide, "up");
});

test("migrates three representative grid tabs", () => {
  const pentatonicLick = grid({
    measures: 2,
    subdivision: 8,
    notes: [
      { string: 0, column: 0, fret: 5, palmMute: true },
      { string: 0, column: 1, fret: 8 },
      { string: 1, column: 2, fret: 5 },
      { string: 1, column: 3, fret: 7 },
      { string: 2, column: 8, fret: 5, vibrato: "slight" },
      { string: 2, column: 10, fret: 7, bend: { semitones: 0.5 } },
    ],
  });
  const chordPhrase = grid({
    measures: 1,
    subdivision: 8,
    notes: [
      { string: 0, column: 0, fret: 3 },
      { string: 1, column: 0, fret: 5 },
      { string: 2, column: 0, fret: 5 },
      { string: 0, column: 4, fret: 5, letRing: true },
      { string: 1, column: 4, fret: 7, letRing: true },
    ],
  });
  const emptyLick = grid({ measures: 1, subdivision: 4 });

  for (const tab of [pentatonicLick, chordPhrase, emptyLick]) {
    const score = migrateGridTab(tab);
    assert.equal(score.bars.length, tab.measures);
    for (const bar of score.bars) {
      assert.equal(getBarTicks(bar), 3840, JSON.stringify(tab));
    }
  }

  const pentatonic = migrateGridTab(pentatonicLick);
  assert.equal(
    pentatonic.bars.flatMap((bar) => bar.beats).flatMap((beat) => beat.notes)
      .length,
    6,
  );
  const chords = migrateGridTab(chordPhrase);
  assert.equal(chords.bars[0].beats[0].notes.length, 3);
  assert.equal(chords.bars[0].beats[1].notes.length, 2);
  assert.equal(chords.bars[0].beats[1].notes[0].letRing, true);
});

test("uses the fallback tuning when the grid has none", () => {
  const score = migrateGridTab(
    { ...grid({ notes: [] }), tuning: "" },
    "DADGAD",
  );
  assert.equal(score.tuning, "DADGAD");
});
