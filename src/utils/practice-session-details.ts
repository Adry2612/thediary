import type {
  GuitarLick,
} from "../types/lick.ts";
import type {
  RepertoireItem,
  SessionPhaseRecord,
} from "../types/practice.ts";

/** Elemento de repertorio al que apunta un bloque, si todavía existe. */
export function getLinkedRepertoireItem(
  phase: Pick<SessionPhaseRecord, "repertoireItemId">,
  repertoireItems: readonly RepertoireItem[],
): RepertoireItem | undefined {
  if (!phase.repertoireItemId) return undefined;
  return repertoireItems.find(
    (candidate) => candidate.id === phase.repertoireItemId,
  );
}

/**
 * Nombre legible del vínculo de repertorio de un bloque guardado. La canción
 * basta cuando el bloque no eligió parte o cuando la parte ya no existe.
 */
export function getLinkedRepertoireLabel(
  phase: Pick<
    SessionPhaseRecord,
    "repertoireItemId" | "repertoirePartId"
  >,
  repertoireItems: RepertoireItem[],
): string | null {
  const item = getLinkedRepertoireItem(phase, repertoireItems);
  if (!item) return null;

  const part = phase.repertoirePartId
    ? item.parts.find((candidate) => candidate.id === phase.repertoirePartId)
    : undefined;

  return part ? `${item.title} · ${part.name}` : item.title;
}

/** Nombre de la parte guardada, solo si la canción y la parte existen. */
export function getLinkedRepertoirePartName(
  phase: Pick<
    SessionPhaseRecord,
    "repertoireItemId" | "repertoirePartId"
  >,
  repertoireItems: RepertoireItem[],
): string | null {
  const item = getLinkedRepertoireItem(phase, repertoireItems);
  if (!item || !phase.repertoirePartId) return null;
  return (
    item.parts.find((part) => part.id === phase.repertoirePartId)?.name ?? null
  );
}

/**
 * Título que debe mostrar un bloque de práctica. En repertorio manda siempre
 * la canción vinculada; el nombre guardado solo es el respaldo de datos
 * antiguos o de una referencia que ya no existe.
 */
export function getPracticeBlockTitle(
  phase: Pick<
    SessionPhaseRecord,
    "name" | "skill" | "repertoireItemId"
  >,
  repertoireItems: readonly RepertoireItem[],
): string {
  if (phase.skill !== "repertoire") return phase.name;
  return getLinkedRepertoireItem(phase, repertoireItems)?.title ?? phase.name;
}

/** Título del lick vinculado a un bloque guardado, si todavía existe. */
export function getLinkedLickLabel(
  phase: Pick<SessionPhaseRecord, "lickId">,
  licks: readonly GuitarLick[],
): string | null {
  if (!phase.lickId) return null;
  return licks.find((lick) => lick.id === phase.lickId)?.title ?? null;
}
