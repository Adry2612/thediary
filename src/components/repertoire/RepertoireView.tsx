'use client';

import { useMemo, useState } from 'react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageShell } from '@/components/ui/PageShell';
import { ArtistRanking } from '@/components/repertoire/ArtistRanking';
import { RepertoireItemCard } from '@/components/repertoire/RepertoireItemCard';
import { ForgottenRepertoireWidget } from '@/components/repertoire/ForgottenRepertoireWidget';
import { SelectField } from '@/components/ui/SelectField';
import { SearchField } from '@/components/ui/SearchField';
import { PlusIcon } from '@/components/ui/icons';
import { formatPracticeDuration } from '@/utils/dashboard-data';
import {
  getArtistPracticeStats,
  getRepertoireItemPracticeStats,
  getRepertoireOverview,
  getRepertoirePracticeStats,
} from '@/utils/repertoire-analytics';
import { getForgottenRepertoireItem } from '@/utils/repertoire-forgotten';
import {
  getFilteredRepertoireItems,
  isRepertoireProgressFilter,
  isRepertoireSortOrder,
  type FutureLearnFilter,
  type GuitarTypeFilter,
} from '@/utils/repertoire-filtering';
import {
  groupRepertoireItems,
  isRepertoireGroupBy,
} from '@/utils/repertoire-grouping';
import type { RepertoireItem } from '@/types/practice';
import { useRepertoireFilters } from '@/hooks/useRepertoireFilters';
import { usePracticeStore } from '@/stores/usePracticeStore';
import { useRouter } from 'next/navigation';
import { useI18nSection } from '@/i18n/I18nProvider';
import { RepertoireSkeleton } from '@/components/ui/Skeletons';
import { RepertoireItemDialog } from '@/components/repertoire/RepertoireItemDialog';

