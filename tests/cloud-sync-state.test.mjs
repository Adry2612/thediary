import assert from "node:assert/strict";
import test from "node:test";
import { createCloudSyncReference } from "../src/types/cloud-sync.ts";
import { updateCloudSyncReference } from "../src/services/cloud-sync/state.ts";

test("supports the normal recording synchronization lifecycle", () => {
  let state = createCloudSyncReference("google-drive", true, "2026-10-16T00:00:00.000Z");
  assert.equal(state.status, "not-synced");

  state = updateCloudSyncReference(state, {
    status: "uploading",
    progress: 40,
    now: "2026-10-16T00:00:01.000Z",
  });
  assert.equal(state.progress, 40);

  state = updateCloudSyncReference(state, {
    status: "synced",
    remoteFileId: "file-1",
    now: "2026-10-16T00:00:02.000Z",
  });
  assert.equal(state.remoteFileId, "file-1");
  assert.equal(state.progress, undefined);
});

test("normalizes failed uploads and allows a retry", () => {
  let state = createCloudSyncReference("onedrive", true);
  state = updateCloudSyncReference(state, { status: "uploading" });
  state = updateCloudSyncReference(state, {
    status: "error",
    errorCode: "quota-exceeded",
    errorMessage: "No queda espacio suficiente.",
  });
  assert.equal(state.errorCode, "quota-exceeded");

  state = updateCloudSyncReference(state, { status: "uploading" });
  assert.equal(state.errorCode, undefined);
});

test("rejects invalid state transitions", () => {
  const state = createCloudSyncReference("google-drive", false);
  assert.throws(
    () => updateCloudSyncReference(state, { status: "uploading" }),
    /Transición de sincronización no válida/,
  );
});
