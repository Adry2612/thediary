import type {
  GuitarType,
  PracticeSkill,
  SessionPhaseRecord,
  SessionRecord,
} from "../types/practice.ts";
import type { CatalogCandidate } from "../types/catalog.ts";
import {
  getRepertoirePartIds,
  withRepertoirePartIds,
} from "./practice-parts.ts";

export interface EditableSessionBlock {
  id: SessionPhaseRecord["id"];
  name: string;
  skill: PracticeSkill;
  plannedMinutes: number | null;
  actualSeconds: number;
  notes: string;
  exercises?: string[];
  resources?: SessionPhaseRecord["resources"];
  repertoireItemId?: string;
  repertoirePartIds: string[];
  catalogSong?: CatalogCandidate;
  lickId?: string;
  /** BPM del bloque ya guardado; se conserva si no se toca. */
  averageBpm?: number;
}

export interface EditableSession {
  title: string;
  notes: string;
  completed: boolean;
  /** Solo se usa cuando la sesión no tiene bloques. */
  durationSeconds: number;
  /** `null` cuando la práctica no tiene tipo de guitarra registrado. */
  guitarType: GuitarType | null;
  /** Guitarra concreta de Mi equipo; `null` si no se eligió. */
  guitarId: string | null;
  blocks: EditableSessionBlock[];
}

export function toEditableSession(session: SessionRecord): EditableSession {
  return {
    title: session.title ?? "",
    notes: session.notes ?? "",
    completed: session.completed ?? false,
    durationSeconds: session.durationSeconds,
    guitarType: session.guitarType ?? null,
    guitarId: session.guitarId ?? null,
    blocks: (session.phases ?? []).map((phase) => ({
      id: phase.id,
      name: phase.name,
      skill: phase.skill,
      plannedMinutes: phase.durationMinutes ?? null,
      actualSeconds: phase.elapsedSeconds,
      notes: phase.notes ?? "",
      exercises: [...(phase.exercises ?? [])],
      resources: phase.resources?.map((resource) => ({ ...resource })),
      repertoireItemId: phase.repertoireItemId,
      repertoirePartIds: getRepertoirePartIds(phase),
      ...(phase.catalogSong ? { catalogSong: { ...phase.catalogSong } } : {}),
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
      elapsedSeconds: Math.max(0, Math.round(block.actualSeconds)),
      ...(block.notes.trim() ? { notes: block.notes.trim() } : {}),
      ...(block.exercises?.length ? { exercises: [...block.exercises] } : {}),
      ...(block.resources?.length
        ? { resources: block.resources.map((resource) => ({ ...resource })) }
        : {}),
      ...(block.repertoireItemId
        ? { repertoireItemId: block.repertoireItemId }
        : {}),
      ...(block.repertoireItemId
        ? withRepertoirePartIds(block.repertoirePartIds)
        : {}),
      ...(block.catalogSong && !block.repertoireItemId
        ? { catalogSong: { ...block.catalogSong } }
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
  const {
    guitarType: _storedGuitarType,
    guitarId: _storedGuitarId,
    ...sessionWithoutGuitar
  } = session;
  const base = {
    ...sessionWithoutGuitar,
    ...(draft.guitarType ? { guitarType: draft.guitarType } : {}),
    ...(draft.guitarId ? { guitarId: draft.guitarId } : {}),
    title: title || undefined,
    notes: draft.notes.trim() || undefined,
    completed: draft.completed,
  };

  if (blocks.length === 0) {
    const hadBlocks = Boolean(session.phases && session.phases.length > 0);
    return {
      ...base,
      phases: hadBlocks ? undefined : session.phases,
      durationSeconds: Math.max(0, Math.round(draft.durationSeconds)),
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
