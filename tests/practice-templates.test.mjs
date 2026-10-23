import assert from "node:assert/strict";
import test from "node:test";
import {
  getPracticeFileKind,
  isSupportedPracticeAudio,
  normalizeSongsterrUrl,
  validatePracticeTemplate,
} from "../src/utils/practice-templates.ts";

const validPhases = [
  { id: "phase-1", name: "Técnica", durationMinutes: 15, skill: "technique" },
];

test("rejects a blank template name", () => {
  assert.equal(validatePracticeTemplate("  ", validPhases), "name");
});

test("rejects a plan without phases", () => {
  assert.equal(validatePracticeTemplate("Sesión", []), "phases");
});

test("rejects phases with an invalid duration or skill", () => {
  assert.equal(
    validatePracticeTemplate("Sesión", [
      { ...validPhases[0], durationMinutes: 0 },
    ]),
    "phase",
  );
  assert.equal(
    validatePracticeTemplate("Sesión", [
      { ...validPhases[0], skill: "warmup" },
    ]),
    "phase",
  );
});

test("accepts a named plan with valid phases", () => {
  assert.equal(validatePracticeTemplate("Sesión", validPhases), null);
});

test("requires a song for a repertoire block", () => {
  const repertoirePhase = {
    id: "phase-1",
    name: "Canción",
    durationMinutes: 10,
    skill: "repertoire",
  };

  assert.equal(
    validatePracticeTemplate("Sesión", [repertoirePhase]),
    "phase",
  );
  assert.equal(
    validatePracticeTemplate("Sesión", [
      { ...repertoirePhase, repertoireItemId: "song-1" },
    ], {
      repertoireItems: [{ id: "song-1", kind: "song", parts: [] }],
    }),
    null,
  );
});

test("rejects a missing song or part in a repertoire block", () => {
  const phase = {
    id: "phase-1",
    name: "Canción",
    durationMinutes: 10,
    skill: "repertoire",
    repertoireItemId: "missing-song",
  };

  assert.equal(
    validatePracticeTemplate("Sesión", [phase], {
      repertoireItems: [{ id: "song-1", kind: "song", parts: [] }],
    }),
    "phase",
  );
  assert.equal(
    validatePracticeTemplate("Sesión", [
      { ...phase, repertoireItemId: "song-1", repertoirePartId: "missing-part" },
    ], {
      repertoireItems: [{
        id: "song-1",
        kind: "song",
        parts: [{ id: "part-1" }],
      }],
    }),
    "phase",
  );
});

test("requires a lick for a lick block and checks that it exists", () => {
  const lickPhase = {
    id: "phase-1",
    name: "Frase",
    durationMinutes: 5,
    skill: "lick",
  };

  assert.equal(validatePracticeTemplate("Sesión", [lickPhase]), "phase");
  assert.equal(
    validatePracticeTemplate("Sesión", [
      { ...lickPhase, lickId: "lick-1" },
    ], { licks: [{ id: "lick-1" }] }),
    null,
  );
  assert.equal(
    validatePracticeTemplate("Sesión", [
      { ...lickPhase, lickId: "missing" },
    ], { licks: [{ id: "lick-1" }] }),
    "phase",
  );
});

test("accepts secure Songsterr URLs but rejects unrelated or insecure links", () => {
  assert.equal(
    normalizeSongsterrUrl("https://www.songsterr.com/a/wa/song?id=123"),
    "https://www.songsterr.com/a/wa/song?id=123",
  );
  assert.equal(normalizeSongsterrUrl("http://songsterr.com/song"), null);
  assert.equal(normalizeSongsterrUrl("https://not-songsterr.com/song"), null);
});

test("recognizes supported PDF and Guitar Pro file extensions", () => {
  assert.equal(getPracticeFileKind("partitura.PDF"), "pdf");
  assert.equal(getPracticeFileKind("tema.gp5"), "guitarpro");
  assert.equal(getPracticeFileKind("tema.musicxml"), null);
});

test("recognizes supported audio files as backing-track resources", () => {
  assert.equal(getPracticeFileKind("base.mp3"), "audio");
});

test("accepts common audio formats as local backing tracks only", () => {
  assert.equal(isSupportedPracticeAudio("base.mp3", "audio/mpeg"), true);
  assert.equal(isSupportedPracticeAudio("base.m4a", ""), true);
  assert.equal(isSupportedPracticeAudio("base.wav", "application/octet-stream"), true);
  assert.equal(isSupportedPracticeAudio("documento.pdf", "application/pdf"), false);
});
