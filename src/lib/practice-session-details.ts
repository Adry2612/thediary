import type {
  RepertoireItem,
  SessionPhaseRecord,
} from "@/types/practice";

export function getLinkedPartLabel(
  phase: Pick<
    SessionPhaseRecord,
    "repertoireItemId" | "repertoirePartId"
  >,
  repertoireItems: RepertoireItem[],
): string | null {
  if (!phase.repertoireItemId || !phase.repertoirePartId) return null;

  const item = repertoireItems.find(
    (candidate) => candidate.id === phase.repertoireItemId,
  );
  const part = item?.parts.find(
    (candidate) => candidate.id === phase.repertoirePartId,
  );

  return item && part ? `${item.title} · ${part.name}` : null;
}
