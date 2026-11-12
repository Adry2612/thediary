'use client';

import { ChordChartEditor } from '@/components/repertoire/ChordChartEditor';
import { normalizeChordChart } from '@/utils/repertoire-chord-chart';
import type { RepertoireItem } from '@/types/practice';

/**
 * Editor de la letra con acordes de una canción ya guardada. Cada cambio se
 * guarda directamente en el repertorio.
 */
export function RepertoireSongEditor({
  item,
  onSave,
}: {
  item: RepertoireItem;
  onSave: (item: RepertoireItem) => void;
}) {
  const chordChart = normalizeChordChart(item.chordChart);

  function update(patch: Partial<RepertoireItem>) {
    onSave({ ...item, ...patch, updatedAt: new Date().toISOString() });
  }

  return (
    <ChordChartEditor
      value={chordChart}
      onChange={(next) => update({ chordChart: next })}
    />
  );
}
