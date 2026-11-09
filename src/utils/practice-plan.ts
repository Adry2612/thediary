import type {
  PracticePhase,
  RepertoireItem,
} from "../types/practice.ts";

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

/**
 * Deja un bloque con solo los vínculos que su categoría admite. Una rutina
 * antigua pudo vincular una canción desde un bloque de técnica; al abrirla o
 * lanzarla se limpia ese vínculo en la copia de trabajo sin tocar el original.
 */
export function normalizePracticePhaseLinks(
  phase: PracticePhase,
): PracticePhase {
  const next = { ...phase };

  if (next.skill !== "repertoire") {
    next.repertoireItemId = undefined;
    next.repertoirePartId = undefined;
    next.catalogSong = undefined;
  } else if (next.repertoireItemId) {
    // Una canción ya añadida al repertorio manda sobre la referencia temporal.
    next.catalogSong = undefined;
  }
  if (next.skill !== "lick") {
    next.lickId = undefined;
  }

  return next;
}

export function clonePracticePhases(
  phases: PracticePhase[],
): PracticePhase[] {
  return phases.map((phase) => {
    const normalized = normalizePracticePhaseLinks(phase);
    return {
      ...normalized,
      exercises: [...(normalized.exercises ?? [])],
      resources: (normalized.resources ?? []).map((resource) => ({
        ...resource,
      })),
      ...(normalized.catalogSong
        ? { catalogSong: { ...normalized.catalogSong } }
        : {}),
    };
  });
}

/**
 * Sincroniza el nombre de cada bloque de repertorio con el título de su
 * canción. Devuelve el mismo array si no hay nada que corregir para no
 * provocar renders ni reinicios innecesarios.
 */
export function normalizeRepertoirePhaseNames(
  phases: PracticePhase[],
  repertoireItems: readonly RepertoireItem[],
): PracticePhase[] {
  let changed = false;
  const normalized = phases.map((phase) => {
    if (phase.skill !== "repertoire" || !phase.repertoireItemId) {
      return phase;
    }
    const song = repertoireItems.find(
      (item) =>
        item.id === phase.repertoireItemId && item.kind === "song",
    );
    if (!song || phase.name === song.title) return phase;

    changed = true;
    return { ...phase, name: song.title };
  });

  return changed ? normalized : phases;
}

export function getPracticePlanDuration(
  phases: Pick<PracticePhase, "durationMinutes">[],
) {
  return phases.reduce(
    (total, phase) => total + (phase.durationMinutes || 0),
    0,
  );
}

/**
 * Decide si guardar una rutina actualiza una existente o crea una nueva.
 * `editingTemplateId` solo está presente cuando la rutina ya existe; cargar
 * una plantilla en un plan nuevo no la convierte en la rutina editada.
 */
export function getRoutineSaveTarget(
  editingTemplateId: string | null | undefined,
  newId: string,
): { id: string; isUpdate: boolean } {
  if (editingTemplateId) {
    return { id: editingTemplateId, isUpdate: true };
  }
  return { id: newId, isUpdate: false };
}

/**
 * Firma estructural de un plan: cambia al añadir, quitar o redimensionar
 * bloques, pero no cuando solo cambia su contenido (canción, lick, material o
 * nombre). El temporizador usa esta firma para decidir cuándo reiniciarse.
 */
export function getPracticePlanKey(
  phases: Pick<PracticePhase, "id" | "durationMinutes">[],
): string {
  return phases.map((phase) => `${phase.id}:${phase.durationMinutes}`).join("|");
}
