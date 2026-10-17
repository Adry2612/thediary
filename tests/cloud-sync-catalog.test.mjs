import assert from "node:assert/strict";
import test from "node:test";
import {
  reconcileCloudRecordings,
  reconcileCloudRecordingsSafely,
  isRemoteRecording,
} from "../src/lib/cloud-sync/catalog.ts";

const local = {
  id: "same-id",
  title: "Local title",
  sessionName: "Session",
  createdAt: "2026-10-16T00:00:00.000Z",
  mimeType: "audio/webm",
  blob: new Blob(["audio"], { type: "audio/webm" }),
};

const remote = {
  provider: "google-drive",
  remoteFileId: "remote-id",
  remoteManifestId: "manifest-id",
  downloadUrl: "https://example.test/audio",
  metadata: {
    id: "same-id",
    title: "Remote title",
    sessionName: "Session",
    createdAt: "2026-10-16T00:00:00.000Z",
    mimeType: "audio/webm",
  },
};

function adapter(remoteRecordings) {
  return {
    provider: "google-drive",
    async getConnection() { return { provider: "google-drive", connected: true }; },
    async beginAuthorization() { return ""; },
    async disconnect() {},
    async uploadRecording() { return { remoteFileId: "" }; },
    async listManagedRecordings() { return remoteRecordings; },
  };
}

test("reconciliation updates an existing local recording instead of duplicating it", async () => {
  const result = await reconcileCloudRecordings([local], adapter([remote]));
  assert.equal(result.length, 1);
  assert.equal(result[0].blob.size, local.blob.size);
  assert.equal(result[0].cloudSync["google-drive"].remoteFileId, "remote-id");
});

test("reconciliation restores a recording that exists only in the provider", async () => {
  const result = await reconcileCloudRecordings([], adapter([remote]));
  assert.equal(result.length, 1);
  assert.equal(result[0].title, "Remote title");
  assert.equal(isRemoteRecording(result[0]), true);
});

test("safe reconciliation keeps local recordings when the provider is unavailable", async () => {
  const result = await reconcileCloudRecordingsSafely(
    [local],
    adapter({ async listManagedRecordings() { throw new Error("offline"); } }),
  );
  assert.equal(result.unavailable, true);
  assert.equal(result.recordings.length, 1);
  assert.equal(result.recordings[0].id, local.id);
});
