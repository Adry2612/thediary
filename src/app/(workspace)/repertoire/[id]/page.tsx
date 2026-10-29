'use client';

import { use } from 'react';
import { RepertoireItemCard } from '@/components/repertoire/RepertoireItemCard';
import { RepertoireSongEditor } from '@/components/repertoire/RepertoireSongEditor';
import { BackLink } from '@/components/ui/BackLink';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageShell } from '@/components/ui/PageShell';
import {
  getRepertoireItemPracticeStats,
  getRepertoirePracticeStats,
} from '@/utils/repertoire-analytics';
import { usePracticeStore } from '@/stores/usePracticeStore';
import { getDictionary } from '@/i18n/translations';

interface Props {
  params: Promise<{ id: string }>;
}

export default function RepertoireDetailPage({ params }: Props) {
  const repertoireDetail = getDictionary().repertoireDetail;
  const items = usePracticeStore((state) => state.repertoireItems);
  const saveRepertoireItem = usePracticeStore(
    (state) => state.saveRepertoireItem,
  );
  const deleteRepertoireItem = usePracticeStore(
    (state) => state.deleteRepertoireItem,
  );
  const hasHydrated = usePracticeStore((state) => state.hasHydrated);
  const history = usePracticeStore((state) => state.history);
  const { id: itemId } = use(params);
  const item = items.find((candidate) => candidate.id === itemId);
  const practiceStats = getRepertoirePracticeStats(history).get(itemId);
  const itemPractice = getRepertoireItemPracticeStats(history).get(itemId);

  if (!hasHydrated) {
    return (
      <PageShell>
        <p className='text-sm text-muted'>{repertoireDetail.loading}</p>
      </PageShell>
    );
  }

  if (!item) {
    return (
      <PageShell>
        <BackLink href='/repertoire'>{repertoireDetail.back}</BackLink>
        <PageHeader className='mt-8' title={repertoireDetail.notFound} />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <BackLink href='/repertoire'>{repertoireDetail.back}</BackLink>
      <div className='mt-6'>
        <RepertoireItemCard
          item={item}
          practiceStats={practiceStats}
          itemPractice={itemPractice}
          onSave={saveRepertoireItem}
          onDelete={deleteRepertoireItem}
          detail
        />
      </div>
      <RepertoireSongEditor item={item} onSave={saveRepertoireItem} />
    </PageShell>
  );
}
