'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PracticeMaterials } from '@/components/practice/PracticeMaterials';
import { RepertoirePartEditor } from '@/components/repertoire/RepertoirePartEditor';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Field';
import { SelectField } from '@/components/ui/SelectField';
import { formatPracticeDuration } from '@/lib/dashboard-data';
import type { RepertoirePartPracticeStats } from '@/lib/repertoire-analytics';
import {
  createRepertoirePart,
  parseRepertoireBpm,
  updateRepertoirePart,
} from '@/lib/repertoire-item-editing';
import type {
  PracticePhase,
  RepertoireItem,
  GuitarType,
} from '@/types/practice';
import { useI18nSection } from '@/i18n/I18nProvider';
import { createId as createIdentifier } from '@/lib/create-id';
import { useActivePracticeSessionStore } from '@/stores/useActivePracticeSessionStore';

const COMMON_TUNINGS = [
  'E Standard (EADGBE)',
  'Drop D (DADGBE)',
  'Drop C (CGCFAD)',
  'D Standard (DGCFAD)',
  'C Standard (CFA#D#GC)',
  'Open G (DGDGBD)',
  'Open D (DADF#AD)',
  'Open E (EBEG#BE)',
  'DADGAD',
  'Half Step Down (Eb Ab Db Gb Bb eb)',
  'Full Step Down (D G C F A D)',
  'Otra...',
] as const;

function createId() {
  return createIdentifier();
}

