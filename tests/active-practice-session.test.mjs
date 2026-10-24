import assert from "node:assert/strict";
import test from "node:test";
import { useActivePracticeSessionStore } from "../src/stores/useActivePracticeSessionStore.ts";

test("keeps the active practice plan available until it is cleared", () => {
  const activeSession = {
    id: "practice-session-1",
    name: "Rutina diaria",
    templateId: "template-1",
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

test("updates one phase in place and keeps the rest of the session", () => {
  useActivePracticeSessionStore.getState().setActiveSession({
    id: "practice-session-2",
    name: "Rutina",
    phases: [
      { id: "a", name: "Técnica", durationMinutes: 5, skill: "technique" },
      { id: "b", name: "Canción", durationMinutes: 10, skill: "repertoire" },
    ],
  });

  useActivePracticeSessionStore
    .getState()
    .updatePhase("b", { repertoireItemId: "song-1", name: "Otra canción" });

  const session = useActivePracticeSessionStore.getState().activeSession;
  assert.equal(session?.phases[1].repertoireItemId, "song-1");
  assert.equal(session?.phases[1].name, "Otra canción");
  assert.equal(session?.phases[0].name, "Técnica");
  assert.equal(session?.phases.length, 2);

  useActivePracticeSessionStore.getState().clearActiveSession();
});

test("keeps the guitar type of the running practice and can clear it", () => {
  useActivePracticeSessionStore.getState().setActiveSession({
    id: "practice-session-3",
    name: "Rutina",
    phases: [
      { id: "a", name: "Técnica", durationMinutes: 5, skill: "technique" },
    ],
  });

  useActivePracticeSessionStore.getState().setGuitarType("acoustic");
  assert.equal(
    useActivePracticeSessionStore.getState().activeSession?.guitarType,
    "acoustic",
  );

  useActivePracticeSessionStore.getState().setGuitarType(null);
  assert.equal(
    "guitarType" in
      (useActivePracticeSessionStore.getState().activeSession ?? {}),
    false,
  );

  useActivePracticeSessionStore.getState().clearActiveSession();
});
