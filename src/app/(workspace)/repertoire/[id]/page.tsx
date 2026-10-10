'use client';

import Link from 'next/link';
import { use } from 'react';
import { RepertoireItemCard } from '@/components/repertoire/RepertoireItemCard';
import { getRepertoirePracticeStats } from '@/lib/repertoire-analytics';
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

  if (!hasHydrated) {
    return (
      <main className='mx-auto max-w-5xl px-5 py-16 text-sm text-muted'>
        {repertoireDetail.loading}
      </main>
    );
  }

  if (!item) {
    return (
      <main className='mx-auto max-w-5xl px-5 py-16 sm:px-8'>
        <Link
          href='/repertoire'
          className='text-sm text-muted underline underline-offset-4'
        >
          {repertoireDetail.back}
        </Link>
        <h1 className='mt-8 font-sans text-3xl font-semibold'>
          {repertoireDetail.notFound}
        </h1>
      </main>
    );
  }

  return (
    <main className='mx-auto min-h-screen max-w-5xl px-5 py-12 sm:px-8 sm:py-16'>
      <RepertoireItemCard
        item={item}
        practiceStats={practiceStats}
        onSave={saveRepertoireItem}
        onDelete={deleteRepertoireItem}
        detail
      />
    </main>
  );
}
