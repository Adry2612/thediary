import type {
  PracticePhase,
  PracticeTemplate,
} from "../types/practice.ts";

const LINK_FIELDS = [
  "name",
  "repertoireItemId",
  "repertoirePartId",
  "lickId",
] as const;

/**
 * Si la sesión cambió los vínculos de los bloques respecto a la rutina de la
 * que salió. Se comparan por id de bloque, no por posición, para no confundir
 * una reordenación de la rutina con un cambio de canción o lick.
 */
export function hasPracticeLinkChanges(
  sessionPhases: readonly PracticePhase[],
  routinePhases: readonly PracticePhase[],
): boolean {
  if (sessionPhases.length !== routinePhases.length) return true;

  const routineById = new Map(
    routinePhases.map((phase) => [phase.id, phase]),
  );

  return sessionPhases.some((phase) => {
    const routinePhase = routineById.get(phase.id);
    if (!routinePhase) return true;
    return LINK_FIELDS.some(
      (field) => phase[field] !== routinePhase[field],
    );
  });
}

/**
 * Aplica a la última versión de la rutina solo los vínculos y nombres que usó
 * la sesión. Duraciones, recursos y cualquier otro cambio hecho en la rutina
 * desde otro sitio se conservan.
 */
export function applyRoutineLinkChanges(
  routine: PracticeTemplate,
  sessionPhases: readonly PracticePhase[],
  updatedAt: string,
): PracticeTemplate {
  const sessionById = new Map(
    sessionPhases.map((phase) => [phase.id, phase]),
  );

  return {
    ...routine,
    phases: routine.phases.map((phase) => {
      const sessionPhase = sessionById.get(phase.id);
      if (!sessionPhase) return phase;

      return {
        ...phase,
        name: sessionPhase.name,
        repertoireItemId: sessionPhase.repertoireItemId,
        repertoirePartId: sessionPhase.repertoirePartId,
        lickId: sessionPhase.lickId,
      };
    }),
    updatedAt,
  };
}
