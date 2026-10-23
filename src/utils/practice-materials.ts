import type {
  PracticePhase,
  PracticeResource,
  RepertoireItem,
} from "../types/practice.ts";

/**
 * Material que se ve mientras se practica un bloque: el suyo propio y el del
 * elemento de repertorio al que está vinculado. Los repetidos se muestran una
 * sola vez y el material del bloque tiene prioridad sobre el de la canción.
 */
export function getPhaseMaterials(
  phase: PracticePhase | undefined,
  repertoireItems: readonly RepertoireItem[],
): PracticeResource[] {
  if (!phase) return [];

  const linkedItem = phase.repertoireItemId
    ? repertoireItems.find(
        (item) => item.id === phase.repertoireItemId && item.kind === "song",
      )
    : undefined;

  const candidates: PracticeResource[] = [
    ...(phase.resources ?? []),
    ...(linkedItem?.guitarPro ? [linkedItem.guitarPro] : []),
    ...(linkedItem?.resources ?? []),
  ];

  const seen = new Set<string>();
  return candidates.filter((resource) => {
    if (!resource || seen.has(resource.id)) return false;
    seen.add(resource.id);
    return true;
  });
}
