import assert from "node:assert/strict";
import test from "node:test";
import {
  applySessionClockDrafts,
  createSessionClockDrafts,
} from "../src/utils/practice-session-editor.ts";

function editable(blocks = []) {
  return {
    title: "Práctica",
    notes: "",
    completed: true,
    durationSeconds: 0,
    guitarType: null,
    guitarId: null,
    blocks,
  };
}

function block(id, actualSeconds) {
  return {
    id,
    name: "Bloque",
    skill: "technique",
    plannedMinutes: 1,
    actualSeconds,
    notes: "",
  };
}

test("creates clock drafts from seconds", () => {
  const drafts = createSessionClockDrafts(editable([block("a", 83)]));
  assert.deepEqual(drafts, { blocks: { a: "1:23" }, duration: "0:00" });
});

test("accepts seconds and clock formats", () => {
  const base = editable([block("a", 1), block("b", 2)]);

  assert.equal(
    applySessionClockDrafts(base, {
      blocks: { a: "83", b: "1:23" },
      duration: "0:00",
    }).session.blocks.map((item) => item.actualSeconds).join(","),
    "83,83",
  );
});

test("an empty block counts as zero without losing the other fields", () => {
  const base = editable([block("a", 60), block("b", 30)]);
  const result = applySessionClockDrafts(base, {
    blocks: { a: "", b: "2:00" },
    duration: "0:00",
  });

  assert.deepEqual(result.errors, {});
  assert.deepEqual(
    result.session.blocks.map((item) => item.actualSeconds),
    [0, 120],
  );
});

test("an invalid value keeps the previous seconds and reports its field", () => {
  const base = editable([block("a", 60)]);
  const result = applySessionClockDrafts(base, {
    blocks: { a: "abc" },
    duration: "0:00",
  });

  assert.deepEqual(result.errors, { "block:a": "invalid" });
  assert.equal(result.session.blocks[0].actualSeconds, 60);
});

test("a session without blocks uses its own duration field", () => {
  const base = editable();
  const result = applySessionClockDrafts(base, {
    blocks: {},
    duration: "1:02:03",
  });

  assert.deepEqual(result.errors, {});
  assert.equal(result.session.durationSeconds, 3723);
});

test("an invalid session duration is reported", () => {
  const result = applySessionClockDrafts(editable(), {
    blocks: {},
    duration: "1:99",
  });

  assert.deepEqual(result.errors, { duration: "invalid" });
});
