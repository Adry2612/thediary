import assert from "node:assert/strict";
import test from "node:test";
import { synchronizePracticeRecording } from "../src/lib/cloud-sync/sync-recording.ts";

function recording(blob = new Blob(["audio"], { type: "audio/webm" })) {
  return {
    id: "recording-1",
    title: "Take",
    sessionName: "Session",
    createdAt: "2026-10-16T00:00:00.000Z",
    mimeType: "audio/webm",
    blob,
  };
}

function adapter(overrides = {}) {
  return {
    provider: "google-drive",
    async getConnection() { return { provider: "google-drive", connected: true }; },
    async beginAuthorization() { return "https://example.test/oauth"; },
    async disconnect() {},
    async listManagedRecordings() { return []; },
    async uploadRecording() { return { remoteFileId: "remote-1", remoteManifestId: "manifest-1" }; },
    ...overrides,
  };
}

test("persists uploading and synced states while preserving the local blob", async () => {
  const saved = [];
  const result = await synchronizePracticeRecording(
    recording(),
    adapter(),
    async (value) => saved.push(value),
  );
  assert.equal(result.cloudSync["google-drive"].status, "synced");
  assert.equal(result.cloudSync["google-drive"].remoteFileId, "remote-1");
  assert.ok(result.blob);
  assert.ok(saved.some((value) => value.cloudSync["google-drive"].status === "uploading"));
});

test("persists a retryable error and keeps the recording local", async () => {
  const saved = [];
  await assert.rejects(
    synchronizePracticeRecording(
      recording(),
      adapter({ async uploadRecording() { throw new TypeError("offline"); } }),
      async (value) => saved.push(value),
    ),
    /No se pudo conectar/,
  );
  const failed = saved.at(-1);
  assert.equal(failed.cloudSync["google-drive"].status, "error");
  assert.ok(failed.blob);
});

test("does not call the provider for a missing audio blob", async () => {
  let called = false;
  await assert.rejects(
    synchronizePracticeRecording(
      recording(null),
      adapter({ async uploadRecording() { called = true; return {}; } }),
      async () => {},
    ),
    /No se encontró/,
  );
  assert.equal(called, false);
});
