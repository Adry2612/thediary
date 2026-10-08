import type { PracticePhase, SessionRecord } from "../types/practice";

export interface PracticeLaunchPlan {
  name: string;
  phases: PracticePhase[];
}

export function createPracticePlanFromSession(
  session: Pick<SessionRecord, "title" | "phases">,
): PracticeLaunchPlan | null {
  if (!session.phases?.length) return null;

  return {
    name: session.title ?? "Mi sesión",
    phases: session.phases.map((phase) => ({
      id: phase.id,
      name: phase.name,
      durationMinutes:
        phase.durationMinutes ?? Math.max(1, Math.ceil(phase.elapsedSeconds / 60)),
      skill: phase.skill,
      exercises: phase.exercises ? [...phase.exercises] : undefined,
      resources: phase.resources?.map((resource) => ({ ...resource })),
      repertoireItemId: phase.repertoireItemId,
      repertoirePartId: phase.repertoirePartId,
    })),
  };
}
