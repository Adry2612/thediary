import assert from "node:assert/strict";
import test from "node:test";
import { buildAlphaTex, tuningToAlphaTexNotes, tuningToMidi } from "../src/utils/tab-score/alphatex.ts";
import { createEmptyScore } from "../src/utils/tab-score/model.ts";
import { getBeatTicks } from "../src/utils/tab-score/ticks.ts";

function beat(overrides = {}) {
  return { id: "beat-a", duration: 4, rest: true, notes: [], ...overrides };
}

function score(bars, overrides = {}) {
  return {
    version: 2,
    tuning: "EADGBE",
    tempo: 90,
    bars,
    ...overrides,
  };
}

test("writes the empty score as a whole-bar rest in a tab staff", () => {
  assert.equal(
    buildAlphaTex(createEmptyScore()),
    "\\staff {tabs}\n\\tempo 90\n.\n\\ts (4 4)\n:1 r |",
  );
});

test("writes durations, dots, triplets and rests", () => {
  const tex = buildAlphaTex(
    score([
      {
        id: "bar-a",
        timeSignature: { numerator: 4, denominator: 4 },
        beats: [
          beat({
            id: "b1",
            duration: 8,
            rest: false,
            notes: [{ string: 0, fret: 3 }],
          }),
          beat({ id: "b2", duration: 8, dots: 1, rest: true }),
          beat({ id: "b3", duration: 8, tuplet: 3, rest: true }),
        ],
      },
    ]),
  );

  assert.match(tex, /:8 3\.6\n?/);
  assert.match(tex, /:8 r \{d\}/);
  assert.match(tex, /:8 \{tu 3\} r/);
});

test("moves tie, legato and slide to the previous note", () => {
  const tex = buildAlphaTex(
    score([
      {
        id: "bar-a",
        beats: [
          beat({
            id: "b1",
            duration: 4,
            rest: false,
            notes: [{ string: 0, fret: 3 }],
          }),
          beat({
            id: "b2",
            duration: 4,
            rest: false,
            notes: [
              {
                string: 0,
                fret: 5,
                tie: true,
                legato: "hammer",
                slide: "up",
              },
            ],
          }),
        ],
      },
    ]),
  );

  assert.match(tex, /3\.6\{t h sl\} :4 5\.6/);
});

test("writes every technique of the catalogue", () => {
  const tex = buildAlphaTex(
    score([
      {
        id: "bar-a",
        beats: [
          beat({
            id: "b1",
            duration: 4,
            rest: false,
            notes: [
              {
                string: 0,
                fret: 3,
                ghost: true,
                accent: "heavy",
                bend: { semitones: 1, release: true },
                vibrato: "wide",
                palmMute: true,
                letRing: true,
                tapping: true,
                harmonic: "pinch",
                tremoloPicking: true,
                trill: true,
                slap: true,
                pop: true,
              },
            ],
          }),
          beat({
            id: "b2",
            duration: 4,
            rest: false,
            notes: [{ string: 2, fret: 5, dead: true }],
          }),
        ],
      },
    ]),
  );

  for (const tag of [
    "g",
    "hac",
    "b (0 2 0)",
    "vw",
    "pm",
    "lr",
    "tt",
    "ph 5",
    "tp 3",
    "tr 5",
    "s",
    "p",
  ]) {
    assert.ok(tex.includes(tag), tag);
  }
  assert.ok(tex.includes("x.4"));
});

test("writes the tuning when it is not standard", () => {
  assert.equal(tuningToAlphaTexNotes("EADGBE", 6), null);
  assert.deepEqual(tuningToAlphaTexNotes("DADGAD", 6), [
    "D4",
    "A3",
    "G3",
    "D3",
    "A2",
    "D2",
  ]);
  assert.deepEqual(tuningToAlphaTexNotes("CGCFAD", 6), [
    "D4",
    "A3",
    "F3",
    "C3",
    "G2",
    "C2",
  ]);

  const tex = buildAlphaTex(
    score([{ id: "bar-a", beats: [beat({ duration: 1 })] }], {
      tuning: "DADGAD",
    }),
  );
  assert.ok(tex.includes("\\tuning (D4 A3 G3 D3 A2 D2)"));
});

test("converts standard and alternative tunings to MIDI", () => {
  assert.deepEqual(tuningToMidi("EADGBE", 6), [40, 45, 50, 55, 59, 64]);
  assert.deepEqual(tuningToMidi("DADGAD", 6), [38, 45, 50, 55, 57, 62]);
  assert.deepEqual(tuningToMidi("BEADGBE", 7), [35, 40, 45, 50, 55, 59, 64]);
  assert.equal(tuningToMidi("XYZ", 6), null);
  assert.equal(tuningToMidi("ZZZZZZ", 6), null);
});

