import assert from "node:assert/strict";
import test from "node:test";
import { getForgottenRepertoireItem } from "../src/utils/repertoire-forgotten.ts";

const today = new Date(2026, 2, 15, 12);
const iso = (year, month, day) =>
  new Date(year, month - 1, day, 12).toISOString();

function song(overrides = {}) {
  return {
    id: "song",
    kind: "song",
    title: "Canción",
    parts: [],
    updatedAt: iso(2026, 1, 1),
    ...overrides,
  };
}

function stats(overrides = {}) {
  return {
    practiceSeconds: 600,
    sessionCount: 1,
    ...overrides,
  };
}

test("prefers the song that has gone longest without practice", () => {
  const result = getForgottenRepertoireItem(
    [
      song({ id: "recent", updatedAt: iso(2025, 12, 1) }),
      song({ id: "very-overdue", updatedAt: iso(2025, 12, 1) }),
      song({ id: "overdue", updatedAt: iso(2025, 12, 1) }),
    ],
    new Map([
      ["recent", stats({ lastPracticedAt: iso(2026, 3, 5) })],
      ["very-overdue", stats({ lastPracticedAt: iso(2026, 2, 1) })],
      ["overdue", stats({ lastPracticedAt: iso(2026, 2, 12) })],
    ]),
    today,
  );

  assert.equal(result?.item.id, "very-overdue");
  assert.equal(result?.reason, "overdue");
  assert.equal(result?.daysSinceLastPractice, 42);
});

test("exactly 30 days is not overdue and falls back to frequency", () => {
  const result = getForgottenRepertoireItem(
    [song({ id: "thirty" })],
    new Map([
      ["thirty", stats({ lastPracticedAt: iso(2026, 2, 13) })],
    ]),
    today,
  );

  assert.equal(result?.item.id, "thirty");
  assert.equal(result?.reason, "low-frequency");
  assert.equal(result?.daysSinceLastPractice, 30);
});

test("a song added or updated today and never practised is not proposed", () => {
  const result = getForgottenRepertoireItem(
    [
      song({ id: "new", updatedAt: iso(2026, 3, 15) }),
      song({ id: "old" }),
    ],
    new Map([
      ["old", stats({ lastPracticedAt: iso(2026, 3, 14) })],
    ]),
    today,
  );

  assert.equal(result?.item.id, "old");
});

test("a never-practised song wins by frequency", () => {
  const result = getForgottenRepertoireItem(
    [
      song({ id: "practised" }),
      song({ id: "never" }),
    ],
    new Map([
      [
        "practised",
        stats({ practiceSeconds: 6000, sessionCount: 10, lastPracticedAt: iso(2026, 3, 14) }),
      ],
    ]),
    today,
  );

  assert.equal(result?.item.id, "never");
  assert.equal(result?.daysSinceLastPractice, undefined);
});

test("songs parked for later and legacy licks are ignored", () => {
  assert.equal(
    getForgottenRepertoireItem(
      [
        song({ id: "future", isFutureLearn: true }),
        song({ id: "legacy-lick", kind: "lick" }),
      ],
      new Map(),
      today,
    ),
    null,
  );
});

test("ties are broken deterministically by update date and id", () => {
  const result = getForgottenRepertoireItem(
    [
      song({ id: "b" }),
      song({ id: "a" }),
    ],
    new Map(),
    today,
  );

  assert.equal(result?.item.id, "a");
});

test("an empty repertoire has no proposal", () => {
  assert.equal(getForgottenRepertoireItem([], new Map(), today), null);
});

test("after practising the proposed song today, another one is proposed", () => {
  const items = [
    song({ id: "just-practised" }),
    song({ id: "other" }),
  ];
  const practiceStats = new Map([
    [
      "just-practised",
      stats({ lastPracticedAt: today.toISOString() }),
    ],
    [
      "other",
      stats({ lastPracticedAt: iso(2026, 3, 10) }),
    ],
  ]);

  assert.equal(
    getForgottenRepertoireItem(items, practiceStats, today)?.item.id,
    "other",
  );
});

test("no proposal when every song was practised today", () => {
  const items = [song({ id: "a" }), song({ id: "b" })];
  const practiceStats = new Map([
    ["a", stats({ lastPracticedAt: today.toISOString() })],
    ["b", stats({ lastPracticedAt: today.toISOString() })],
  ]);

  assert.equal(getForgottenRepertoireItem(items, practiceStats, today), null);
});
