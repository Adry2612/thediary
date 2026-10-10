'use client';

import { useEffect, useState } from 'react';
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
  const text = useI18nSection('repertoire');
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
      // more than just updatedAt
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
    <article className='enter overflow-hidden rounded-xl border border-line bg-surface'>
      <button
        type='button'
        aria-expanded={isExpanded}
        aria-controls={`repertoire-details-${item.id}`}
        onClick={() => {
          if (onOpen) {
            onOpen(item);
            return;
          }
          if (!detail) setIsExpanded((expanded) => !expanded);
        }}
        className='grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-4 text-left transition hover:bg-white/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-ink/60 sm:p-5'
      >
        <span className='flex min-w-0 items-center gap-4'>
          <span className='hidden size-10 shrink-0 items-center justify-center border border-line font-mono text-xs text-muted sm:flex'>
            {item.kind === 'song' ? '♫' : 'L'}
          </span>
          <span className='min-w-0'>
            <span className='block truncate font-sans text-xl font-semibold text-ink sm:text-2xl'>
              {item.title}
            </span>
            <span className='mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted'>
              <span className='uppercase tracking-[0.08em]'>
                 {item.kind === 'song' ? text.songs : text.licks}
              </span>
              {item.artist && (
                <>
                  <span aria-hidden='true'>·</span>
                  <span className='truncate'>{item.artist}</span>
                </>
              )}
              <span aria-hidden='true'>·</span>
               <span>{item.parts.length} {text.parts}</span>
            </span>
          </span>
        </span>
        <span className='flex items-center gap-3 sm:gap-6'>
          <span className='text-right font-mono text-xs text-muted'>
            {formatPracticeDuration(totalSeconds / 60)}
            <span className='mt-1 block'>
               {learnedParts}/{item.parts.length} {text.learnedParts}
            </span>
          </span>
          <span
            aria-hidden='true'
            className='flex size-9 shrink-0 items-center justify-center border border-line text-lg text-muted'
          >
            {detail ?
              '·'
            : isExpanded ?
              '−'
            : '+'}
          </span>
        </span>
      </button>

      {isExpanded && (
        <div
          id={`repertoire-details-${item.id}`}
          className='border-t border-line bg-canvas/40 p-4 sm:p-6'
        >
          <div className='flex flex-wrap items-end justify-between gap-4'>
            <div className='flex min-w-0 flex-1 flex-wrap gap-3'>
              <label className='min-w-48 flex-1 text-xs text-muted'>
                 {text.title}
                <TextField
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  onBlur={saveDetails}
                  maxLength={100}
                  className='mt-1 h-11 font-sans text-xl font-semibold'
                />
              </label>
              {item.kind === 'song' && (
                <label className='min-w-40 flex-1 text-xs text-muted sm:max-w-64'>
                   {text.artist}
                  <TextField
                    value={artist}
                    onChange={(event) => setArtist(event.target.value)}
                    onBlur={saveDetails}
                    maxLength={100}
                   placeholder={text.artistSort}
                    className='mt-1 h-11 text-sm'
                  />
                </label>
              )}
            </div>
            <button
              type='button'
              onClick={() => {
                const confirmed = window.confirm(
                   text.deleteConfirm,
                );
                if (confirmed) onDelete(item.id);
              }}
              className='h-11 px-2 text-xs text-muted underline decoration-line underline-offset-4 transition hover:text-ink focus-visible:outline-ink/60'
            >
               {text.deleteItem}
            </button>
          </div>

          <div className='mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4'>
            <p className='text-xs uppercase tracking-[0.1em] text-muted'>
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
          >
            <summary
              className='cursor-pointer flex items-center gap-2 px-4 py-3 text-sm text-muted transition hover:text-ink'
              onClick={() => setShowExtraConfig(!showExtraConfig)}
            >
              <svg
                className='size-4 shrink-0 transition-transform duration-200'
                style={{
                  transform: showExtraConfig ? 'rotate(90deg)' : 'rotate(0)',
                }}
                viewBox='0 0 20 20'
                fill='currentColor'
                aria-hidden='true'
              >
                <path d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z' />
              </svg>
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

                <label className='block text-xs text-muted sm:col-span-2'>
                   {text.youtubeOptional}
                  <TextField
                    type='url'
                    value={youtubeUrl}
                    onChange={(event) => setYoutubeUrl(event.target.value)}
                    onBlur={saveExtraConfig}
                     placeholder='https://www.youtube.com/watch?v=...'
                     aria-label={text.youtubeAria}
                    className='mt-1'
                  />
                </label>

                <label className='block text-xs text-muted sm:col-span-2'>
                   {text.spotifyOptional}
                  <TextField
                    type='url'
                    value={spotifyUrl}
                    onChange={(event) => setSpotifyUrl(event.target.value)}
                    onBlur={saveExtraConfig}
                    placeholder='https://open.spotify.com/track/...'
                     aria-label={text.spotifyAria}
                    className='mt-1'
                  />
                </label>

                <label className='flex items-center gap-2 cursor-pointer text-xs text-muted sm:col-span-4'>
                  <input
                    type='checkbox'
                    checked={isFutureLearn}
                    onChange={(event) => {
                      setIsFutureLearn(event.target.checked);
                      saveExtraConfig();
                    }}
                    className='peer sr-only'
                  />
                  <span
                    aria-hidden='true'
                    className='flex size-4 items-center justify-center border border-muted text-transparent transition peer-checked:border-accent-green-fg peer-checked:bg-accent-green-fg peer-checked:text-canvas peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-green-fg'
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
              </div>
            </div>
          </details>

          {(item.guitarPro || item.resources?.length) && (
            <details className='mt-4 rounded-lg border border-line'>
              <summary className='cursor-pointer px-4 py-3 text-sm text-muted transition hover:text-ink'>
                Ver material de estudio
              </summary>
              <div className='border-t border-line p-3 sm:p-4'>
                <PracticeMaterials
                  phases={item.guitarPro ? materialPhase : []}
                  attachedResources={item.resources}
                />
              </div>
            </details>
          )}
        </div>
      )}
    </article>
  );
}
