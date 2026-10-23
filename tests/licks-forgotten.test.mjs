import assert from "node:assert/strict";
import test from "node:test";
import { getForgottenLick } from "../src/utils/licks/forgotten.ts";

const today = new Date(2026, 2, 15, 12);
const iso = (year, month, day) => new Date(year, month - 1, day, 12).toISOString();

function lick(overrides) {
  return {
    id: "lick",
    title: "Frase",
    tabContent: "",
    techniques: [],
    bpmHistory: [],
    createdAt: iso(2026, 1, 1),
    practiceCount: 0,
    lastPracticedAt: iso(2026, 1, 1),
    ...overrides,
  };
}

test("prefers the lick that has gone longest without practice", () => {
  const result = getForgottenLick(
    [
      lick({ id: "recent", lastPracticedAt: iso(2026, 3, 5) }),
      lick({ id: "very-overdue", lastPracticedAt: iso(2026, 2, 1) }),
      lick({ id: "overdue", lastPracticedAt: iso(2026, 2, 12) }),
    ],
    today,
  );
  assert.equal(result?.lick.id, "very-overdue");
  assert.equal(result?.reason, "overdue");
  assert.equal(result?.daysSinceLastPractice, 42);
});

test("exactly 30 days is not overdue and falls back to frequency", () => {
  const result = getForgottenLick(
    [lick({ id: "thirty", lastPracticedAt: iso(2026, 2, 13) })],
    today,
  );
  assert.equal(result?.lick.id, "thirty");
  assert.equal(result?.reason, "low-frequency");
  assert.equal(result?.daysSinceLastPractice, 30);
});

test("a lick created today and never practised is not proposed", () => {
  const result = getForgottenLick(
    [
      lick({ id: "new", createdAt: iso(2026, 3, 15), lastPracticedAt: undefined }),
      lick({
        id: "old",
        createdAt: iso(2026, 1, 1),
        lastPracticedAt: iso(2026, 3, 14),
      }),
    ],
    today,
  );
  assert.equal(result?.lick.id, "old");
});

test("a never-practised lick wins by frequency", () => {
  const result = getForgottenLick(
    [
      lick({
        id: "practised",
        createdAt: iso(2026, 1, 1),
        lastPracticedAt: iso(2026, 3, 14),
        practiceCount: 10,
      }),
      lick({
        id: "never",
        createdAt: iso(2026, 1, 1),
        lastPracticedAt: undefined,
        practiceCount: 0,
      }),
    ],
    today,
  );
  assert.equal(result?.lick.id, "never");
  assert.equal(result?.daysSinceLastPractice, undefined);
});

test("ties are broken deterministically by age and id", () => {
  const result = getForgottenLick(
    [
      lick({ id: "b", createdAt: iso(2026, 1, 1), lastPracticedAt: undefined }),
      lick({ id: "a", createdAt: iso(2026, 1, 1), lastPracticedAt: undefined }),
    ],
    today,
  );
  assert.equal(result?.lick.id, "a");
});

test("an empty library has no proposal", () => {
  assert.equal(getForgottenLick([], today), null);
});

test("after practising the proposed lick today, another one is proposed", () => {
  const licks = [
    lick({
      id: "just-practised",
      createdAt: iso(2026, 1, 1),
      lastPracticedAt: today.toISOString(),
      practiceCount: 1,
    }),
    lick({
      id: "other",
      createdAt: iso(2026, 1, 2),
      lastPracticedAt: iso(2026, 3, 10),
      practiceCount: 1,
    }),
  ];
  assert.equal(getForgottenLick(licks, today)?.lick.id, "other");
});

test("no proposal when every lick was practised today", () => {
  const licks = [
    lick({
      id: "a",
      lastPracticedAt: today.toISOString(),
      practiceCount: 1,
    }),
    lick({
      id: "b",
      lastPracticedAt: today.toISOString(),
      practiceCount: 1,
    }),
  ];
  assert.equal(getForgottenLick(licks, today), null);
});
