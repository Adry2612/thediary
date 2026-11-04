'use client';

import { ChordChartEditor } from '@/components/repertoire/ChordChartEditor';
import { TabScoreEditor } from '@/components/tab-score/TabScoreEditor';
import { CollapsibleSection } from '@/components/ui/CollapsibleSection';
import { useI18nSection } from '@/i18n/I18nProvider';
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
  const text = useI18nSection('repertoire');
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
        <CollapsibleSection
          title={text.tabTitle}
          description={text.tabDescription}
        >
          <div className='mt-4'>
            <TabScoreEditor
              initialScore={score}
              label={item.title}
              onChange={(next) => update({ score: next })}
            />
          </div>
        </CollapsibleSection>
      ) : null}
    </>
  );
}
