import assert from "node:assert/strict";
import test from "node:test";
import { buildAlphaTex } from "../src/utils/tab-score/alphatex.ts";
import { getEmptyBeats, markEmptyBeats } from "../src/utils/tab-score/render.ts";

function score() {
  return {
    version: 2,
    tuning: "EADGBE",
    tempo: 90,
    bars: [
      {
        id: "bar-a",
        beats: [
          { id: "b1", duration: 4, rest: false, notes: [{ string: 0, fret: 3 }] },
          { id: "b2", duration: 4, rest: true, notes: [] },
          { id: "b3", duration: 4, rest: false, empty: true, notes: [] },
        ],
      },
    ],
  };
}

test("finds the empty beats of a score", () => {
  assert.deepEqual(getEmptyBeats(score()), [{ bar: 0, beat: 2 }]);
  assert.deepEqual(
    getEmptyBeats({
      bars: [
        { beats: [{ notes: [] }, { empty: true, notes: [] }] },
        { beats: [{ empty: true, notes: [] }] },
      ],
    }),
    [
      { bar: 0, beat: 1 },
      { bar: 1, beat: 0 },
    ],
  );
});

test("the imported empty beat is marked empty and its rest figure is transparent", async () => {
  const alphaTab = await import("@coderline/alphatab");
  const importer = new alphaTab.importer.AlphaTexImporter();
  importer.initFromString(buildAlphaTex(score()), new alphaTab.Settings());
  const parsed = importer.readScore();

  markEmptyBeats(alphaTab, parsed, getEmptyBeats(score()));

  const beat = parsed.tracks[0].staves[0].bars[0].voices[0].beats[2];
  assert.equal(beat.isEmpty, true);
  assert.equal(beat.notes.length, 0);
  assert.equal(
    beat.style.colors.get(alphaTab.model.BeatSubElement.GuitarTabRests).a,
    0,
  );
  assert.equal(
    beat.style.colors.get(alphaTab.model.BeatSubElement.StandardNotationRests).a,
    0,
  );

  const rest = parsed.tracks[0].staves[0].bars[0].voices[0].beats[1];
  assert.notEqual(
    rest.style?.colors.get(alphaTab.model.BeatSubElement.GuitarTabRests)?.a,
    0,
  );
});
