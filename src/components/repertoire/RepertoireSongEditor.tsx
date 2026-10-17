'use client';

import { ChordChartEditor } from '@/components/repertoire/ChordChartEditor';
import { TabEditor } from '@/components/repertoire/TabEditor';
import { normalizeChordChart } from '@/lib/repertoire-chord-chart';
import { normalizeTab } from '@/lib/repertoire-tab';
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
  const tab = normalizeTab(item.tab, item.tuning);

  function update(patch: Partial<RepertoireItem>) {
    onSave({ ...item, ...patch, updatedAt: new Date().toISOString() });
  }

  return (
    <>
      <ChordChartEditor
        value={chordChart}
        onChange={(next) => update({ chordChart: next })}
      />
      <TabEditor value={tab} onChange={(next) => update({ tab: next })} />
    </>
  );
}
