import type { SessionRecord } from "@/types/practice";

export type RepertoirePartPracticeStats = {
  practiceSeconds: number;
  sessionCount: number;
};

export function getRepertoirePracticeStats(
  history: SessionRecord[],
): Map<string, Map<string, RepertoirePartPracticeStats>> {
  const statsByItem = new Map<
    string,
    Map<string, RepertoirePartPracticeStats>
  >();

  for (const session of history) {
    const practicedParts = new Map<string, Set<string>>();
    for (const phase of session.phases ?? []) {
      if (!phase.repertoireItemId || !phase.repertoirePartId) continue;

      const itemStats = statsByItem.get(phase.repertoireItemId) ?? new Map();
      const partStats = itemStats.get(phase.repertoirePartId) ?? {
        practiceSeconds: 0,
        sessionCount: 0,
      };
      partStats.practiceSeconds += phase.elapsedSeconds;
      itemStats.set(phase.repertoirePartId, partStats);
      statsByItem.set(phase.repertoireItemId, itemStats);
      const itemParts = practicedParts.get(phase.repertoireItemId) ?? new Set();
      itemParts.add(phase.repertoirePartId);
      practicedParts.set(phase.repertoireItemId, itemParts);
    }

    for (const [itemId, partIds] of practicedParts) {
      for (const partId of partIds) {
        const partStats = statsByItem.get(itemId)?.get(partId);
        if (partStats) partStats.sessionCount += 1;
      }
    }
  }

  return statsByItem;
}
