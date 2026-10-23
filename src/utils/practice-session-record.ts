import {
  PRACTICE_SKILLS,
  type PracticePhase,
  type PracticeSkill,
  type PracticeTimerResult,
  type SessionRecord,
} from "../types/practice.ts";

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
    skillSeconds: normalizeSkillSeconds(result.skillSeconds),
    notes: notes.trim() || undefined,
    phases: result.phases.map((phase, index) => ({
      ...phase,
      name: phases[index]?.name ?? phase.name,
      durationMinutes: phases[index]?.durationMinutes,
      exercises: [...(phases[index]?.exercises ?? [])],
      resources: phases[index]?.resources?.map((resource) => ({
        ...resource,
      })),
      notes: phaseNotes[index]?.trim() || undefined,
      repertoireItemId: phases[index]?.repertoireItemId,
      repertoirePartId: phases[index]?.repertoirePartId,
      lickId: phases[index]?.lickId,
    })),
  };
}

/**
 * Completa el reparto por categoría de una sesión guardada con las categorías
 * que se añadieron después. Las sesiones antiguas no tienen `lick` y sus
 * estadísticas no deben multiplicar por `undefined`.
 */
export function normalizeSkillSeconds(
  value: Partial<Record<PracticeSkill, unknown>> | undefined,
): Record<PracticeSkill, number> {
  return PRACTICE_SKILLS.reduce<Record<PracticeSkill, number>>(
    (seconds, skill) => {
      const stored = value?.[skill];
      seconds[skill] =
        typeof stored === "number" && Number.isFinite(stored) ? stored : 0;
      return seconds;
    },
    { technique: 0, theory: 0, repertoire: 0, lick: 0, improvisation: 0 },
  );
}

/** Rellena las categorías que falten en una sesión cargada de datos antiguos. */
export function normalizeSessionRecord(session: SessionRecord): SessionRecord {
  return {
    ...session,
    skillSeconds: normalizeSkillSeconds(session.skillSeconds),
  };
}
