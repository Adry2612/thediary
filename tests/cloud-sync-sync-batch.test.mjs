import assert from "node:assert/strict";
import test from "node:test";
import { syncPendingRecordings } from "../src/services/cloud-sync/sync-batch.ts";

function recording(id) {
  return {
    id,
    title: id,
    sessionName: "Session",
    createdAt: "2026-10-16T00:00:00.000Z",
    mimeType: "audio/webm",
    blob: new Blob(["audio"], { type: "audio/webm" }),
  };
}

test("uploads only the recordings missing from the provider", async () => {
  const uploaded = [];
  const result = await syncPendingRecordings({
    listRemoteIds: async () => new Set(["b"]),
    listLocal: async () => [recording("a"), recording("b"), recording("c")],
    upload: async (item) => {
      uploaded.push(item.id);
    },
  });

  assert.deepEqual(uploaded, ["a", "c"]);
  assert.deepEqual(result, { pending: 2, uploaded: 2, errors: [] });
});

test("keeps going after a non-authorization failure", async () => {
  const uploaded = [];
  const result = await syncPendingRecordings({
    listRemoteIds: async () => new Set(),
    listLocal: async () => [recording("a"), recording("b")],
    upload: async (item) => {
      if (item.id === "a") throw new TypeError("offline");
      uploaded.push(item.id);
    },
    isAuthorizationError: () => false,
  });

  assert.deepEqual(uploaded, ["b"]);
  assert.equal(result.uploaded, 1);
  assert.equal(result.errors.length, 1);
});

test("stops the batch on an authorization error", async () => {
  const attempted = [];
  const result = await syncPendingRecordings({
    listRemoteIds: async () => new Set(),
    listLocal: async () => [recording("a"), recording("b"), recording("c")],
    upload: async (item) => {
      attempted.push(item.id);
      throw Object.assign(new Error("token expired"), { code: "token-expired" });
    },
    isAuthorizationError: (error) => error.code === "token-expired",
  });

  assert.deepEqual(attempted, ["a"]);
  assert.equal(result.uploaded, 0);
  assert.equal(result.pending, 3);
});
