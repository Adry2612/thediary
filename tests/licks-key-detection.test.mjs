import assert from "node:assert/strict";
import test from "node:test";
import * as alphaTab from "@coderline/alphatab";
import {
  estimateKey,
  extractGuitarProNotes,
  extractPitchesFromScore,
  midiNoteName,
} from "../src/utils/licks/key-detection.ts";

const STANDARD_TUNING = [64, 59, 55, 50, 45, 40];

function note(string, fret, overrides = {}) {
  return {
    isStringed: true,
    isPercussion: false,
    isDead: false,
    isHammerPullOrigin: false,
    slideInType: 0,
    slideOutType: 0,
    bendType: 0,
    vibrato: 0,
    string,
    fret,
    realValue: 0,
    ...overrides,
  };
}

function track(notes, staffOverrides = {}) {
  return {
    isPercussion: false,
    staves: [
      {
        tuning: STANDARD_TUNING,
        capo: 0,
        transpositionPitch: 0,
        bars: [
          {
            index: 0,
            voices: [
              {
                beats: [
                  {
                    isRest: false,
                    notes,
                  },
                ],
              },
            ],
          },
        ],
        ...staffOverrides,
      },
    ],
  };
}

test("detects minor and major keys by the weight of the phrase", () => {
  assert.equal(estimateKey([40, 43, 45, 47, 50, 52]), "Em");
  assert.equal(estimateKey([48, 50, 52, 53, 55, 57, 59]), "C");
  assert.equal(estimateKey([45, 47, 48, 50, 52, 53, 55]), "Am");
});

test("does not guess with too few notes or pitch classes", () => {
  assert.equal(estimateKey([40, 43]), null);
  assert.equal(estimateKey([40, 40, 40, 40]), null);
});

test("does not mistake A minor or E minor for the first note's key", () => {
  assert.equal(estimateKey([62, 64, 69, 72, 69, 67, 64, 69]), "Am");
  assert.equal(estimateKey([62, 64, 67, 71, 67, 64, 62, 64]), "Em");
  assert.equal(estimateKey([57, 60, 62, 64, 67, 69]), "Am");
  assert.equal(estimateKey([52, 55, 57, 59, 62, 64]), "Em");
  assert.equal(estimateKey([50, 52, 54, 55, 57, 59, 61, 62]), "D");
});

test("detects E minor on a pentatonic lick that starts on A and ends on D", () => {
  assert.equal(
    estimateKey([45, 47, 50, 52, 55, 57, 58, 59, 62]),
    "Em",
  );
});

test("keeps the relative major when the phrase points to it", () => {
  assert.equal(estimateKey([48, 50, 52, 53, 55, 57, 59]), "C");
  assert.equal(estimateKey([43, 45, 47, 48, 50, 52, 54]), "G");
});

test("does not guess with a chromatic scale", () => {
  assert.equal(
    estimateKey([48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59]),
    null,
  );
});

test("extracts the real notes and techniques of an alphaTab score", () => {
  const score = alphaTab.importer.ScoreLoader.loadAlphaTex(
    "\\tempo 90 . :4 0.6 3.6 5.6 7.6 | 10.6 12.6",
  );
  const notes = extractGuitarProNotes(score);

  assert.deepEqual(
    notes.map((entry) => entry.midiNote),
    [40, 43, 45, 47, 50, 52],
  );
  assert.equal(notes[0].noteName, "E2");
  assert.equal(notes[0].measure, 1);
  assert.equal(notes[0].beatIndex, 0);
  assert.equal(notes[0].string, 1);
  assert.equal(notes[0].fret, 0);
  assert.equal(estimateKey(notes.map((entry) => entry.midiNote)), "Em");
});

test("maps the alphaTab tuning order from the lowest string", () => {
  const score = {
    tracks: [track([note(1, 3), note(6, 5)])],
  };
  const [lowE, highE] = extractGuitarProNotes(score);

  assert.equal(lowE.midiNote, 43);
  assert.equal(lowE.noteName, "G2");
  assert.equal(highE.midiNote, 69);
  assert.equal(highE.noteName, "A4");
});

test("applies the capo and returns the requested note shape", () => {
  const score = {
    tracks: [
      track(
        [
          note(1, 3, {
            isHammerPullOrigin: true,
            slideOutType: 1,
            bendType: 2,
          }),
        ],
        { capo: 2 },
      ),
    ],
  };
  const [entry] = extractGuitarProNotes(score);

  assert.deepEqual(entry, {
    measure: 1,
    beatIndex: 0,
    midiNote: 45,
    noteName: "A2",
    string: 1,
    fret: 3,
    techniques: {
      hammerPullOrigin: true,
      slideIn: false,
      slideOut: true,
      bend: true,
      vibrato: false,
      rest: false,
      dead: false,
      percussion: false,
    },
  });
});

test("keeps the measure and beat position across voices and bars", () => {
  const score = {
    tracks: [
      {
        isPercussion: false,
        staves: [
          {
            tuning: STANDARD_TUNING,
            capo: 0,
            transpositionPitch: 0,
            bars: [
              {
                index: 0,
                voices: [
                  {
                    beats: [
                      { isRest: false, notes: [note(1, 0)] },
                      { isRest: false, notes: [note(1, 2)] },
                    ],
                  },
                  {
                    beats: [{ isRest: false, notes: [note(1, 4)] }],
                  },
                ],
              },
              {
                index: 1,
                voices: [
                  {
                    beats: [{ isRest: false, notes: [note(1, 3)] }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
  const entries = extractGuitarProNotes(score);

  assert.deepEqual(
    entries.map((entry) => [entry.measure, entry.beatIndex]),
    [
      [1, 0],
      [1, 1],
      [1, 2],
      [2, 0],
    ],
  );
});

test("ignores dead and percussion notes for key detection", () => {
  const score = {
    tracks: [
      track([
        note(1, 0),
        note(1, 3, { isDead: true }),
        note(1, 5, { isPercussion: true }),
      ]),
    ],
  };

  assert.deepEqual(extractPitchesFromScore(score), [40]);
});

test("uses the first melodic track by default and accepts an explicit index", () => {
  const score = {
    tracks: [
      { isPercussion: true, staves: [] },
      track([note(1, 0), note(1, 3), note(1, 5)]),
      track([note(1, 7)]),
    ],
  };

  assert.deepEqual(extractPitchesFromScore(score), [40, 43, 45]);
  assert.deepEqual(extractPitchesFromScore(score, 2), [47]);
});

test("formats MIDI notes with sharps and scientific octaves", () => {
  assert.equal(midiNoteName(40), "E2");
  assert.equal(midiNoteName(61), "C#4");
  assert.equal(midiNoteName(69), "A4");
});