function ChevronIcon({ open = false }: { open?: boolean }) {
  return (
    <svg
      viewBox='0 0 20 20'
      fill='currentColor'
      aria-hidden='true'
      className={`size-4 shrink-0 transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
    >
      <path d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z' />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      aria-hidden='true'
      className='size-4'
    >
      <path
        d='M5 7h14m-9 4v6m4-6v6M9 7V5.5h6V7m-8 0 .8 12h8.4L17 7'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
      />
    </svg>
  );
}

export function RepertoireItemCard({
  item,
  practiceStats,
  onSave,
  onDelete,
  detail = false,
  onOpen,
}: {
  item: RepertoireItem;
  practiceStats: Map<string, RepertoirePartPracticeStats> | undefined;
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
  const [title, setTitle] = useState(item.title);
  const [artist, setArtist] = useState(item.artist ?? '');

  // Extra config state
  const [tuning, setTuning] = useState(item.tuning ?? '');
  const [customTuning, setCustomTuning] = useState('');
  const [capo, setCapo] = useState(item.capo?.toString() ?? '');
  const [guitarType, setGuitarType] = useState<GuitarType | ''>(
    item.guitarType ?? '',
  );
  const [youtubeUrl, setYoutubeUrl] = useState(item.youtubeUrl ?? '');
  const [spotifyUrl, setSpotifyUrl] = useState(item.spotifyUrl ?? '');
  const [isFutureLearn, setIsFutureLearn] = useState(
    item.isFutureLearn ?? false,
  );
  const [showExtraConfig, setShowExtraConfig] = useState(false);
  const [showMaterials, setShowMaterials] = useState(false);
  const [isQuickPracticeDialogOpen, setIsQuickPracticeDialogOpen] = useState(false);

  useEffect(() => {
    setTitle(item.title);
    setArtist(item.artist ?? '');
    setTuning(item.tuning ?? '');
    setCapo(item.capo?.toString() ?? '');
    setGuitarType(item.guitarType ?? '');
    setYoutubeUrl(item.youtubeUrl ?? '');
    setSpotifyUrl(item.spotifyUrl ?? '');
    setIsFutureLearn(item.isFutureLearn ?? false);
  }, [item]);

  function saveDetails() {
    const cleanTitle = title.trim();
    const cleanArtist = artist.trim();
    if (!cleanTitle) {
      setTitle(item.title);
      return;
    }
    if (cleanTitle === item.title && cleanArtist === (item.artist ?? ''))
      return;

    onSave({
      ...item,
      title: cleanTitle,
      artist: cleanArtist || undefined,
      updatedAt: new Date().toISOString(),
    });
  }

  function saveExtraConfig() {
    const finalTuning =
      tuning === 'Otra...' ? customTuning.trim() : tuning.trim();
    const capoNum = capo.trim() ? Number(capo) : undefined;

    if (
      capoNum !== undefined &&
      (isNaN(capoNum) || capoNum < 0 || capoNum > 12)
    ) {
      return;
    }

    const updates: Partial<RepertoireItem> = {
      updatedAt: new Date().toISOString(),
    };

    if (finalTuning !== (item.tuning ?? ''))
      updates.tuning = finalTuning || undefined;
    if (capoNum !== item.capo) updates.capo = capoNum;
    if (guitarType !== (item.guitarType ?? ''))
      updates.guitarType = guitarType || undefined;
    if (youtubeUrl.trim() !== (item.youtubeUrl ?? ''))
      updates.youtubeUrl = youtubeUrl.trim() || undefined;
    if (spotifyUrl.trim() !== (item.spotifyUrl ?? ''))
      updates.spotifyUrl = spotifyUrl.trim() || undefined;
    if (isFutureLearn !== (item.isFutureLearn ?? false))
      updates.isFutureLearn = isFutureLearn || undefined;

    if (Object.keys(updates).length > 1) {
      onSave({ ...item, ...updates });
    }
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
  const totalSeconds = item.parts.reduce(
    (total, part) =>
      total + (practiceStats?.get(part.id)?.practiceSeconds ?? 0),
    0,
  );
  const learnedParts = item.parts.filter((part) => part.learned).length;

  return (
    <article className='enter rounded-xl border border-line bg-surface'>
      <div
        className={`grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-4 text-left sm:p-5 ${onOpen ? 'cursor-pointer transition focus-visible:outline-inset focus-visible:outline-ink/60' : ''}`}
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
        <span className='flex min-w-0 items-center gap-4'>
          <span className='min-w-0'>
            {detail ?
              <span
                contentEditable
                suppressContentEditableWarning
                role='textbox'
                aria-label={text.title}
                spellCheck={false}
                onClick={(event) => event.stopPropagation()}
                onInput={(event) =>
                  setTitle(event.currentTarget.textContent ?? '')
                }
                onBlur={saveDetails}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    event.currentTarget.blur();
                  }
                }}
                className='block max-w-full truncate font-sans text-xl font-semibold text-ink outline-none focus-visible:underline focus-visible:decoration-accent-green-fg focus-visible:decoration-2 focus-visible:underline-offset-4 sm:text-2xl'
              >
                {title}
              </span>
            : <span className='block max-w-full truncate font-sans text-xl font-semibold text-ink sm:text-2xl'>
                {item.title}
              </span>
            }
            <span className='mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted'>
              <span className='uppercase tracking-[0.08em]'>
                {item.kind === 'song' ? text.songs : text.licks}
              </span>
              {item.kind === 'song' && (
                <>
                  <span aria-hidden='true'>·</span>
                  {detail ?
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      role='textbox'
                      aria-label={text.artist}
                      aria-placeholder={text.artistSort}
                      spellCheck={false}
                      onClick={(event) => event.stopPropagation()}
                      onInput={(event) =>
                        setArtist(event.currentTarget.textContent ?? '')
                      }
                      onBlur={saveDetails}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          event.currentTarget.blur();
                        }
                      }}
                      className={`max-w-40 truncate outline-none focus-visible:underline focus-visible:decoration-accent-green-fg focus-visible:decoration-2 focus-visible:underline-offset-4 ${artist ? 'text-muted' : 'text-muted/60'}`}
                    >
                      {artist}
                    </span>
                  : <span className='max-w-40 truncate'>{item.artist}</span>}
                </>
              )}
              <span aria-hidden='true'>·</span>
              <span>
                {item.parts.length} {text.parts}
              </span>
            </span>
            {detail && (
              <label className='mt-3 flex w-fit cursor-pointer items-center gap-2 text-xs text-muted'>
                <input
                  type='checkbox'
                  checked={isFutureLearn}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    setIsFutureLearn(checked);
                    onSave({
                      ...item,
                      isFutureLearn: checked || undefined,
                      updatedAt: new Date().toISOString(),
                    });
                  }}
                  className='peer sr-only'
                />
                <span
                  aria-hidden='true'
                  className='flex size-4 items-center justify-center border border-muted text-transparent transition peer-checked:border-accent-green-fg peer-checked:bg-accent-green-fg peer-checked:text-canvas peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-green-fg'
                >
                  <svg
                    viewBox='0 0 12 12'
                    className='size-3'
                    fill='none'
                  >
                    <path
                      d='m2 6 2.5 2.5L10 3'
                      stroke='currentColor'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </span>
                <span>{text.futureLearn}</span>
              </label>
            )}
          </span>
        </span>
        <span className='flex items-center gap-3 sm:gap-6'>
          <span className='text-right font-mono text-xs text-muted'>
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
                      saveExtraConfig();
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
                      onBlur={saveExtraConfig}
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
                    onBlur={saveExtraConfig}
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
                      saveExtraConfig();
                    }}
                    options={[
                      { value: '', label: text.unspecified },
                      { value: 'electric', label: text.electric },
                      { value: 'acoustic', label: text.acoustic },
                    ]}
                  />
                </label>
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
      {isQuickPracticeDialogOpen && (
        <dialog
          open
          aria-labelledby={`quick-practice-title-${item.id}`}
          className='fixed inset-0 z-50 m-auto w-[calc(100%-2rem)] max-w-md border border-line bg-surface p-0 text-ink shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop:bg-black/70'
        >
          <div className='p-6 sm:p-8'>
            <h2
              id={`quick-practice-title-${item.id}`}
              className='font-sans text-2xl font-semibold'
            >
              {practiceText.newPracticeTitle}
            </h2>
            <p className='mt-3 text-sm leading-6 text-muted'>
              {practiceText.newPracticeDescription}
            </p>
            <div className='mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end'>
              <Button onClick={() => setIsQuickPracticeDialogOpen(false)}>
                {practiceText.cancelNewPractice}
              </Button>
              <Button
                variant='primary'
                onClick={() => {
                  setIsQuickPracticeDialogOpen(false);
                  clearActiveSession();
                  router.push(
                    `/practice?quickRepertoire=${encodeURIComponent(item.id)}`,
                  );
                }}
              >
                {practiceText.confirmNewPractice}
              </Button>
            </div>
          </div>
        </dialog>
      )}
    </article>
  );
}
