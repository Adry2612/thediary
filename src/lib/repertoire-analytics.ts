import type { RepertoireItem, SessionRecord } from "@/types/practice";

export type RepertoirePartPracticeStats = {
  practiceSeconds: number;
  sessionCount: number;
};

/** Tiempo practicado de un elemento, con o sin partes concretas. */
export type RepertoireItemPracticeStats = {
  practiceSeconds: number;
  sessionCount: number;
};

export interface RepertoireOverview {
  songCount: number;
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

/**
 * Tiempo practicado por elemento: cuenta cualquier fase completada que nombre
 * el elemento, aunque no elija una parte concreta. Es la cifra que se muestra
 * en la biblioteca; la de `getRepertoirePracticeStats` sigue siendo por parte.
 */
export function getRepertoireItemPracticeStats(
  history: SessionRecord[],
): Map<string, RepertoireItemPracticeStats> {
  const statsByItem = new Map<string, RepertoireItemPracticeStats>();

  for (const session of history) {
    const practicedItems = new Set<string>();
    for (const phase of session.phases ?? []) {
      if (phase.elapsedSeconds <= 0 || !phase.repertoireItemId) continue;

      const stats = statsByItem.get(phase.repertoireItemId) ?? {
        practiceSeconds: 0,
        sessionCount: 0,
      };
      stats.practiceSeconds += phase.elapsedSeconds;
      statsByItem.set(phase.repertoireItemId, stats);
      practicedItems.add(phase.repertoireItemId);
    }

    for (const itemId of practicedItems) {
      const stats = statsByItem.get(itemId);
      if (stats) stats.sessionCount += 1;
    }
  }

  return statsByItem;
}

export function getRepertoireOverview(
  items: RepertoireItem[],
  practiceStats: Map<string, RepertoireItemPracticeStats>,
): RepertoireOverview {
  return items.reduce<RepertoireOverview>(
    (overview, item) => {
      if (item.kind !== "song") return overview;
      overview.songCount += 1;

      for (const part of item.parts) {
        overview.partCount += 1;
        if (part.learned) overview.learnedCount += 1;
      }
      overview.totalSeconds += practiceStats.get(item.id)?.practiceSeconds ?? 0;

      return overview;
    },
    {
      songCount: 0,
      learnedCount: 0,
      partCount: 0,
      totalSeconds: 0,
    },
  );
}
