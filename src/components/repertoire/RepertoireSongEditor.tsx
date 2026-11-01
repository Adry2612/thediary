'use client';

import { ChordChartEditor } from '@/components/repertoire/ChordChartEditor';
import { TabScoreEditor } from '@/components/tab-score/TabScoreEditor';
import { isTabEditorEnabled } from '@/utils/feature-flags';
import { normalizeChordChart } from '@/utils/repertoire-chord-chart';
import { resolveTabScore } from '@/utils/tab-score/resolve';
import type { RepertoireItem } from '@/types/practice';

/**
 * Editor de la letra con acordes y la tablatura de una canción ya guardada.
 * Cada cambio se guarda directamente en el repertorio.
 */
export function RepertoireSongEditor({
  item,
  onSave,
}: {
  item: RepertoireItem;
  onSave: (item: RepertoireItem) => void;
}) {
  const chordChart = normalizeChordChart(item.chordChart);
  const score = resolveTabScore({
    score: item.score,
    tab: item.tab,
    tuning: item.tuning,
  });

  function update(patch: Partial<RepertoireItem>) {
    onSave({ ...item, ...patch, updatedAt: new Date().toISOString() });
  }

  return (
    <>
      <ChordChartEditor
        value={chordChart}
        onChange={(next) => update({ chordChart: next })}
      />
      {isTabEditorEnabled ? (
        <TabScoreEditor
          initialScore={score}
          label={item.title}
          onChange={(next) => update({ score: next })}
        />
      ) : null}
    </>
  );
}
