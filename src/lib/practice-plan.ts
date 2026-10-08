import type { PracticePhase } from "../types/practice";

export function createPracticePhase(id: PracticePhase["id"]): PracticePhase {
  return {
    id,
    name: "",
    durationMinutes: 5,
    skill: "technique",
    exercises: [],
    resources: [],
  };
}

export function clonePracticePhases(
  phases: PracticePhase[],
): PracticePhase[] {
  return phases.map((phase) => ({
    ...phase,
    exercises: [...(phase.exercises ?? [])],
    resources: (phase.resources ?? []).map((resource) => ({ ...resource })),
  }));
}

export function getPracticePlanDuration(
  phases: Pick<PracticePhase, "durationMinutes">[],
) {
  return phases.reduce(
    (total, phase) => total + (phase.durationMinutes || 0),
    0,
  );
}
