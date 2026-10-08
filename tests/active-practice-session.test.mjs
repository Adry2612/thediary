import assert from "node:assert/strict";
import test from "node:test";
import { useActivePracticeSessionStore } from "../src/stores/useActivePracticeSessionStore.ts";

test("keeps the active practice plan available until it is cleared", () => {
  const activeSession = {
    id: "practice-session-1",
    name: "Rutina diaria",
    phases: [
      {
        id: "technique",
        name: "Técnica",
        durationMinutes: 10,
        skill: "technique",
      },
    ],
  };

  useActivePracticeSessionStore.getState().setActiveSession(activeSession);
  assert.deepEqual(
    useActivePracticeSessionStore.getState().activeSession,
    activeSession,
  );

  useActivePracticeSessionStore.getState().clearActiveSession();
  assert.equal(useActivePracticeSessionStore.getState().activeSession, null);
});