test("writes an empty beat as an empty beat, not a rest", () => {
  const tex = buildAlphaTex(
    score([
      {
        id: "bar-a",
        beats: [
          beat({
            id: "b1",
            duration: 4,
            rest: false,
            notes: [{ string: 0, fret: 3 }],
          }),
          beat({ id: "b2", duration: 4, rest: true }),
          beat({ id: "b3", duration: 4, rest: false, empty: true }),
        ],
      },
    ]),
  );

  assert.match(tex, /:4 r :4 \(\) \|$/);
  assert.doesNotMatch(tex, /:4 r :4 r/);
});

test("the generated AlphaTex round-trips through the alphaTab importer", async () => {
  const alphaTab = await import("@coderline/alphatab");
  const model = score(
    [
      {
        id: "bar-a",
        timeSignature: { numerator: 4, denominator: 4 },
        beats: [
          beat({
            id: "b1",
            duration: 4,
            rest: false,
            notes: [{ string: 0, fret: 3, palmMute: true }],
          }),
          beat({
            id: "b2",
            duration: 8,
            dots: 1,
            rest: false,
            notes: [
              { string: 2, fret: 5, ghost: true },
              { string: 5, fret: 7, accent: "heavy" },
            ],
          }),
          beat({ id: "b3", duration: 8, tuplet: 3, rest: true }),
          beat({ id: "b3b", duration: 4, rest: false, empty: true }),
        ],
      },
      {
        id: "bar-b",
        tempo: 120,
        beats: [
          beat({
            id: "b4",
            duration: 4,
            rest: false,
            notes: [{ string: 1, fret: 5 }],
          }),
          beat({
            id: "b5",
            duration: 4,
            rest: false,
            notes: [{ string: 1, fret: 7, legato: "hammer", vibrato: "wide" }],
          }),
        ],
      },
    ],
  );

  const importer = new alphaTab.importer.AlphaTexImporter();
  importer.initFromString(buildAlphaTex(model), new alphaTab.Settings());
  const parsed = importer.readScore();

  assert.equal(parsed.masterBars.length, 2);
  assert.equal(parsed.masterBars[1].tempoAutomations[0].value, 120);

  const firstBar = parsed.tracks[0].staves[0].bars[0].voices[0].beats;
  assert.equal(firstBar[0].playbackDuration, getBeatTicks(model.bars[0].beats[0]));
  assert.equal(firstBar[1].playbackDuration, getBeatTicks(model.bars[0].beats[1]));
  assert.equal(firstBar[2].playbackDuration, getBeatTicks(model.bars[0].beats[2]));
  assert.equal(firstBar[2].isRest, true);

  assert.equal(firstBar[3].playbackDuration, getBeatTicks(model.bars[0].beats[3]));
  assert.equal(firstBar[3].isRest, true);
  assert.equal(firstBar[3].notes.length, 0);

  assert.equal(firstBar[0].notes[0].string, 1);
  assert.equal(firstBar[0].notes[0].fret, 3);
  assert.equal(firstBar[0].notes[0].isPalmMute, true);

  const chord = firstBar[1].notes;
  assert.equal(chord.find((note) => note.fret === 5).string, 3);
  assert.equal(chord.find((note) => note.fret === 5).isGhost, true);
  assert.equal(chord.find((note) => note.fret === 7).string, 6);
  assert.equal(chord.find((note) => note.fret === 7).accentuated, 2);

  const secondBar = parsed.tracks[0].staves[0].bars[1].voices[0].beats;
  assert.equal(secondBar[0].notes[0].isHammerPullOrigin, true);
  assert.equal(secondBar[1].notes[0].vibrato, 2);
});

test("writes the expression marks of a beat in one property block", () => {
  const tex = buildAlphaTex(
    score([
      {
        id: "bar-a",
        beats: [
          beat({
            duration: 4,
            rest: false,
            notes: [
              { string: 0, fret: 3 },
              { string: 1, fret: 5 },
            ],
            dynamic: "mf",
            hairpin: "crescendo",
            text: "let it ring",
            chord: "Em",
            stroke: "down",
            fermata: true,
            grace: { fret: 2, timing: "before" },
          }),
        ],
      },
    ]),
  );

  assert.match(tex, /\\chord \("Em" 0 2 2 0 0 0\)/);
  assert.match(tex, /:32 2\.6 \{gr\}/);
  assert.match(tex, /\{dy mf cre txt "let it ring" ch "Em" bd fermata medium 0\}/);
});

