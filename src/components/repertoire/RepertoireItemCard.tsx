'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PracticeMaterials } from '@/components/practice/PracticeMaterials';
import { CatalogSearchDialog } from '@/components/repertoire/CatalogSearchDialog';
import { CoverArt } from '@/components/repertoire/CoverArt';
import { RepertoirePartEditor } from '@/components/repertoire/RepertoirePartEditor';
import { Button } from '@/components/ui/Button';
import { CheckboxField } from '@/components/ui/CheckboxField';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { TextField } from '@/components/ui/Field';
import { ChevronIcon, DeleteIcon } from '@/components/ui/icons';
import { SelectField } from '@/components/ui/SelectField';
import { formatPracticeDuration } from '@/utils/dashboard-data';
import type {
  RepertoireItemPracticeStats,
  RepertoirePartPracticeStats,
} from '@/utils/repertoire-analytics';
import { REPERTOIRE_DIFFICULTIES } from '@/utils/repertoire-item';
import { buildCatalogQuery } from '@/utils/repertoire-catalog';
import { getDifficultyLabel } from '@/utils/difficulty-labels';
import {
  buildRepertoireDetailsUpdate,
  buildRepertoireExtraConfigUpdates,
  createRepertoirePart,
  hasRepertoireExtraConfigChanges,
  updateRepertoirePart,
} from '@/utils/repertoire-item-editing';
import type {
  PracticePhase,
  RepertoireItem,
  GuitarType,
  RepertoireDifficulty,
} from '@/types/practice';
import type { CatalogCandidate } from '@/types/catalog';
import { buildCatalogFillUpdates } from '@/utils/repertoire-catalog';
import { useI18nSection } from '@/i18n/I18nProvider';
import { createId as createIdentifier } from '@/utils/create-id';
import { COMMON_TUNINGS } from '@/utils/repertoire-item';
import { useActivePracticeSessionStore } from '@/stores/useActivePracticeSessionStore';

function createId() {
  return createIdentifier();
}

