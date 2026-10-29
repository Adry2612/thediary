import {
  PRACTICE_SKILLS,
  type GuitarType,
  type PracticeMetricValue,
  type PracticePhase,
  type PracticeSkill,
  type PracticeTimerResult,
  type SessionPhaseRecord,
  type SessionRecord,
} from "../types/practice.ts";
import {
  getBlockAverageBpms,
  type MetronomeBpmSample,
} from "./metronome-bpm.ts";
import { normalizePracticeMetricValue } from "./practice-metrics.ts";

interface CreatePracticeSessionRecordInput {
  id: string;
  title: string;
  averageBpm: number;
  result: PracticeTimerResult;
  phases: PracticePhase[];
  notes: string;
  phaseNotes: Record<number, string>;
  guitarType?: GuitarType;
  /** Guitarra concreta de Mi equipo, si se eligió. */
  guitarId?: string;
  /**
   * Estado final de la práctica cuando no coincide con el del temporizador,
   * por ejemplo una práctica libre que termina el usuario.
   */
  completed?: boolean;
  /** Estado de ánimo al empezar, si la métrica estaba activa y se respondió. */
  mood?: PracticeMetricValue;
  /** Nivel de foco al empezar, si la métrica estaba activa y se respondió. */
  focus?: PracticeMetricValue;
  /** Línea temporal de BPM de la sesión; sin ella no hay BPM por bloque. */
  bpmSamples?: MetronomeBpmSample[];
  /** Bloques durante los que el metrónomo llegó a sonar. */
  metronomeBlockIndexes?: Iterable<number>;
}

export function createPracticeSessionRecord({
  id,
  title,
  averageBpm,
  result,
  phases,
  notes,
  phaseNotes,
  guitarType,
  guitarId,
  completed: storedCompleted,
  mood: storedMood,
  focus: storedFocus,
  bpmSamples,
  metronomeBlockIndexes,
}: CreatePracticeSessionRecordInput): SessionRecord {
  const mood = normalizePracticeMetricValue(storedMood);
  const focus = normalizePracticeMetricValue(storedFocus);
  const blockAverageBpms =
    bpmSamples && bpmSamples.length > 0
      ? getBlockAverageBpms(
          bpmSamples,
          result.phases.map((phase) => phase.elapsedSeconds),
          metronomeBlockIndexes,
        )
      : [];

  return {
    id,
    title,
    startedAt: result.startedAt,
    durationSeconds: result.elapsedSeconds,
    averageBpm,
    completed: storedCompleted ?? result.completed,
    skillSeconds: normalizeSkillSeconds(result.skillSeconds),
    notes: notes.trim() || undefined,
    ...(guitarType ? { guitarType } : {}),
    ...(guitarId ? { guitarId } : {}),
    ...(mood ? { mood } : {}),
    ...(focus ? { focus } : {}),
    phases: result.phases.map((phase, index) => ({
      ...phase,
      name: phases[index]?.name ?? phase.name,
      ...(blockAverageBpms[index]
        ? { averageBpm: blockAverageBpms[index] }
        : {}),
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

/** Solo el tipo de guitarra admitido; cualquier otro valor se descarta. */
export function normalizeGuitarType(value: unknown): GuitarType | undefined {
  return value === "electric" || value === "acoustic" ? value : undefined;
}

/**
 * Conserva el BPM medio del bloque solo si es un número finito y positivo. Un
 * valor inválido se elimina sin perder el bloque.
 */
function normalizeSessionPhase(
  phase: SessionPhaseRecord,
): SessionPhaseRecord {
  const { averageBpm: storedBpm, ...rest } = phase;
  return typeof storedBpm === "number" &&
    Number.isFinite(storedBpm) &&
    storedBpm > 0
    ? { ...rest, averageBpm: Math.round(storedBpm) }
    : rest;
}

/** Rellena las categorías que falten en una sesión cargada de datos antiguos. */
export function normalizeSessionRecord(session: SessionRecord): SessionRecord {
  const {
    guitarType: storedGuitarType,
    guitarId: storedGuitarId,
    mood: storedMood,
    focus: storedFocus,
    phases,
    ...rest
  } = session;
  const guitarType = normalizeGuitarType(storedGuitarType);
  const guitarId =
    typeof storedGuitarId === "string" && storedGuitarId.trim() !== ""
      ? storedGuitarId
      : undefined;
  const mood = normalizePracticeMetricValue(storedMood);
  const focus = normalizePracticeMetricValue(storedFocus);

  return {
    ...rest,
    ...(guitarType ? { guitarType } : {}),
    ...(guitarId ? { guitarId } : {}),
    ...(mood ? { mood } : {}),
    ...(focus ? { focus } : {}),
    skillSeconds: normalizeSkillSeconds(session.skillSeconds),
    ...(phases ? { phases: phases.map(normalizeSessionPhase) } : {}),
  };
}
