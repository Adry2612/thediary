import type { RepertoireItem, SessionRecord } from "@/types/practice";

export type RepertoirePartPracticeStats = {
  practiceSeconds: number;
  sessionCount: number;
};

export interface RepertoireOverview {
  songCount: number;
  lickCount: number;
  learnedCount: number;
  partCount: number;
  totalSeconds: number;
}

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
      if (
        phase.elapsedSeconds <= 0 ||
        !phase.repertoireItemId ||
        !phase.repertoirePartId
      ) {
        continue;
      }

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

export function getRepertoireOverview(
  items: RepertoireItem[],
  practiceStats: Map<string, Map<string, RepertoirePartPracticeStats>>,
): RepertoireOverview {
  return items.reduce<RepertoireOverview>(
    (overview, item) => {
      if (item.kind === "song") overview.songCount += 1;
      if (item.kind === "lick") overview.lickCount += 1;

      for (const part of item.parts) {
        overview.partCount += 1;
        if (part.learned) overview.learnedCount += 1;
        overview.totalSeconds +=
          practiceStats.get(item.id)?.get(part.id)?.practiceSeconds ?? 0;
      }

      return overview;
    },
    {
      songCount: 0,
      lickCount: 0,
      learnedCount: 0,
      partCount: 0,
      totalSeconds: 0,
    },
  );
}
