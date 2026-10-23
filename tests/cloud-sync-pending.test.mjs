import assert from "node:assert/strict";
import test from "node:test";
import { getPendingRecordings } from "../src/services/cloud-sync/pending-recordings.ts";

function recording(id, { withBlob = true, size = 4 } = {}) {
  return {
    id,
    title: id,
    sessionName: "Session",
    createdAt: "2026-10-16T00:00:00.000Z",
    mimeType: "audio/webm",
    blob: withBlob
      ? new Blob(["a".repeat(size)], { type: "audio/webm" })
      : undefined,
  };
}

test("returns only locally available recordings missing from the provider", () => {
  const local = [recording("a"), recording("b"), recording("c")];
  const pending = getPendingRecordings(local, new Set(["b"]));
  assert.deepEqual(
    pending.map((item) => item.id),
    ["a", "c"],
  );
});

test("skips recordings without a readable or non-empty local blob", () => {
  const local = [
    recording("a", { withBlob: false }),
    recording("b", { size: 0 }),
    recording("c"),
  ];
  const pending = getPendingRecordings(local, new Set());
  assert.deepEqual(
    pending.map((item) => item.id),
    ["c"],
  );
});

test("returns nothing when every recording is already in the provider", () => {
  const local = [recording("a"), recording("b")];
  assert.equal(getPendingRecordings(local, new Set(["a", "b"])).length, 0);
});
