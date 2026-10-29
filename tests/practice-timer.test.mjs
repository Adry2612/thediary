import assert from "node:assert/strict";
import test from "node:test";
import {
  shouldSignalBlockEnd,
  synchronizePracticeTimer,
} from "../src/utils/practice-timer.ts";

const emptySkillElapsedMs = {
  technique: 0,
  theory: 0,
  repertoire: 0,
  lick: 0,
  improvisation: 0,
};

function createRuntime({
  phaseIndex = 0,
  phaseElapsedMs = 0,
  elapsedMs = 0,
  phaseElapsedTotalsMs = [0, 0],
  lastUpdatedAtMs = 0,
} = {}) {
  return {
    elapsedMs,
    phaseElapsedMs,
    phaseElapsedTotalsMs,
    skillElapsedMs: { ...emptySkillElapsedMs },
    phaseIndex,
    lastUpdatedAtMs,
    startedAtMs: 0,
    isRunning: true,
    awaitingPhaseAdvance: false,
  };
}

const phasePlan = [
  { phase: { id: "warmup", name: "Técnica", skill: "technique" }, durationMs: 1000 },
  { phase: { id: "song", name: "Repertorio", skill: "repertoire" }, durationMs: 1000 },
];

test("waits for a manual block skip when a non-final timer reaches zero", () => {
  const result = synchronizePracticeTimer(createRuntime(), phasePlan, 1500);

  assert.equal(result.completed, false);
  assert.equal(result.runtime.phaseIndex, 0);
  assert.equal(result.runtime.phaseElapsedMs, 1000);
  assert.equal(result.runtime.elapsedMs, 1000);
  assert.equal(result.runtime.isRunning, false);
  assert.equal(result.runtime.awaitingPhaseAdvance, true);
  assert.deepEqual(result.runtime.phaseElapsedTotalsMs, [1000, 0]);
});

test("completes the session when the final block timer reaches zero", () => {
  const result = synchronizePracticeTimer(
    createRuntime({
      phaseIndex: 1,
      elapsedMs: 1000,
      phaseElapsedTotalsMs: [1000, 0],
    }),
    phasePlan,
    1000,
  );

  assert.equal(result.completed, true);
  assert.equal(result.runtime.phaseIndex, phasePlan.length);
  assert.equal(result.runtime.awaitingPhaseAdvance, false);
});

test("keeps a non-final block running overtime when the option is on", () => {
  const result = synchronizePracticeTimer(
    createRuntime(),
    phasePlan,
    1500,
    false,
    true,
  );

  assert.equal(result.completed, false);
  assert.equal(result.runtime.phaseIndex, 0);
  assert.equal(result.runtime.phaseElapsedMs, 1500);
  assert.equal(result.runtime.elapsedMs, 1500);
  assert.equal(result.runtime.isRunning, true);
  assert.equal(result.runtime.awaitingPhaseAdvance, true);
  assert.deepEqual(result.runtime.phaseElapsedTotalsMs, [1500, 0]);
});

test("completes the final block even when the overtime option is on", () => {
  const result = synchronizePracticeTimer(
    createRuntime({
      phaseIndex: 1,
      elapsedMs: 1000,
      phaseElapsedTotalsMs: [1000, 0],
    }),
    phasePlan,
    2500,
    false,
    true,
  );

  assert.equal(result.completed, true);
  assert.equal(result.runtime.phaseIndex, phasePlan.length);
  assert.equal(result.runtime.elapsedMs, 2000);
  assert.equal(result.runtime.awaitingPhaseAdvance, false);
  assert.equal(result.runtime.isRunning, false);
});

test("stops exactly at the session target and reports it", () => {
  const result = synchronizePracticeTimer(
    createRuntime(),
    phasePlan,
    1000,
    true,
    false,
    700,
  );

  assert.equal(result.completed, false);
  assert.equal(result.targetReached, true);
  assert.equal(result.runtime.elapsedMs, 700);
  assert.equal(result.runtime.isRunning, false);
  assert.equal(result.runtime.awaitingPhaseAdvance, false);
  assert.deepEqual(result.runtime.phaseElapsedTotalsMs, [700, 0]);
});

test("does not stop before the target", () => {
  const result = synchronizePracticeTimer(
    createRuntime(),
    phasePlan,
    500,
    true,
    false,
    700,
  );

  assert.equal(result.targetReached, false);
  assert.equal(result.runtime.elapsedMs, 500);
  assert.equal(result.runtime.isRunning, true);
});

test("normal completion wins when the target and the final block coincide", () => {
  const result = synchronizePracticeTimer(
    createRuntime({
      phaseIndex: 1,
      elapsedMs: 1000,
      phaseElapsedTotalsMs: [1000, 0],
    }),
    phasePlan,
    2000,
    false,
    false,
    2000,
  );

  assert.equal(result.completed, true);
  assert.equal(result.targetReached, false);
  assert.equal(result.runtime.isRunning, false);
});

test("signals a block end only when the waiting state starts", () => {
  const running = createRuntime();

  assert.equal(
    shouldSignalBlockEnd(
      { awaitingPhaseAdvance: false },
      { awaitingPhaseAdvance: true },
    ),
    true,
  );
  assert.equal(
    shouldSignalBlockEnd(
      { awaitingPhaseAdvance: true },
      { awaitingPhaseAdvance: true },
    ),
    false,
  );
  assert.equal(
    shouldSignalBlockEnd(
      { awaitingPhaseAdvance: true },
      { awaitingPhaseAdvance: false },
    ),
    false,
  );

  const firstOvertimeTick = synchronizePracticeTimer(
    running,
    phasePlan,
    1500,
    false,
    true,
  );
  const secondOvertimeTick = synchronizePracticeTimer(
    firstOvertimeTick.runtime,
    phasePlan,
    1750,
    false,
    true,
  );

  assert.equal(
    shouldSignalBlockEnd(running, firstOvertimeTick.runtime),
    true,
  );
  assert.equal(
    shouldSignalBlockEnd(firstOvertimeTick.runtime, secondOvertimeTick.runtime),
    false,
  );
});

test("does not signal again when resuming a block that is already in overtime", () => {
  const overtime = synchronizePracticeTimer(
    createRuntime(),
    phasePlan,
    1500,
    false,
    true,
  ).runtime;
  const paused = { ...overtime, isRunning: false };
  const resumed = { ...paused, isRunning: true, lastUpdatedAtMs: 2000 };

  assert.equal(
    shouldSignalBlockEnd(paused, resumed),
    false,
  );
});
