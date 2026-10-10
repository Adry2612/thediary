'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { RepertoireItemCard } from '@/components/repertoire/RepertoireItemCard';
import { RepertoireItemForm } from '@/components/repertoire/RepertoireItemForm';
import { SelectField } from '@/components/ui/SelectField';
import { TextField } from '@/components/ui/Field';
import { formatPracticeDuration } from '@/lib/dashboard-data';
import {
  getRepertoireOverview,
  getRepertoirePracticeStats,
} from '@/lib/repertoire-analytics';
import {
  getFilteredRepertoireItems,
  isRepertoireProgressFilter,
  isRepertoireSortOrder,
  type RepertoireProgressFilter,
  type RepertoireSortOrder,
} from '@/lib/repertoire-filtering';
import { usePracticeStore } from '@/stores/usePracticeStore';
import { useRouter } from 'next/navigation';
import type { RepertoireItemKind, GuitarType } from '@/types/practice';
import { useI18nSection } from '@/i18n/I18nProvider';

type RepertoireFilter = 'all' | RepertoireItemKind;
type GuitarTypeFilter = 'all' | GuitarType;
type FutureLearnFilter = 'all' | 'future' | 'current';

const FILTERS: { value: RepertoireFilter; label: string }[] = [
  { value: 'all', label: 'Todo' },
  { value: 'song', label: 'Canciones' },
  { value: 'lick', label: 'Licks' },
];

const GUITAR_TYPE_FILTERS: { value: GuitarTypeFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'electric', label: 'Eléctrica' },
  { value: 'acoustic', label: 'Acústica' },
];

const FUTURE_LEARN_FILTERS: { value: FutureLearnFilter; label: string }[] = [
  { value: 'all', label: 'Todo el repertorio' },
  { value: 'current', label: 'En aprendizaje' },
  { value: 'future', label: 'Aprender en el futuro' },
];

const PROGRESS_FILTERS: {
  value: RepertoireProgressFilter;
  label: string;
}[] = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'learning', label: 'Por aprender' },
  { value: 'learned', label: 'Aprendidos' },
];

const SORT_OPTIONS: { value: RepertoireSortOrder; label: string }[] = [
  { value: 'original', label: 'Orden original' },
  { value: 'recent', label: 'Actualizados recientemente' },
  { value: 'title', label: 'Título: A–Z' },
  { value: 'artist', label: 'Artista/banda: A–Z' },
  { value: 'practice', label: 'Más practicados' },
];

