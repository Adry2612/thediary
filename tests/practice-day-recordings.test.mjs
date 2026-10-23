import assert from "node:assert/strict";
import test from "node:test";
import { associateDayRecordings } from "../src/utils/practice-recording-filtering.ts";

function recording(id, overrides = {}) {
  return {
    id,
    title: id,
    sessionName: "Mi sesión",
    createdAt: "2026-10-16T10:00:00.000Z",
    mimeType: "audio/webm",
    ...overrides,
  };
}

test("associates recordings with their session by id", () => {
  const sessions = [{ id: "s1", title: "Mi sesión", dateKey: "2026-10-16" }];
  const result = associateDayRecordings(
    [recording("a", { sessionId: "s1" })],
    sessions,
    "2026-10-16",
  );

  assert.deepEqual(
    result.bySession.get("s1").map((item) => item.id),
    ["a"],
  );
  assert.deepEqual(result.unlinked, []);
});

test("assigns orphan recordings of the day to the only session", () => {
  const sessions = [{ id: "s1", title: "Otra rutina", dateKey: "2026-10-16" }];
  const result = associateDayRecordings(
    [
      recording("kept", { sessionId: "s1" }),
      recording("orphan", {
        practiceDate: "2026-10-16",
        sessionName: "Sesión descartada",
      }),
      recording("other-day", { practiceDate: "2026-10-15" }),
    ],
    sessions,
    "2026-10-16",
  );

  assert.deepEqual(
    result.bySession.get("s1").map((item) => item.id),
    ["kept", "orphan"],
  );
  assert.deepEqual(result.unlinked, []);
});

test("keeps orphan recordings of the day visible when several sessions exist", () => {
  const sessions = [
    { id: "s1", title: "Rutina A", dateKey: "2026-10-16" },
    { id: "s2", title: "Rutina B", dateKey: "2026-10-16" },
  ];
  const result = associateDayRecordings(
    [
      recording("linked", { sessionId: "s2" }),
      recording("orphan", { practiceDate: "2026-10-16" }),
    ],
    sessions,
    "2026-10-16",
  );

  assert.deepEqual(
    result.bySession.get("s2").map((item) => item.id),
    ["linked"],
  );
  assert.deepEqual(
    result.unlinked.map((item) => item.id),
    ["orphan"],
  );
});
