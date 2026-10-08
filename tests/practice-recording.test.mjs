import assert from "node:assert/strict";
import test from "node:test";
import { createPracticeAudioRecording } from "../src/lib/practice-recording.ts";

test("creates a recording with its session, phase, duration, and audio metadata", () => {
  const blob = new Blob(["audio"], { type: "audio/webm" });
  const recording = createPracticeAudioRecording({
    title: "  ",
    sessionName: "Rutina diaria",
    sessionId: "session-1",
    practiceDate: "2026-10-08",
    phase: {
      id: 2,
      name: "Arpegios",
      order: 3,
      skill: "technique",
    },
    durationSeconds: 14,
    blob,
  });

  assert.equal(recording.title, "Rutina diaria");
  assert.equal(recording.sessionId, "session-1");
  assert.equal(recording.practiceDate, "2026-10-08");
  assert.equal(recording.phaseId, 2);
  assert.equal(recording.phaseName, "Arpegios");
  assert.equal(recording.phaseOrder, 3);
  assert.equal(recording.practiceSkill, "technique");
  assert.equal(recording.durationSeconds, 14);
  assert.equal(recording.mimeType, "audio/webm");
  assert.equal(recording.blob, blob);
  assert.ok(recording.id);
  assert.ok(Number.isFinite(Date.parse(recording.createdAt)));
});

test("omits the phase and duration when they were not provided", () => {
  const recording = createPracticeAudioRecording({
    title: "Escala",
    sessionName: "Práctica libre",
    sessionId: "session-2",
    practiceDate: "2026-10-08",
    blob: new Blob(["audio"], { type: "audio/mp4" }),
  });

  assert.equal(recording.title, "Escala");
  assert.equal(recording.phaseId, undefined);
  assert.equal(recording.phaseName, undefined);
  assert.equal(recording.durationSeconds, undefined);
});
