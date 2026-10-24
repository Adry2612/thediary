import type {
  GuitarType,
  PracticeSkill,
  SessionPhaseRecord,
  SessionRecord,
} from "../types/practice.ts";

export interface EditableSessionBlock {
  id: SessionPhaseRecord["id"];
  name: string;
  skill: PracticeSkill;
  plannedMinutes: number | null;
  actualMinutes: number;
  notes: string;
  exercises?: string[];
  resources?: SessionPhaseRecord["resources"];
  repertoireItemId?: string;
  repertoirePartId?: string;
  lickId?: string;
  /** BPM del bloque ya guardado; se conserva si no se toca. */
  averageBpm?: number;
}

export interface EditableSession {
  title: string;
  notes: string;
  completed: boolean;
  /** Solo se usa cuando la sesión no tiene bloques. */
  durationMinutes: number;
  /** `null` cuando la práctica no tiene tipo de guitarra registrado. */
  guitarType: GuitarType | null;
  blocks: EditableSessionBlock[];
}

function secondsToMinutes(seconds: number): number {
  return Math.round((seconds / 60) * 100) / 100;
}

function minutesToSeconds(minutes: number): number {
  if (!Number.isFinite(minutes) || minutes < 0) return 0;
  return Math.round(minutes * 60);
}

export function toEditableSession(session: SessionRecord): EditableSession {
  return {
    title: session.title ?? "",
    notes: session.notes ?? "",
    completed: session.completed ?? false,
    durationMinutes: secondsToMinutes(session.durationSeconds),
    guitarType: session.guitarType ?? null,
    blocks: (session.phases ?? []).map((phase) => ({
      id: phase.id,
      name: phase.name,
      skill: phase.skill,
      plannedMinutes: phase.durationMinutes ?? null,
      actualMinutes: secondsToMinutes(phase.elapsedSeconds),
      notes: phase.notes ?? "",
      exercises: [...(phase.exercises ?? [])],
      resources: phase.resources?.map((resource) => ({ ...resource })),
      repertoireItemId: phase.repertoireItemId,
      repertoirePartId: phase.repertoirePartId,
      lickId: phase.lickId,
      averageBpm: phase.averageBpm,
    })),
  };
}

/**
 * Reconstruye la sesión guardada a partir del formulario de edición.
 *
 * Cuando hay bloques, la duración real y el reparto por categoría se derivan de
 * ellos para que las estadísticas del dashboard sigan cuadrando. Si no quedan
 * bloques, se conserva el reparto anterior y la duración se toma del campo
 * directo.
 */
export function applySessionEdit(
  session: SessionRecord,
  draft: EditableSession,
): SessionRecord {
  const blocks: SessionPhaseRecord[] = draft.blocks
    .map((block) => ({
      id: block.id,
      name: block.name.trim(),
      skill: block.skill,
      elapsedSeconds: minutesToSeconds(block.actualMinutes),
      ...(block.notes.trim() ? { notes: block.notes.trim() } : {}),
      ...(block.exercises?.length ? { exercises: [...block.exercises] } : {}),
      ...(block.resources?.length
        ? { resources: block.resources.map((resource) => ({ ...resource })) }
        : {}),
      ...(block.repertoireItemId
        ? { repertoireItemId: block.repertoireItemId }
        : {}),
      ...(block.repertoirePartId
        ? { repertoirePartId: block.repertoirePartId }
        : {}),
      ...(block.lickId ? { lickId: block.lickId } : {}),
      ...(block.averageBpm && block.averageBpm > 0
        ? { averageBpm: Math.round(block.averageBpm) }
        : {}),
      ...(block.plannedMinutes === null ||
      !Number.isFinite(block.plannedMinutes)
        ? {}
        : { durationMinutes: Math.max(0, Math.round(block.plannedMinutes)) }),
    }))
    .filter((block) => block.name.length > 0);

  const title = draft.title.trim();
  const { guitarType: _storedGuitarType, ...sessionWithoutGuitarType } = session;
  const base = {
    ...sessionWithoutGuitarType,
    ...(draft.guitarType ? { guitarType: draft.guitarType } : {}),
    title: title || undefined,
    notes: draft.notes.trim() || undefined,
    completed: draft.completed,
  };

  if (blocks.length === 0) {
    const hadBlocks = Boolean(session.phases && session.phases.length > 0);
    return {
      ...base,
      phases: hadBlocks ? undefined : session.phases,
      durationSeconds: minutesToSeconds(draft.durationMinutes),
    };
  }

  const skillSeconds: Record<PracticeSkill, number> = {
    technique: 0,
    theory: 0,
    repertoire: 0,
    lick: 0,
    improvisation: 0,
  };
  let durationSeconds = 0;
  for (const block of blocks) {
    skillSeconds[block.skill] += block.elapsedSeconds;
    durationSeconds += block.elapsedSeconds;
  }

  return { ...base, phases: blocks, durationSeconds, skillSeconds };
}
