import assert from "node:assert/strict";
import test from "node:test";
import {
  parseStoredTimer,
  resolveRestoredRuntime,
  serializeTimer,
  shouldRestoreTimer,
} from "../src/utils/practice-timer-storage.ts";

function runtime(overrides = {}) {
  return {
    elapsedMs: 90_000,
    phaseElapsedMs: 30_000,
    phaseElapsedTotalsMs: [60_000, 30_000],
    skillElapsedMs: {
      technique: 60_000,
      theory: 30_000,
      repertoire: 0,
      lick: 0,
      improvisation: 0,
    },
    phaseIndex: 1,
    lastUpdatedAtMs: 1_000,
    startedAtMs: 500,
    isRunning: true,
    awaitingPhaseAdvance: false,
    ...overrides,
  };
}

function stored(overrides = {}) {
  return {
    version: 1,
    sessionId: "session-a",
    planKey: "block-a:10|block-b:5",
    countUp: false,
    runtime: runtime(),
    ...overrides,
  };
}

const context = {
  sessionId: "session-a",
  planKey: "block-a:10|block-b:5",
  countUp: false,
  phaseCount: 2,
};

test("parses a valid stored timer", () => {
  const parsed = parseStoredTimer(JSON.stringify(stored()), 2);

  assert.ok(parsed);
  assert.equal(parsed.sessionId, "session-a");
  assert.equal(parsed.runtime.elapsedMs, 90_000);
  assert.deepEqual(parsed.runtime.phaseElapsedTotalsMs, [60_000, 30_000]);
  assert.equal(parsed.runtime.skillElapsedMs.repertoire, 0);
});

test("rejects malformed JSON and unknown versions", () => {
  assert.equal(parseStoredTimer("{not json", 2), null);
  assert.equal(parseStoredTimer(JSON.stringify(stored({ version: 2 })), 2), null);
  assert.equal(parseStoredTimer(null, 2), null);
});

test("rejects a snapshot from another session or plan", () => {
  assert.equal(
    shouldRestoreTimer(parseStoredTimer(JSON.stringify(stored())), {
      ...context,
      sessionId: "session-b",
    }),
    false,
  );
  assert.equal(
    shouldRestoreTimer(parseStoredTimer(JSON.stringify(stored())), {
      ...context,
      planKey: "other",
    }),
    false,
  );
  assert.equal(
    shouldRestoreTimer(parseStoredTimer(JSON.stringify(stored())), {
      ...context,
      countUp: true,
    }),
    false,
  );
});

test("rejects a phase index outside the current plan", () => {
  assert.equal(
    parseStoredTimer(
      JSON.stringify(stored({ runtime: runtime({ phaseIndex: 2 }) })),
      2,
    ),
    null,
  );
  assert.equal(
    shouldRestoreTimer(
      parseStoredTimer(JSON.stringify(stored()), 3),
      { ...context, phaseCount: 3 },
    ),
    false,
  );
});

test("rejects non-finite and negative numbers", () => {
  for (const invalid of [
    { elapsedMs: Number.NaN },
    { elapsedMs: -1 },
    { phaseElapsedMs: Number.POSITIVE_INFINITY },
    { phaseElapsedMs: -5 },
    { lastUpdatedAtMs: Number.NaN },
    { startedAtMs: "soon" },
  ]) {
    assert.equal(
      parseStoredTimer(
        JSON.stringify(stored({ runtime: runtime(invalid) })),
        2,
      ),
      null,
      JSON.stringify(invalid),
    );
  }
});

test("rejects totals that do not match the plan or the elapsed time", () => {
  assert.equal(
    parseStoredTimer(
      JSON.stringify(
        stored({ runtime: runtime({ phaseElapsedTotalsMs: [90_000] }) }),
      ),
      2,
    ),
    null,
  );
  assert.equal(
    parseStoredTimer(
      JSON.stringify(
        stored({ runtime: runtime({ phaseElapsedTotalsMs: [10_000, 10_000] }) }),
      ),
      2,
    ),
    null,
  );
  assert.equal(
    parseStoredTimer(
      JSON.stringify(
        stored({
          runtime: runtime({
            skillElapsedMs: {
              technique: 10_000,
              theory: 10_000,
              repertoire: 0,
              lick: 0,
              improvisation: 0,
            },
          }),
        }),
      ),
      2,
    ),
    null,
  );
});

test("rejects a missing or negative skill total", () => {
  assert.equal(
    parseStoredTimer(
      JSON.stringify(
        stored({
          runtime: runtime({
            skillElapsedMs: { technique: 90_000, theory: 0 },
          }),
        }),
      ),
      2,
    ),
    null,
  );
  assert.equal(
    parseStoredTimer(
      JSON.stringify(
        stored({
          runtime: runtime({
            skillElapsedMs: {
              technique: 100_000,
              theory: -10_000,
              repertoire: 0,
              lick: 0,
              improvisation: 0,
            },
          }),
        }),
      ),
      2,
    ),
    null,
  );
});

test("round-trips a valid timer and accepts its restore context", () => {
  const raw = serializeTimer("session-a", "block-a:10|block-b:5", false, runtime());
  const parsed = parseStoredTimer(raw, 2);

  assert.ok(parsed);
  assert.equal(shouldRestoreTimer(parsed, context), true);
});

test("marks the target as reached when the restored time already passed it", () => {
  const resolved = resolveRestoredRuntime(runtime(), 60_000);

  assert.equal(resolved.targetReached, true);
  assert.equal(resolved.runtime.isRunning, false);
  assert.equal(resolved.runtime.awaitingPhaseAdvance, false);
  assert.equal(resolved.runtime.elapsedMs, 90_000);
});

test("keeps the restored runtime running when the target is not reached", () => {
  const resolved = resolveRestoredRuntime(runtime(), 120_000);

  assert.equal(resolved.targetReached, false);
  assert.equal(resolved.runtime.isRunning, true);
});

test("does not touch the runtime when the practice has no target", () => {
  const resolved = resolveRestoredRuntime(runtime(), null);

  assert.equal(resolved.targetReached, false);
  assert.equal(resolved.runtime.isRunning, true);
});
