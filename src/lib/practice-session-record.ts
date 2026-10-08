import type {
  PracticePhase,
  PracticeTimerResult,
  SessionRecord,
} from "../types/practice";

interface CreatePracticeSessionRecordInput {
  id: string;
  title: string;
  averageBpm: number;
  result: PracticeTimerResult;
  phases: PracticePhase[];
  notes: string;
  phaseNotes: Record<number, string>;
}

export function createPracticeSessionRecord({
  id,
  title,
  averageBpm,
  result,
  phases,
  notes,
  phaseNotes,
}: CreatePracticeSessionRecordInput): SessionRecord {
  return {
    id,
    title,
    startedAt: result.startedAt,
    durationSeconds: result.elapsedSeconds,
    averageBpm,
    completed: result.completed,
    skillSeconds: result.skillSeconds,
    notes: notes.trim() || undefined,
    phases: result.phases.map((phase, index) => ({
      ...phase,
      durationMinutes: phases[index]?.durationMinutes,
      exercises: [...(phases[index]?.exercises ?? [])],
      resources: phases[index]?.resources?.map((resource) => ({
        ...resource,
      })),
      notes: phaseNotes[index]?.trim() || undefined,
      repertoireItemId: phases[index]?.repertoireItemId,
      repertoirePartId: phases[index]?.repertoirePartId,
    })),
  };
}
