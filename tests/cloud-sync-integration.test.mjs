import assert from "node:assert/strict";
import test from "node:test";
import { reconcileCloudRecordings } from "../src/lib/cloud-sync/catalog.ts";
import { synchronizePracticeRecording } from "../src/lib/cloud-sync/sync-recording.ts";

test("integrates upload, retry, and remote catalog recovery without losing local audio", async () => {
  const saved = [];
  let attempts = 0;
  const adapter = {
    provider: "onedrive",
    async getConnection() { return { provider: "onedrive", connected: true }; },
    async beginAuthorization() { return ""; },
    async disconnect() {},
    async listManagedRecordings() {
      return attempts > 1
        ? [{
            provider: "onedrive",
            remoteFileId: "remote-1",
            remoteManifestId: "manifest-1",
            downloadUrl: "https://example.test/audio",
            metadata: {
              id: "recording-1",
              title: "Take",
              sessionName: "Session",
              createdAt: "2026-10-16T00:00:00.000Z",
              mimeType: "audio/webm",
            },
          }]
        : [];
    },
    async uploadRecording() {
      attempts += 1;
      if (attempts === 1) throw new TypeError("offline");
      return { remoteFileId: "remote-1", remoteManifestId: "manifest-1" };
    },
  };
  const recording = {
    id: "recording-1",
    title: "Take",
    sessionName: "Session",
    createdAt: "2026-10-16T00:00:00.000Z",
    mimeType: "audio/webm",
    blob: new Blob(["audio"], { type: "audio/webm" }),
  };

  await assert.rejects(
    synchronizePracticeRecording(recording, adapter, async (value) => saved.push(value)),
    /No se pudo conectar/,
  );
  const retried = await synchronizePracticeRecording(recording, adapter, async (value) => saved.push(value));
  assert.equal(retried.cloudSync.onedrive.status, "synced");
  assert.ok(retried.blob);

  const recovered = await reconcileCloudRecordings([], adapter);
  assert.equal(recovered.length, 1);
  assert.equal(recovered[0].cloudSync.onedrive.remoteFileId, "remote-1");
  assert.equal(recovered[0].playbackUrl, "https://example.test/audio");
  assert.ok(saved.some((value) => value.cloudSync.onedrive.status === "error"));
});
