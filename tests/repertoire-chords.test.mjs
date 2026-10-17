import assert from "node:assert/strict";
import test from "node:test";
import {
  CHORD_ROOTS,
  CHORD_TYPES,
  EDITING_WINDOW_SIZE,
  MAX_EDITING_FRET,
  detectChordName,
  findSavedChord,
  findVoicingIndex,
  getCanonicalRoot,
  getChordLibrary,
  getChordShape,
  getChordVoicings,
  getEditingWindowStart,
  getFretWindow,
  getGeneratedChordShape,
  getGeneratedChordVoicings,
  getMaxEditingWindowStart,
  isSameChord,
  parseChordName,
  parseTuningNotes,
  resolveChordShape,
  toggleChordFret,
  formatChordName,
} from "../src/lib/chords.ts";

test("resolves the shape of a known chord", () => {
  const shape = getChordShape("C");
  assert.deepEqual(shape.frets, [null, 3, 2, 0, 1, 0]);
  assert.equal(shape.baseFret, 1);
});

test("returns undefined for an unknown chord", () => {
  assert.equal(getChordShape("Hmaj9"), undefined);
});

test("fret window keeps the used frets plus context", () => {
  assert.deepEqual(getFretWindow(getChordShape("F")), { start: 1, count: 4 });
  assert.deepEqual(getFretWindow(getChordShape("A")), { start: 1, count: 3 });
  assert.deepEqual(getFretWindow(getChordShape("C#m")), { start: 3, count: 5 });
});

test("toggles a fret on a single string", () => {
  const shape = getChordShape("C");
  const withFifth = toggleChordFret(shape, 0, 5);
  assert.equal(withFifth.frets[0], 5);
  assert.equal(withFifth.baseFret, 1);
  const cleared = toggleChordFret(withFifth, 0, 5);
  assert.equal(cleared.frets[0], null);
});

test("parses tuning strings, falling back to standard", () => {
  assert.deepEqual(parseTuningNotes("Drop D (DADGBE)"), [
    "D", "A", "D", "G", "B", "E",
  ]);
  assert.deepEqual(parseTuningNotes(), ["E", "A", "D", "G", "B", "E"]);
  assert.deepEqual(parseTuningNotes("Otra..."), ["E", "A", "D", "G", "B", "E"]);
});

test("the library exposes shapes ready to draw", () => {
  const library = getChordLibrary();
  assert.ok(library.length > 30);
  assert.ok(library.every(({ shape }) => shape.frets.length === 6));
});

test("parses a known chord into root, type and pitch class", () => {
  const parsed = parseChordName("C#m7");
  assert.equal(parsed.root, "C#");
  assert.equal(parsed.type, "m7");
  assert.equal(parsed.pitchClass, 1);
});

test("returns null for a chord outside the vocabulary", () => {
  assert.equal(parseChordName("Cadd9"), null);
  assert.equal(parseChordName("Hmaj9"), null);
  assert.equal(parseChordName("N.C."), null);
});

test("an enharmonic pair resolves to the same identity", () => {
  const flat = parseChordName("Db7");
  const sharp = parseChordName("C#7");
  assert.equal(flat.identity, sharp.identity);
  assert.equal(flat.pitchClass, sharp.pitchClass);
  assert.equal(flat.root, "Db");
  assert.equal(sharp.root, "C#");
  assert.equal(getCanonicalRoot(flat.pitchClass), "C#");
});

test("covers every root and type of the vocabulary", () => {
  assert.equal(CHORD_ROOTS.length, 12);
  assert.equal(CHORD_TYPES.length, 7);
  for (const { root, pitchClass } of CHORD_ROOTS) {
    for (const { type, suffix } of CHORD_TYPES) {
      const parsed = parseChordName(`${root}${suffix}`);
      assert.ok(parsed, `${root}${suffix} should parse`);
      assert.equal(parsed.type, type);
      assert.equal(parsed.pitchClass, pitchClass);
    }
  }
});