test("writes repeats, endings, sections and a pickup", () => {
  const tex = buildAlphaTex(
    score([
      {
        id: "bar-a",
        section: "Intro",
        repeat: { start: true },
        pickup: true,
        beats: [beat()],
      },
      {
        id: "bar-b",
        repeat: { end: 3 },
        endings: [1, 2],
        beats: [beat()],
      },
    ]),
  );

  assert.match(tex, /\\ro/);
  assert.match(tex, /\\rc 3/);
  assert.match(tex, /\\ae \(1 2\)/);
  assert.match(tex, /\\section "Intro"/);
  assert.match(tex, /\\ac/);
});

test("an unknown chord only keeps its name on the beat", () => {
  const tex = buildAlphaTex(
    score([
      {
        id: "bar-a",
        beats: [beat({ duration: 4, chord: "Hm7b5" })],
      },
    ]),
  );

  assert.doesNotMatch(tex, /\\chord/);
  assert.match(tex, /\{ch "Hm7b5"\}/);
});

test("the new marks round-trip through the alphaTab importer", async () => {
  const alphaTab = await import("@coderline/alphatab");
  const model = score([
    {
      id: "bar-a",
      timeSignature: { numerator: 4, denominator: 4 },
      section: "Intro",
      repeat: { start: true },
      pickup: true,
      beats: [
        beat({
          id: "b1",
          duration: 4,
          rest: false,
          notes: [
            { string: 0, fret: 3 },
            { string: 1, fret: 5 },
          ],
          dynamic: "mf",
          hairpin: "crescendo",
          text: "let it ring",
          chord: "Em",
          stroke: "down",
          fermata: true,
          grace: { fret: 2, timing: "before" },
        }),
        beat({ id: "b2", duration: 4, rest: true }),
      ],
    },
    {
      id: "bar-b",
      repeat: { end: 2 },
      beats: [
        beat({
          id: "b3",
          duration: 4,
          rest: false,
          notes: [{ string: 1, fret: 5 }],
          dynamic: "f",
          hairpin: "decrescendo",
        }),
      ],
    },
    {
      id: "bar-c",
      endings: [1, 2],
      beats: [
        beat({
          id: "b4",
          duration: 4,
          rest: false,
          notes: [{ string: 0, fret: 3 }],
          grace: { fret: 4, timing: "on" },
        }),
      ],
    },
  ]);

  const importer = new alphaTab.importer.AlphaTexImporter();
  importer.initFromString(buildAlphaTex(model), new alphaTab.Settings());
  const parsed = importer.readScore();

  assert.equal(parsed.masterBars[0].isRepeatStart, true);
  assert.equal(parsed.masterBars[0].section.text, "Intro");
  assert.equal(parsed.masterBars[0].isAnacrusis, true);
  assert.equal(parsed.masterBars[1].isRepeatEnd, true);
  assert.equal(parsed.masterBars[1].repeatCount, 2);
  assert.equal(parsed.masterBars[2].alternateEndings, 3);

  const beats = parsed.tracks[0].staves[0].bars[0].voices[0].beats;
  const marked = beats.find((entry) => entry.text === "let it ring");
  assert.equal(marked.dynamics, alphaTab.model.DynamicValue.MF);
  assert.equal(marked.crescendo, alphaTab.model.CrescendoType.Crescendo);
  assert.equal(marked.text, "let it ring");
  assert.equal(marked.chord.name, "Em");
  assert.equal(marked.brushType, alphaTab.model.BrushType.BrushDown);
  assert.equal(marked.fermata.type, alphaTab.model.FermataType.Medium);

  const graceBeat = beats.find(
    (entry) => entry.graceType === alphaTab.model.GraceType.BeforeBeat,
  );
  assert.ok(graceBeat);
  assert.equal(graceBeat.notes[0].fret, 2);

  const secondBar = parsed.tracks[0].staves[0].bars[1].voices[0].beats;
  assert.equal(secondBar[0].dynamics, alphaTab.model.DynamicValue.F);
  assert.equal(secondBar[0].crescendo, alphaTab.model.CrescendoType.Decrescendo);

  const thirdBar = parsed.tracks[0].staves[0].bars[2].voices[0].beats;
  const onBeatGrace = thirdBar.find(
    (entry) => entry.graceType === alphaTab.model.GraceType.OnBeat,
  );
  assert.ok(onBeatGrace);
  assert.equal(onBeatGrace.notes[0].fret, 4);
});

test("omits the chord diagrams when a preview asks for them to be off", () => {
  const value = score([
    {
      id: "bar-a",
      beats: [beat({ duration: 4, chord: "Em" })],
    },
  ]);

  const full = buildAlphaTex(value);
  const preview = buildAlphaTex(value, { chordDiagrams: false });

  assert.match(full, /\\chord \("Em" 0 2 2 0 0 0\)/);
  assert.doesNotMatch(preview, /\\chord/);
  assert.match(preview, /\{ch "Em"\}/);
});
