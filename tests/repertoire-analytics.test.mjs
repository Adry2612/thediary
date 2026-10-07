import assert from "node:assert/strict";
import test from "node:test";
import { getRepertoirePracticeStats } from "../src/lib/repertoire-analytics.ts";

const emptySkills = {
  technique: 0,
  theory: 0,
  repertoire: 0,
  improvisation: 0,
};

function createSession(id, phases) {
  return {
    id,
    startedAt: "2026-10-07T12:00:00.000Z",
    durationSeconds: 2400,
    averageBpm: 90,
    skillSeconds: { ...emptySkills, repertoire: 2400 },
    phases,
  };
}

test("attributes only linked phase time to its repertoire part", () => {
  const history = [
    createSession("session-1", [
      {
        id: "phase-1",
        name: "Solo",
        skill: "repertoire",
        elapsedSeconds: 1200,
        repertoireItemId: "song-1",
        repertoirePartId: "solo-1",
      },
      {
        id: "phase-2",
        name: "Puente",
        skill: "repertoire",
        elapsedSeconds: 600,
        repertoireItemId: "song-1",
        repertoirePartId: "bridge-1",
      },
      {
        id: "phase-2b",
        name: "Repaso del solo",
        skill: "repertoire",
        elapsedSeconds: 300,
        repertoireItemId: "song-1",
        repertoirePartId: "solo-1",
      },
    ]),
    createSession("session-2", [
      {
        id: "phase-3",
        name: "Solo",
        skill: "repertoire",
        elapsedSeconds: 300,
        repertoireItemId: "song-1",
        repertoirePartId: "solo-1",
      },
    ]),
  ];

  const stats = getRepertoirePracticeStats(history);

  assert.deepEqual(stats.get("song-1")?.get("solo-1"), {
    practiceSeconds: 1800,
    sessionCount: 2,
  });
  assert.equal(stats.get("song-1")?.has("bridge-1"), true);
  assert.equal(stats.get("song-1")?.has("missing-part"), false);
});