test("formats a name from a root and a type", () => {
  assert.equal(formatChordName("C#", "m7"), "C#m7");
  assert.equal(formatChordName("C", "major"), "C");
  assert.equal(formatChordName("Ab", "sus4"), "Absus4");
});

test("prefers the library shape when the chord exists", () => {
  assert.deepEqual(resolveChordShape("C"), getChordShape("C"));
  assert.equal(resolveChordShape("C").frets[1], 3);
});

test("prefers the user's saved chord over the library", () => {
  const saved = [
    { id: "saved-1", name: "C", shape: { frets: [0, 3, 2, 0, 1, 3], baseFret: 1 } },
  ];

  assert.deepEqual(resolveChordShape("C", saved).frets, [0, 3, 2, 0, 1, 3]);
});

test("matches a saved chord by enharmonic identity", () => {
  const saved = [
    { id: "saved-1", name: "Db7", shape: { frets: [null, 4, 6, 4, 6, 4], baseFret: 4 } },
  ];

  assert.deepEqual(resolveChordShape("C#7", saved).frets, [null, 4, 6, 4, 6, 4]);
});

test("generates a shape for a combination missing from the library", () => {
  const shape = resolveChordShape("Abmaj7");

  assert.ok(shape);
  assert.equal(shape.frets.length, 6);
  assert.deepEqual(shape, resolveChordShape("G#maj7"));
});

test("every root and type resolves to a shape", () => {
  for (const { root } of CHORD_ROOTS) {
    for (const { suffix } of CHORD_TYPES) {
      const shape = resolveChordShape(`${root}${suffix}`);
      assert.ok(shape, `${root}${suffix} should resolve`);
      assert.equal(shape.frets.length, 6);
    }
  }
});

test("the generator stays within reachable frets", () => {
  const shape = getGeneratedChordShape(8, "major");
  assert.ok(shape.frets.every((fret) => fret === null || (fret >= 1 && fret <= 12)));
});

function lowestFret(shape) {
  const played = shape.frets.filter(
    (fret) => typeof fret === "number" && fret > 0,
  );
  return played.length > 0 ? Math.min(...played) : 0;
}

test("offers several generated positions ordered from low to high", () => {
  const voicings = getGeneratedChordVoicings(0, "major");

  assert.ok(voicings.length >= 2);
  const positions = voicings.map(lowestFret);
  assert.deepEqual(positions, [...positions].sort((left, right) => left - right));
});

test("generated voicings do not repeat a shape", () => {
  const voicings = getGeneratedChordVoicings(7, "major");
  const keys = voicings.map((shape) => shape.frets.join(","));
  assert.equal(new Set(keys).size, keys.length);
});

test("the editing window frames the shape", () => {
  assert.equal(
    getEditingWindowStart({ frets: [null, null, null, null, null, null], baseFret: 1 }),
    1,
  );
  assert.equal(getEditingWindowStart(getChordShape("C")), 1);
  assert.equal(getEditingWindowStart(getChordShape("F")), 1);
  assert.equal(getEditingWindowStart(getChordShape("Eb")), 5);
  assert.equal(
    getEditingWindowStart({
      frets: [11, null, null, null, null, 15],
      baseFret: 11,
    }),
    getMaxEditingWindowStart(),
  );
  assert.equal(EDITING_WINDOW_SIZE, 5);
  assert.equal(
    getMaxEditingWindowStart(),
    MAX_EDITING_FRET - EDITING_WINDOW_SIZE + 1,
  );
});

test("every shape of the vocabulary fits in the editing window", () => {
  for (const root of CHORD_ROOTS) {
    for (const { type } of CHORD_TYPES) {
      const name = formatChordName(root.root, type);
      for (const shape of getChordVoicings(name, [])) {
        const played = shape.frets.filter(
          (fret) => typeof fret === "number" && fret > 0,
        );
        if (played.length === 0) continue;
        const label = `${name} ${JSON.stringify(shape.frets)}`;
        const start = getEditingWindowStart(shape);
        assert.ok(start <= Math.min(...played), label);
        assert.ok(start + EDITING_WINDOW_SIZE - 1 >= Math.max(...played), label);
      }
    }
  }
});