export function RepertoireItemCard({
  item,
  practiceStats,
  itemPractice,
  onSave,
  onDelete,
  detail = false,
  onOpen,
}: {
  item: RepertoireItem;
  practiceStats: Map<string, RepertoirePartPracticeStats> | undefined;
  itemPractice?: RepertoireItemPracticeStats;
  onSave: (item: RepertoireItem) => void;
  onDelete: (itemId: string) => void;
  detail?: boolean;
  onOpen?: (item: RepertoireItem) => void;
}) {
  const router = useRouter();
  const text = useI18nSection('repertoire');
  const practiceText = useI18nSection('practice');
  const activeSession = useActivePracticeSessionStore(
    (state) => state.activeSession,
  );
  const clearActiveSession = useActivePracticeSessionStore(
    (state) => state.clearActiveSession,
  );
  const [isExpanded, setIsExpanded] = useState(detail);
  const [artist, setArtist] = useState(item.artist ?? '');
  /**
   * El título es un `contentEditable`: si sus hijos se ataran al estado, cada
   * pulsación reescribiría el nodo de texto y el cursor volvería al inicio.
   * Los borradores viven en refs y el DOM se sincroniza solo cuando cambia
   * `item` (al guardar o al llegar datos nuevos).
   */
  const titleRef = useRef<HTMLSpanElement>(null);
  const titleDraftRef = useRef(item.title);
  const artistDraftRef = useRef(item.artist ?? '');

  // Extra config state
  const [tuning, setTuning] = useState(item.tuning ?? '');
  const [customTuning, setCustomTuning] = useState('');
  const [capo, setCapo] = useState(item.capo?.toString() ?? '');
  const [guitarType, setGuitarType] = useState<GuitarType | ''>(
    item.guitarType ?? '',
  );
  const [difficulty, setDifficulty] = useState<RepertoireDifficulty | ''>(
    item.difficulty ?? '',
  );
  const [youtubeUrl, setYoutubeUrl] = useState(item.youtubeUrl ?? '');
  const [spotifyUrl, setSpotifyUrl] = useState(item.spotifyUrl ?? '');
  const [album, setAlbum] = useState(item.album ?? '');
  const [releaseYear, setReleaseYear] = useState(
    item.releaseYear?.toString() ?? '',
  );
  const [coverUrl, setCoverUrl] = useState(item.coverUrl ?? '');
  const [isCatalogSearchOpen, setIsCatalogSearchOpen] = useState(false);
  const [isFutureLearn, setIsFutureLearn] = useState(
    item.isFutureLearn ?? false,
  );
  const [showExtraConfig, setShowExtraConfig] = useState(false);
  const [showMaterials, setShowMaterials] = useState(false);
  const [isQuickPracticeDialogOpen, setIsQuickPracticeDialogOpen] = useState(false);

  useEffect(() => {
    titleDraftRef.current = item.title;
    artistDraftRef.current = item.artist ?? '';
    setArtist(item.artist ?? '');
    setTuning(item.tuning ?? '');
    setCapo(item.capo?.toString() ?? '');
    setGuitarType(item.guitarType ?? '');
    setDifficulty(item.difficulty ?? '');
    setYoutubeUrl(item.youtubeUrl ?? '');
    setSpotifyUrl(item.spotifyUrl ?? '');
    setAlbum(item.album ?? '');
    setReleaseYear(item.releaseYear?.toString() ?? '');
    setCoverUrl(item.coverUrl ?? '');
    setIsFutureLearn(item.isFutureLearn ?? false);
  }, [item]);

  function saveDetails() {
    const result = buildRepertoireDetailsUpdate(
      { title: titleDraftRef.current, artist: artistDraftRef.current },
      item,
      new Date().toISOString(),
    );

    if (result.kind === 'empty-title') {
      titleDraftRef.current = item.title;
      if (titleRef.current) titleRef.current.textContent = item.title;
      return;
    }
    if (result.kind === 'save') onSave({ ...item, ...result.updates });
  }

  /**
   * Guarda la configuración extra. Los valores que llegan por `overrides` son
   * los que el usuario acaba de elegir: leerlos del estado daría el valor
   * anterior, porque React no ha vuelto a renderizar todavía.
   */
  function saveExtraConfig(
    overrides: Partial<{
      tuning: string;
      customTuning: string;
      capo: string;
      guitarType: GuitarType | '';
      difficulty: RepertoireDifficulty | '';
    }> = {},
  ) {
    const updates = buildRepertoireExtraConfigUpdates(
      {
        tuning: overrides.tuning ?? tuning,
        customTuning: overrides.customTuning ?? customTuning,
        capo: overrides.capo ?? capo,
        guitarType: overrides.guitarType ?? guitarType,
        difficulty: overrides.difficulty ?? difficulty,
        youtubeUrl,
        spotifyUrl,
        album,
        releaseYear,
        coverUrl,
        isFutureLearn,
      },
      item,
      new Date().toISOString(),
    );

    if (!updates || !hasRepertoireExtraConfigChanges(updates)) return;
    onSave({ ...item, ...updates });
  }

  function applyCatalogCandidate(candidate: CatalogCandidate) {
    const updates = buildCatalogFillUpdates(
      item,
      candidate,
      new Date().toISOString(),
    );

    if (updates) onSave({ ...item, ...updates });
    setIsCatalogSearchOpen(false);
  }

  function addPart() {
    const newPart = createRepertoirePart(createId(), item.parts.length + 1);
    onSave({
      ...item,
      parts: [...item.parts, newPart],
      updatedAt: new Date().toISOString(),
    });
  }

  function addStudyMaterial(
    resource: NonNullable<RepertoireItem['resources']>[number],
  ) {
    onSave({
      ...item,
      resources: [...(item.resources ?? []), resource],
      updatedAt: new Date().toISOString(),
    });
  }

  const materialPhase: PracticePhase[] =
    item.guitarPro ?
      [
        {
          id: item.id,
          name: item.title,
          durationMinutes: 1,
          skill: 'repertoire',
          resources: [item.guitarPro],
        },
      ]
    : [];
  // El tiempo del elemento suma toda fase vinculada a él, con parte o sin ella.
  const totalSeconds = itemPractice?.practiceSeconds ?? 0;
  const learnedParts = item.parts.filter((part) => part.learned).length;
  const hasArtist = item.kind === 'song' && (detail || Boolean(item.artist));
  const artistNode =
    detail ?
      <span
        contentEditable
        suppressContentEditableWarning
        role='textbox'
        aria-label={text.artist}
        aria-placeholder={text.artistSort}
        spellCheck={false}
        onClick={(event) => event.stopPropagation()}
        onInput={(event) => {
          artistDraftRef.current = event.currentTarget.textContent ?? '';
          setArtist(artistDraftRef.current);
        }}
        onBlur={saveDetails}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            event.currentTarget.blur();
          }
        }}
        className={`max-w-40 truncate text-base outline-none focus-visible:underline focus-visible:decoration-accent-green-fg focus-visible:decoration-2 focus-visible:underline-offset-4 sm:text-xs ${artist ? 'text-muted' : 'text-muted/60'}`}
      >
        {item.artist ?? ''}
      </span>
    : <span className='max-w-40 truncate'>{item.artist}</span>;

  return (
    <article className='enter rounded-xl border border-line bg-surface'>
      <div
        className={`grid w-full grid-cols-1 items-start gap-4 p-4 text-left sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-5 ${onOpen ? 'cursor-pointer transition focus-visible:outline-inset focus-visible:outline-ink/60' : ''}`}
        onClick={onOpen ? () => onOpen(item) : undefined}
        onKeyDown={
          onOpen ?
            (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onOpen(item);
              }
            }
          : undefined
        }
        role={onOpen ? 'link' : undefined}
        tabIndex={onOpen ? 0 : undefined}
      >
        <span className='flex min-w-0 w-full items-center gap-4'>
          <CoverArt
            coverUrl={item.coverUrl}
            size={detail ? 'lg' : 'sm'}
            alt={item.album ?? ''}
          />
          <span className='min-w-0 w-full'>
            {detail ?
              <span
                ref={titleRef}
                contentEditable
                suppressContentEditableWarning
                role='textbox'
                aria-label={text.title}
                spellCheck={false}
                onClick={(event) => event.stopPropagation()}
                onInput={(event) => {
                  titleDraftRef.current =
                    event.currentTarget.textContent ?? '';
                }}
                onBlur={saveDetails}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    event.currentTarget.blur();
                  }
                }}
                className='block w-full whitespace-normal break-words font-sans text-xl font-semibold leading-tight text-ink [overflow-wrap:anywhere] outline-none focus-visible:underline focus-visible:decoration-accent-green-fg focus-visible:decoration-2 focus-visible:underline-offset-4 sm:text-2xl'
              >
                {item.title}
              </span>
            : <span className='block w-full whitespace-normal break-words font-sans text-xl font-semibold leading-tight text-ink [overflow-wrap:anywhere] sm:text-2xl'>
                {item.title}
              </span>
            }
            <span className='mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted'>
              {hasArtist && (
                <>
                  {artistNode}
                  <span aria-hidden='true'>·</span>
                </>
              )}
              {item.difficulty && (
                <>
                  <span>{getDifficultyLabel(text, item.difficulty)}</span>
                  <span aria-hidden='true'>·</span>
                </>
              )}
              <span>
                {item.parts.length} {text.parts}
              </span>
            </span>
            {detail && (
              <CheckboxField
                className='mt-3 w-fit text-xs text-muted'
                checked={isFutureLearn}
                label={text.futureLearn}
                onChange={(event) => {
                  const checked = event.target.checked;
                  setIsFutureLearn(checked);
                  onSave({
                    ...item,
                    isFutureLearn: checked || undefined,
                    updatedAt: new Date().toISOString(),
                  });
                }}
              />
            )}
          </span>
        </span>
        <span className='flex w-full items-center justify-end gap-3 sm:w-auto sm:gap-6'>
          <span className='ml-auto text-right font-mono text-xs text-muted'>
            {formatPracticeDuration(totalSeconds / 60)}
            <span className='mt-1 block'>
              {learnedParts}/{item.parts.length} {text.learnedParts}
            </span>
          </span>
          {detail && (
            <button
              type='button'
              onClick={(event) => {
                event.stopPropagation();
                if (activeSession) {
                  setIsQuickPracticeDialogOpen(true);
                  return;
                }
                router.push(`/practice?quickRepertoire=${encodeURIComponent(item.id)}`);
              }}
              className='inline-flex h-9 items-center border border-line px-3 text-xs text-muted transition hover:bg-white/5 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/60'
            >
              {text.quickPractice}
            </button>
          )}
          <button
            type='button'
            aria-label={text.deleteItem}
            onClick={(event) => {
              event.stopPropagation();
              if (window.confirm(text.deleteConfirm)) onDelete(item.id);
            }}
            className='flex size-9 shrink-0 items-center justify-center border border-line text-muted transition hover:border-red-300/50 hover:text-red-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/60'
          >
            <DeleteIcon />
          </button>
          {!detail && (
            <span
              aria-hidden='true'
              className='flex size-9 shrink-0 items-center justify-center border border-line text-muted'
            >
              <ChevronIcon open={isExpanded} />
            </span>
          )}
        </span>
      </div>

      {isExpanded && (
        <div
          id={`repertoire-details-${item.id}`}
          className='border-t border-line bg-canvas/40 p-4 sm:p-6'
        >
          <div className='flex flex-wrap items-center justify-between gap-3  border-line pt-4'>
            <p className='text-xs uppercase text-muted'>
              {text.parts} · {item.parts.length}
            </p>
            <Button
              type='button'
              onClick={addPart}
              className='h-11 min-w-11 px-4'
            >
              {text.addPart}
            </Button>
          </div>

          <ul className='mt-3 space-y-3'>
            {item.parts.map((part) => (
              <RepertoirePartEditor
                key={part.id}
                item={item}
                part={part}
                stats={practiceStats?.get(part.id)}
                onSave={onSave}
              />
            ))}
          </ul>

          {/* Configuraciones extra */}
          <details
            className='mt-4 rounded-lg border border-line'
            open={showExtraConfig}
            onToggle={(event) => setShowExtraConfig(event.currentTarget.open)}
          >
            <summary className='cursor-pointer flex items-center gap-2 px-4 py-3 text-sm text-muted transition hover:text-ink'>
              <ChevronIcon open={showExtraConfig} />
              {text.extraConfig}
            </summary>
            <div className='border-t border-line p-4 space-y-4 animate-in slide-in-from-top-2 duration-200'>
              <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                <label className='block text-xs text-muted sm:col-span-2'>
                  {text.tuning}
                  <SelectField
                    className='mt-1'
                    value={tuning}
                    onChange={(value) => {
                      setTuning(value);
                      if (value !== 'Otra...') setCustomTuning('');
                      saveExtraConfig({
                        tuning: value,
                        ...(value === 'Otra...' ?
                          {}
                        : { customTuning: '' }),
                      });
                    }}
                    ariaLabel={text.tuning}
                    options={COMMON_TUNINGS.map((t) => ({
                      value: t,
                      label: t,
                    }))}
                  />
                </label>
                {tuning === 'Otra...' && (
                  <label className='block text-xs text-muted sm:col-span-2'>
                    {text.customTuning}
                    <TextField
                      value={customTuning}
                      onChange={(event) => setCustomTuning(event.target.value)}
                      onBlur={() => saveExtraConfig()}
                      maxLength={50}
                      placeholder={text.customTuningPlaceholder}
                      className='mt-1'
                    />
                  </label>
                )}

                <label className='block text-xs text-muted'>
                  {text.capo}
                  <TextField
                    type='number'
                    min={0}
                    max={12}
                    step={1}
                    value={capo}
                    onChange={(event) => setCapo(event.target.value)}
                    onBlur={() => saveExtraConfig()}
                    placeholder='0'
                    aria-label={text.capoAria}
                    className='mt-1 font-mono'
                  />
                </label>

                <label className='block text-xs text-muted'>
                  {text.guitarType}
                  <SelectField
                    className='mt-1'
                    value={guitarType}
                    ariaLabel={text.guitarType}
                    onChange={(value) => {
                      setGuitarType(value as GuitarType | '');
                      saveExtraConfig({ guitarType: value as GuitarType | '' });
                    }}
                    options={[
                      { value: '', label: text.unspecified },
                      { value: 'electric', label: text.electric },
                      { value: 'acoustic', label: text.acoustic },
                    ]}
                  />
                </label>
                <label className='block text-xs text-muted'>
                  {text.difficulty}
                  <SelectField
                    className='mt-1'
                    value={difficulty}
                    ariaLabel={text.difficulty}
                    onChange={(value) => {
                      const next = value as RepertoireDifficulty | '';
                      setDifficulty(next);
                      saveExtraConfig({ difficulty: next });
                    }}
                    options={[
                      { value: '', label: text.difficultyNone },
                      ...REPERTOIRE_DIFFICULTIES.map((value) => ({
                        value,
                        label: getDifficultyLabel(text, value),
                      })),
                    ]}
                  />
                </label>

                <label className='block text-xs text-muted sm:col-span-2'>
                  {text.catalogAlbum}
                  <TextField
                    value={album}
                    onChange={(event) => setAlbum(event.target.value)}
                    onBlur={() => saveExtraConfig()}
                    maxLength={120}
                    className='mt-1'
                  />
                </label>

                <label className='block text-xs text-muted'>
                  {text.catalogYear}
                  <TextField
                    type='number'
                    min={1900}
                    max={2100}
                    step={1}
                    value={releaseYear}
                    onChange={(event) => setReleaseYear(event.target.value)}
                    onBlur={() => saveExtraConfig()}
                    placeholder='1986'
                    className='mt-1'
                  />
                </label>

                <label className='block text-xs text-muted sm:col-span-2'>
                  {text.catalogCover}
                  <TextField
                    value={coverUrl}
                    onChange={(event) => setCoverUrl(event.target.value)}
                    onBlur={() => saveExtraConfig()}
                    maxLength={500}
                    placeholder={text.catalogCoverPlaceholder}
                    className='mt-1'
                  />
                </label>
              </div>

              <div className='mt-4'>
                <Button
                  type='button'
                  size='field'
                  variant='ghost'
                  onClick={() => setIsCatalogSearchOpen(true)}
                >
                  {text.catalogBackfill}
                </Button>
              </div>
            </div>
          </details>

          {detail && (
            <details
              className='mt-4 rounded-lg border border-line'
              open={showMaterials}
              onToggle={(event) => setShowMaterials(event.currentTarget.open)}
            >
              <summary className='flex cursor-pointer items-center gap-2 border-b border-line px-4 py-3 text-sm text-muted transition hover:text-ink'>
                <ChevronIcon open={showMaterials} />
                Ver material de estudio
              </summary>
              <PracticeMaterials
                phases={item.guitarPro ? materialPhase : []}
                attachedResources={item.resources}
                onAttach={addStudyMaterial}
                embedded
              />
            </details>
          )}
        </div>
      )}
      {isCatalogSearchOpen && (
        <CatalogSearchDialog
          initialQuery={buildCatalogQuery(item.title, item.artist)}
          onSelect={applyCatalogCandidate}
          onClose={() => setIsCatalogSearchOpen(false)}
        />
      )}
      {isQuickPracticeDialogOpen && (
        <ConfirmDialog
          labelledBy={`quick-practice-title-${item.id}`}
          className='z-50'
          title={practiceText.newPracticeTitle}
          description={practiceText.newPracticeDescription}
          cancelLabel={practiceText.cancelNewPractice}
          confirmLabel={practiceText.confirmNewPractice}
          onCancel={() => setIsQuickPracticeDialogOpen(false)}
          onConfirm={() => {
            setIsQuickPracticeDialogOpen(false);
            clearActiveSession();
            router.push(
              `/practice?quickRepertoire=${encodeURIComponent(item.id)}`,
            );
          }}
        />
      )}
    </article>
  );
}