export function RepertoireView() {
  const text = useI18nSection('repertoire');
  const filters = [{ value: 'all' as const, label: text.all }, { value: 'song' as const, label: text.allSongs }, { value: 'lick' as const, label: text.allLicks }];
  const guitarFilters = [{ value: 'all' as const, label: text.allGuitars }, { value: 'electric' as const, label: text.electric }, { value: 'acoustic' as const, label: text.acoustic }];
  const futureFilters = [{ value: 'all' as const, label: text.allRepertoire }, { value: 'current' as const, label: text.current }, { value: 'future' as const, label: text.future }];
  const progressFilters = [{ value: 'all' as const, label: text.allStates }, { value: 'learning' as const, label: text.learning }, { value: 'learned' as const, label: text.learned }];
  const sortOptions = [{ value: 'original' as const, label: text.original }, { value: 'recent' as const, label: text.recent }, { value: 'title' as const, label: text.titleSort }, { value: 'artist' as const, label: text.artistSort }, { value: 'practice' as const, label: text.mostPracticed }];
  const router = useRouter();
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
  const [filter, setFilter] = useState<RepertoireFilter>('all');
  const [guitarTypeFilter, setGuitarTypeFilter] =
    useState<GuitarTypeFilter>('all');
  const [futureLearnFilter, setFutureLearnFilter] =
    useState<FutureLearnFilter>('all');
  const [progressFilter, setProgressFilter] =
    useState<RepertoireProgressFilter>('all');
  const [sortOrder, setSortOrder] = useState<RepertoireSortOrder>('original');
  const [searchQuery, setSearchQuery] = useState('');
  const practiceStats = useMemo(
    () => getRepertoirePracticeStats(history),
    [history],
  );
  const visibleItems = useMemo(
    () =>
      getFilteredRepertoireItems(
        items,
        {
          query: searchQuery,
          kind: filter,
          progress: progressFilter,
          sort: sortOrder,
          guitarType: guitarTypeFilter,
          futureLearn: futureLearnFilter,
        },
        practiceStats,
      ),
    [
      filter,
      guitarTypeFilter,
      futureLearnFilter,
      items,
      practiceStats,
      progressFilter,
      searchQuery,
      sortOrder,
    ],
  );
  const overview = useMemo(
    () => getRepertoireOverview(items, practiceStats),
    [items, practiceStats],
  );
  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    filter !== 'all' ||
    guitarTypeFilter !== 'all' ||
    futureLearnFilter !== 'all' ||
    progressFilter !== 'all';

  function clearFilters() {
    setSearchQuery('');
    setFilter('all');
    setGuitarTypeFilter('all');
    setFutureLearnFilter('all');
    setProgressFilter('all');
    setSortOrder('original');
  }

  return (
    <main className='mx-auto min-h-screen max-w-7xl px-5 py-12 sm:px-8 sm:py-16'>
      <header className='enter mb-8 flex flex-wrap items-end justify-between gap-6'>
        <div>
          <p className='font-mono text-xs uppercase tracking-[0.14em] text-muted'>
             {text.library}
          </p>
          <h1 className='mt-3 font-sans text-3xl leading-tight font-semibold tracking-tight sm:text-4xl'>
             {text.title}
          </h1>
          <p className='mt-4 max-w-2xl text-base font-medium text-muted sm:text-lg'>
             {text.description}
          </p>
        </div>
        <Link
          href='/practice'
          className='inline-flex h-12 items-center justify-center rounded-md bg-ink px-5 text-sm font-medium text-canvas transition hover:opacity-90 active:scale-[0.98]'
        >
           {text.prepare}
        </Link>
      </header>

      <section
         aria-label={text.summary}
        className='mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4'
      >
        {[
           { label: text.songs, value: overview.songCount },
           { label: text.licks, value: overview.lickCount },
          {
             label: text.learnedParts,
            value: `${overview.learnedCount}/${overview.partCount}`,
          },
          {
             label: text.practicedTime,
            value: formatPracticeDuration(overview.totalSeconds / 60),
          },
        ].map((metric) => (
          <article
            key={metric.label}
            className='rounded-lg border border-line bg-surface p-4 sm:p-5'
          >
            <p className='text-xs uppercase tracking-[0.1em] text-muted'>
              {metric.label}
            </p>
            <p className='mt-3 font-mono text-xs leading-6 tabular-nums tracking-normal sm:text-sm sm:leading-7'>
              {metric.value}
            </p>
          </article>
        ))}
      </section>

      <RepertoireItemForm />

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

        <div className='mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(16rem,1fr)_minmax(12rem,0.7fr)_minmax(14rem,0.8fr)_minmax(12rem,0.7fr)_minmax(14rem,0.8fr)]'>
          <label className='block text-xs text-muted sm:col-span-2 xl:col-span-1'>
             {text.search}
            <span className='relative mt-1 block'>
              <svg
                aria-hidden='true'
                viewBox='0 0 20 20'
                className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted'
              >
                <circle
                  cx='8.5'
                  cy='8.5'
                  r='5.5'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='1.5'
                />
                <path
                  d='m12.5 12.5 4 4'
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeWidth='1.5'
                />
              </svg>
              <TextField
                type='search'
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                 placeholder={text.searchPlaceholder}
                 aria-label={text.searchAria}
                className='pl-10'
              />
            </span>
          </label>
          <div className='text-xs text-muted'>
             <span className='block'>{text.progress}</span>
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
          <div className='text-xs text-muted'>
             <span className='block'>{text.sort}</span>
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
          <div className='text-xs text-muted'>
             <span className='block'>{text.guitar}</span>
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
          <div className='text-xs text-muted'>
             <span className='block'>{text.list}</span>
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

        <div className='mt-4 flex flex-wrap items-center justify-between gap-3'>
          <div
            className='flex max-w-full gap-1 overflow-x-auto rounded-lg border border-line p-1'
            role='group'
             aria-label={text.typeFilter}
          >
             {filters.map((option) => (
              <button
                key={option.value}
                type='button'
                aria-pressed={filter === option.value}
                onClick={() => setFilter(option.value)}
                className={`shrink-0 rounded-md px-3 py-2 text-xs transition ${filter === option.value ? 'bg-ink text-canvas' : 'text-muted hover:text-ink'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {hasHydrated && (
            <p
              className='text-xs text-muted'
              role='status'
              aria-live='polite'
            >
               {visibleItems.length} de {items.length}{' '}
               {items.length === 1 ? text.item : text.items}
            </p>
          )}
        </div>

        {!hasHydrated ?
           <p className='mt-5 text-sm text-muted'>{text.loading}</p>
        : visibleItems.length > 0 ?
          <ul className='mt-5 space-y-4'>
            {visibleItems.map((item) => (
              <li
                key={item.id}
                className='cursor-pointer'
              >
                <RepertoireItemCard
                  item={item}
                  practiceStats={practiceStats.get(item.id)}
                  onSave={saveRepertoireItem}
                  onDelete={deleteRepertoireItem}
                  onOpen={(selectedItem) =>
                    router.push(`/repertoire/${selectedItem.id}`)
                  }
                />
              </li>
            ))}
          </ul>
        : <div className='mt-5 rounded-xl border border-dashed border-line bg-surface px-6 py-12 text-center'>
            <p className='font-sans text-2xl font-semibold'>
              {items.length === 0 ?
                 text.emptyTitle
              : searchQuery.trim() ?
                 `${text.noResults} «${searchQuery.trim()}».`
               : text.noFilters}
            </p>
            <p className='mx-auto mt-2 max-w-lg text-sm text-muted'>
              {items.length === 0 ?
                 text.emptyDescription
               : text.adjustFilters
              }
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
      <p className='mt-8 text-center text-xs text-muted'>
        {overview.learnedCount} de {overview.partCount} partes marcadas como
        aprendidas ·{' '}
        {overview.totalSeconds ?
           text.timeNote
         : text.linkNote}
      </p>
    </main>
  );
}