test("detects the chord drawn on the fretboard", () => {
  assert.equal(detectChordName(getChordShape("C").frets), "C");
  assert.equal(detectChordName([0, 2, 2, 1, 0, 0]), "E");
  assert.equal(detectChordName([null, 0, 2, 0, 1, 0]), "Am7");
});

test("prefers the name whose root is the lowest sounding note", () => {
  assert.equal(detectChordName([null, 3, 3, 0, 1, 1]), "Csus4");
  assert.equal(detectChordName([null, null, 3, 0, 1, 1]), "Fsus2");
});

test("returns null for shapes outside the vocabulary", () => {
  assert.equal(detectChordName([null, null, null, null, null, null]), null);
  assert.equal(detectChordName([0, null, null, null, null, 0]), null);
  assert.equal(detectChordName([1, 1, 1, 1, 1, 1]), null);
});

test("names library shapes back to their own name", () => {
  for (const { name, shape } of getChordLibrary()) {
    assert.equal(detectChordName(shape.frets), name, name);
  }
});

test("getChordVoicings puts the saved shape first and dedupes", () => {
  const saved = [
    { id: "s1", name: "C", shape: { frets: [0, 3, 2, 0, 1, 3], baseFret: 1 } },
  ];

  const voicings = getChordVoicings("C", saved);

  assert.deepEqual(voicings[0].frets, [0, 3, 2, 0, 1, 3]);
  assert.ok(
    voicings.some(
      (shape) => JSON.stringify(shape.frets) === JSON.stringify([null, 3, 2, 0, 1, 0]),
    ),
  );
  const keys = voicings.map((shape) => shape.frets.join(","));
  assert.equal(new Set(keys).size, keys.length);
});

test("locates a shape inside its own chord's voicings", () => {
  for (const { name, shape } of getChordLibrary()) {
    const voicings = getChordVoicings(name, []);
    const index = findVoicingIndex(shape, voicings);
    assert.ok(index >= 0, `${name} no aparece en sus posiciones`);
    assert.deepEqual(voicings[index].frets, shape.frets, name);
  }
});

test("returns -1 when the shape is none of the voicings", () => {
  const voicings = getChordVoicings("A", []);
  assert.equal(findVoicingIndex({ frets: [1, 3, 3, 2, 1, 1] }, voicings), -1);
  assert.equal(findVoicingIndex(undefined, voicings), -1);
  assert.equal(findVoicingIndex(voicings[0], []), -1);
});

test("ignores the base fret when locating a shape", () => {
  const voicings = getChordVoicings("A", []);
  assert.equal(
    findVoicingIndex({ frets: voicings[1].frets, baseFret: 12 }, voicings),
    1,
  );
});

test("finds a saved chord by exact name", () => {
  const saved = [{ id: "s1", name: "Cadd9", shape: { frets: [null, 3, 2, 0, 3, 0] } }];
  assert.equal(findSavedChord("Cadd9", saved).id, "s1");
  assert.equal(findSavedChord("Cmaj9", saved), undefined);
});

test("finds a saved chord by enharmonic identity", () => {
  const saved = [{ id: "s1", name: "Db7", shape: { frets: [null, 4, 6, 4, 6, 4] } }];
  assert.equal(findSavedChord("C#7", saved).id, "s1");
  assert.equal(findSavedChord("D7", saved), undefined);
});

test("treats enharmonic chords as the same when saving", () => {
  const shape = { frets: [null, 3, 2, 0, 1, 0] };
  assert.equal(isSameChord({ id: "a", name: "Db7", shape }, { id: "b", name: "C#7", shape }), true);
  assert.equal(isSameChord({ id: "a", name: "Cadd9", shape }, { id: "b", name: "Cadd9", shape }), true);
  assert.equal(isSameChord({ id: "a", name: "Cadd9", shape }, { id: "b", name: "Cmaj9", shape }), false);
  assert.equal(isSameChord({ id: "a", name: "D7", shape }, { id: "b", name: "C#7", shape }), false);
});
