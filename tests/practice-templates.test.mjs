import assert from "node:assert/strict";
import test from "node:test";
import {
  getPracticeFileKind,
  isSupportedPracticeAudio,
  normalizeSongsterrUrl,
  validatePracticeTemplate,
} from "../src/lib/practice-templates.ts";

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