export function RepertoireView() {
  const text = useI18nSection('repertoire');
  const guitarFilters = [
    { value: 'all' as const, label: text.allGuitars },
    { value: 'electric' as const, label: text.electric },
    { value: 'acoustic' as const, label: text.acoustic },
  ];
  const futureFilters = [
    { value: 'all' as const, label: text.allRepertoire },
    { value: 'current' as const, label: text.current },
    { value: 'future' as const, label: text.future },
  ];
  const progressFilters = [
    { value: 'all' as const, label: text.allStates },
    { value: 'learning' as const, label: text.learning },
    { value: 'learned' as const, label: text.learned },
  ];
  const sortOptions = [
    { value: 'original' as const, label: text.original },
    { value: 'recent' as const, label: text.recent },
    { value: 'title' as const, label: text.titleSort },
    { value: 'artist' as const, label: text.artistSort },
    { value: 'practice' as const, label: text.mostPracticed },
  ];
  const groupOptions = [
    { value: 'none' as const, label: text.groupNone },
    { value: 'artist' as const, label: text.groupArtist },
    { value: 'album' as const, label: text.groupAlbum },
  ];
  const router = useRouter();
  const [isCreatingItem, setIsCreatingItem] = useState(false);
  const history = usePracticeStore((state) => state.history);
  const items = usePracticeStore((state) => state.repertoireItems);
  const saveRepertoireItem = usePracticeStore(
    (state) => state.saveRepertoireItem,
  );
  const deleteRepertoireItem = usePracticeStore(
    (state) => state.deleteRepertoireItem,
  );
  const hasHydrated = usePracticeStore((state) => state.hasHydrated);
  const persistenceError = usePracticeStore((state) => state.persistenceError);
  const {
    guitarTypeFilter,
    setGuitarTypeFilter,
    futureLearnFilter,
    setFutureLearnFilter,
    progressFilter,
    setProgressFilter,
    sortOrder,
    setSortOrder,
    groupBy,
    setGroupBy,
    searchQuery,
    setSearchQuery,
    hasActiveFilters,
    clearFilters,
  } = useRepertoireFilters();
  const practiceStats = useMemo(
    () => getRepertoirePracticeStats(history),
    [history],
  );
  const itemPracticeStats = useMemo(
    () => getRepertoireItemPracticeStats(history),
    [history],
  );
  const artistPractice = useMemo(
    () => getArtistPracticeStats(history, items),
    [history, items],
  );
  const today = useMemo(() => new Date(), []);
  const forgotten = useMemo(
    () => getForgottenRepertoireItem(items, itemPracticeStats, today),
    [items, itemPracticeStats, today],
  );
  const visibleItems = useMemo(
    () =>
      getFilteredRepertoireItems(
        items,
        {
          query: searchQuery,
          progress: progressFilter,
          sort: sortOrder,
          guitarType: guitarTypeFilter,
          futureLearn: futureLearnFilter,
        },
        itemPracticeStats,
      ),
    [
      futureLearnFilter,
      guitarTypeFilter,
      itemPracticeStats,
      items,
      progressFilter,
      searchQuery,
      sortOrder,
    ],
  );
  const overview = useMemo(
    () => getRepertoireOverview(items, itemPracticeStats),
    [items, itemPracticeStats],
  );
  const groups = useMemo(
    () =>
      groupRepertoireItems(visibleItems, groupBy, {
        unknownLabel:
          groupBy === 'album' ? text.groupUnknownAlbum : text.groupUnknownArtist,
      }),
    [visibleItems, groupBy, text.groupUnknownAlbum, text.groupUnknownArtist],
  );

  function renderListItem(item: RepertoireItem) {
    return (
      <li key={item.id} className='cursor-pointer'>
        <RepertoireItemCard
          item={item}
          practiceStats={practiceStats.get(item.id)}
          itemPractice={itemPracticeStats.get(item.id)}
          onSave={saveRepertoireItem}
          onDelete={deleteRepertoireItem}
          onOpen={(selectedItem) =>
            router.push(`/repertoire/${selectedItem.id}`)
          }
        />
      </li>
    );
  }

  if (!hasHydrated) {
    return <RepertoireSkeleton />;
  }

  return (
    <PageShell>
      <PageHeader
        title={text.title}
        description={text.description}
        actions={
          <button
            type='button'
            onClick={() => setIsCreatingItem(true)}
            className='inline-flex h-12 items-center justify-center gap-2 rounded-md bg-ink px-5 text-sm font-medium text-canvas transition hover:opacity-90 active:scale-[0.98]'
          >
            <PlusIcon className='size-4' />
            {text.newItem}
          </button>
        }
      />

      <section
        aria-label={text.summary}
        className='mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4'
      >
        {[
          { label: text.songs, value: overview.songCount },
          {
            label: text.learnedParts,
            value: `${overview.learnedCount}/${overview.partCount}`,
          },
          {
            label: text.practicedTime,
            value: formatPracticeDuration(overview.totalSeconds / 60),
          },
        ].map((metric) => (
          <MetricCard
            key={metric.label}
            as='article'
            tone='light'
            label={metric.label}
            value={String(metric.value)}
          />
        ))}
      </section>

      {forgotten || artistPractice.length > 0 ? (
        <div
          className={`mb-5 grid gap-5 ${forgotten && artistPractice.length > 0 ? 'xl:grid-cols-2' : ''}`}
        >
          {forgotten ? (
            <ForgottenRepertoireWidget forgotten={forgotten} />
          ) : null}
          <ArtistRanking artists={artistPractice} />
        </div>
      ) : null}

      <section className='mt-8'>
        <div>
          <div>
            <p className='text-xs uppercase tracking-[0.12em] text-muted'>
              {text.tracking}
            </p>
            <h2 className='mt-2 font-sans text-lg leading-7 font-semibold tracking-tight sm:text-xl sm:leading-8'>
              {text.savedItems}
            </h2>
          </div>
        </div>

        <div className='mt-5 rounded-xl border border-line bg-surface p-4 sm:p-5'>
          <SearchField
            label={text.search}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={text.searchPlaceholder}
          />

          <div className='mt-3 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-start'>
            <div className='min-w-0 text-xs text-muted sm:w-56'>
              <span className='block text-[10px] uppercase tracking-[0.12em]'>
                {text.progress}
              </span>
              <SelectField
                className='mt-1'
                value={progressFilter}
                ariaLabel={text.progress}
                onChange={(value) => {
                  if (isRepertoireProgressFilter(value)) {
                    setProgressFilter(value);
                  }
                }}
                options={progressFilters}
              />
            </div>
            <div className='min-w-0 text-xs text-muted sm:w-48'>
              <span className='block text-[10px] uppercase tracking-[0.12em]'>
                {text.sort}
              </span>
              <SelectField
                className='mt-1'
                value={sortOrder}
                ariaLabel={text.sort}
                onChange={(value) => {
                  if (isRepertoireSortOrder(value)) setSortOrder(value);
                }}
                options={sortOptions}
              />
            </div>
            <div className='min-w-0 text-xs text-muted sm:w-48'>
              <span className='block text-[10px] uppercase tracking-[0.12em]'>
                {text.groupBy}
              </span>
              <SelectField
                className='mt-1'
                value={groupBy}
                ariaLabel={text.groupBy}
                onChange={(value) => {
                  if (isRepertoireGroupBy(value)) setGroupBy(value);
                }}
                options={groupOptions}
              />
            </div>
            <div className='min-w-0 text-xs text-muted sm:w-40'>
              <span className='block text-[10px] uppercase tracking-[0.12em]'>
                {text.guitar}
              </span>
              <SelectField
                className='mt-1'
                value={guitarTypeFilter}
                ariaLabel={text.guitar}
                onChange={(value) =>
                  setGuitarTypeFilter(value as GuitarTypeFilter)
                }
                options={guitarFilters}
              />
            </div>
            <div className='min-w-0 text-xs text-muted sm:w-56'>
              <span className='block text-[10px] uppercase tracking-[0.12em]'>
                {text.list}
              </span>
              <SelectField
                className='mt-1'
                value={futureLearnFilter}
                ariaLabel={text.list}
                onChange={(value) =>
                  setFutureLearnFilter(value as FutureLearnFilter)
                }
                options={futureFilters}
              />
            </div>
          </div>

          <div className='mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3'>
            <p
              className='text-xs text-muted'
              role='status'
              aria-live='polite'
            >
              {visibleItems.length} de {items.length}{' '}
              {items.length === 1 ? text.item : text.items}
            </p>
            {items.length > 0 && hasActiveFilters && (
              <button
                type='button'
                onClick={clearFilters}
                className='text-xs text-muted underline decoration-line underline-offset-4 transition hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/60'
              >
                {text.clear}
              </button>
            )}
          </div>
        </div>

        {!hasHydrated ?
          <p className='mt-5 text-sm text-muted'>{text.loading}</p>
        : visibleItems.length > 0 ?
          groupBy === 'none' ?
            <ul className='mt-5 space-y-4'>
              {visibleItems.map(renderListItem)}
            </ul>
          : <div className='mt-6 space-y-8'>
              {groups.map((group) => (
                <section
                  key={group.key}
                  aria-label={group.label}
                  className='min-w-0'
                >
                  <header className='flex items-baseline justify-between gap-3 border-b border-line pb-2'>
                    <h3 className='font-sans text-lg leading-7 font-semibold tracking-tight'>
                      {group.label}
                    </h3>
                    <span className='text-xs text-muted'>
                      {group.items.length}{' '}
                      {group.items.length === 1 ?
                        text.groupSong
                      : text.groupSongs}
                    </span>
                  </header>
                  <ul className='mt-4 space-y-4'>
                    {group.items.map(renderListItem)}
                  </ul>
                </section>
              ))}
            </div>
        : <div className='mt-5 rounded-xl border border-dashed border-line bg-surface px-6 py-12 text-center'>
            <p className='font-sans text-2xl font-semibold'>
              {items.length === 0 ?
                text.emptyTitle
              : searchQuery.trim() ?
                `${text.noResults} «${searchQuery.trim()}».`
              : text.noFilters}
            </p>
            <p className='mx-auto mt-2 max-w-lg text-sm text-muted'>
              {items.length === 0 ? text.emptyDescription : text.adjustFilters}
            </p>
            {items.length > 0 && hasActiveFilters && (
              <button
                type='button'
                onClick={clearFilters}
                className='mt-4 text-sm text-ink underline decoration-line underline-offset-4 transition hover:text-accent-green-fg focus-visible:outline-accent-green-fg'
              >
                {text.clear}
              </button>
            )}
          </div>
        }
      </section>

      {persistenceError && (
        <p
          className='mt-6 text-sm text-red-300'
          role='alert'
        >
          {text.resourceError ?? text.adjustFilters}: {persistenceError}
        </p>
      )}
      {isCreatingItem && (
        <RepertoireItemDialog
          onClose={() => setIsCreatingItem(false)}
          onCreated={(itemId) => {
            setIsCreatingItem(false);
            router.push(`/repertoire/${itemId}`);
          }}
        />
      )}
    </PageShell>
  );
}
