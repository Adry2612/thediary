import assert from "node:assert/strict";
import test from "node:test";
import * as alphaTab from "@coderline/alphatab";
import {
  buildTabAlphaTex,
  midiToNoteName,
} from "../src/lib/tab-alphatex.ts";
import {
  getTabColumnSeconds,
  getTabTuningMidi,
  pitchClassToMidi,
} from "../src/lib/tab-playback.ts";

function tab(overrides = {}) {
  return {
    tuning: "EADGBE",
    measures: 1,
    subdivision: 4,
    notes: [],
    ...overrides,
  };
}

test("calcula la altura MIDI de afinaciones estándar y alternativas", () => {
  assert.deepEqual(getTabTuningMidi("EADGBE"), [40, 45, 50, 55, 59, 64]);
  assert.deepEqual(getTabTuningMidi("DADGBE"), [38, 45, 50, 55, 59, 64]);
  assert.deepEqual(getTabTuningMidi("DADGAD"), [38, 45, 50, 55, 57, 62]);
  assert.equal(pitchClassToMidi(4, 40), 40);
  assert.equal(midiToNoteName(40), "E2");
  assert.equal(midiToNoteName(64), "E4");
});

test("convierte resolución y BPM en segundos por columna", () => {
  assert.equal(getTabColumnSeconds(tab(), 120), 0.5);
  assert.equal(getTabColumnSeconds(tab({ subdivision: 16 }), 120), 0.125);
  assert.equal(getTabColumnSeconds(tab({ subdivision: 8 }), 120), 0.25);
});

test("genera compases, silencios y notas con la afinación de la tablatura", () => {
  const tex = buildTabAlphaTex(
    tab({
      notes: [
        { string: 0, fret: 3, column: 0 },
        { string: 5, fret: 5, column: 2, palmMute: true, letRing: true },
      ],
    }),
    90,
  );

  assert.match(tex, /\\tempo \(90\)/);
  assert.match(tex, /\\ts \(4 4\)/);
  assert.match(tex, /\\tuning \(E4 B3 G3 D3 A2 E2\)/);
  assert.match(tex, /:4 3\.1 r\.4 :4 5\.6\{pm lr\} r\.4/);
});

test("marca los ligados en la nota de origen y respeta las técnicas", () => {
  const tex = buildTabAlphaTex(
    tab({
      notes: [
        { string: 0, fret: 3, column: 0 },
        { string: 0, fret: 5, column: 1, legato: "hammer" },
        {
          string: 1,
          fret: 7,
          column: 2,
          harmonic: "natural",
          vibrato: "wide",
          bend: { semitones: 2 },
        },
      ],
    }),
    120,
  );

  assert.match(tex, /3\.1\{h\}/);
  assert.match(tex, /7\.2\{vw nh b \(0 2\)\}/);
});

test("las técnicas de la tablatura se traducen a AlphaTex válido", () => {
  const importer = new alphaTab.importer.AlphaTexImporter();
  const settings = new alphaTab.Settings();
  importer.initFromString(
    buildTabAlphaTex(
      tab({
        subdivision: 8,
        measures: 2,
        notes: [
          { string: 0, fret: 3, column: 0, palmMute: true, letRing: true },
          { string: 0, fret: 5, column: 1, legato: "hammer" },
          { string: 1, fret: 7, column: 2, slide: "up", tapping: true },
          { string: 2, fret: 9, column: 3, slap: true, pop: true },
          { string: 3, fret: 10, column: 4, tremoloPicking: true },
          { string: 4, fret: 12, column: 5, trill: true },
          {
            string: 5,
            fret: 15,
            column: 6,
            bend: { semitones: 1 },
            vibrato: "wide",
            harmonic: "pinch",
          },
        ],
      }),
      100,
    ),
    settings,
  );

  assert.doesNotThrow(() => importer.readScore());
  assert.equal(
    [...importer.semanticDiagnostics].filter(
      (diagnostic) => diagnostic.severity === alphaTab.alphaTex.AlphaTexDiagnosticsSeverity.Error,
    ).length,
    0,
  );
});

test("la partitura generada se puede importar y usa guitarra acústica", () => {
  const importer = new alphaTab.importer.AlphaTexImporter();
  const settings = new alphaTab.Settings();
  importer.initFromString(
    buildTabAlphaTex(
      tab({
        notes: [
          { string: 0, fret: 0, column: 0 },
          { string: 5, fret: 3, column: 2 },
        ],
      }),
      100,
    ),
    settings,
  );
  const score = importer.readScore();
  const staff = score.tracks[0].staves[0];

  assert.equal(score.tempo, 100);
  assert.equal(score.tracks[0].playbackInfo.program, 25);
  assert.equal(staff.bars.length, 1);
  assert.equal(
    staff.bars[0].voices[0].beats.reduce(
      (total, beat) => total + beat.notes.length,
      0,
    ),
    2,
  );
});
