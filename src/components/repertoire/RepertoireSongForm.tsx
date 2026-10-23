'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { ChevronIcon } from '@/components/ui/icons';
import { TextField } from '@/components/ui/Field';
import { SelectField } from '@/components/ui/SelectField';
import { ChordChartEditor } from '@/components/repertoire/ChordChartEditor';
import { TabEditor } from '@/components/repertoire/TabEditor';
import { isTabEditorEnabled } from '@/utils/feature-flags';
import { createRepertoireItem, REPERTOIRE_DIFFICULTIES } from '@/utils/repertoire-item';
import { getDifficultyLabel } from '@/utils/difficulty-labels';
import { normalizeChordChart } from '@/utils/repertoire-chord-chart';
import { normalizeTab } from '@/utils/repertoire-tab';
import { parseTuningNotes } from '@/utils/chords';
import {
  isAllowedResourceUrl,
  SPOTIFY_LINK_HOSTS,
  YOUTUBE_LINK_HOSTS,
} from '@/utils/practice-resource-links';
import { parseRepertoireCapo } from '@/utils/repertoire-item-editing';
import { useRepertoireSongDraft } from '@/hooks/useRepertoireSongDraft';
import { usePracticeStore } from '@/stores/usePracticeStore';
import type {
  GuitarType,
  RepertoireDifficulty,
} from '@/types/practice';
import { PracticeResourceEditor } from '@/components/practice/PracticeResourceEditor';
import { useI18nSection } from '@/i18n/I18nProvider';
import { createId as createIdentifier } from '@/utils/create-id';
import { COMMON_TUNINGS } from '@/utils/repertoire-item';

function createId() {
  return createIdentifier();
}

export function RepertoireSongForm({
  onCreated,
}: {
  onCreated?: (itemId: string) => void;
}) {
  const text = useI18nSection('repertoire');
  const saveRepertoireItem = usePracticeStore(
    (state) => state.saveRepertoireItem,
  );
  const {
    title,
    setTitle,
    artist,
    setArtist,
    tuning,
    setTuning,
    customTuning,
    setCustomTuning,
    capo,
    setCapo,
    guitarType,
    setGuitarType,
    difficulty,
    setDifficulty,
    youtubeUrl,
    setYoutubeUrl,
    spotifyUrl,
    setSpotifyUrl,
    isFutureLearn,
    setIsFutureLearn,
    resources,
    setResources,
    chordChart,
    setChordChart,
    tab,
    setTab,
    finalTuning,
  } = useRepertoireSongDraft();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedTab = normalizeTab(tab, finalTuning || undefined);

  async function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError(`${text.title}: ${text.search}`);
      return;
    }
    if (!isAllowedResourceUrl(youtubeUrl, YOUTUBE_LINK_HOSTS)) {
      setError(text.adjustFilters);
      return;
    }
    if (!isAllowedResourceUrl(spotifyUrl, SPOTIFY_LINK_HOSTS)) {
      setError(text.adjustFilters);
      return;
    }
    const parsedCapo = parseRepertoireCapo(capo);
    if (!parsedCapo.isValid) {
      setError(text.adjustFilters);
      return;
    }
    const capoNum = parsedCapo.value;

    setIsSaving(true);
    setError(null);
    const itemId = createId();
    try {
      const normalizedChart = normalizeChordChart(chordChart);
      const savedTab = normalizeTab(tab, finalTuning || undefined);

      saveRepertoireItem(
        createRepertoireItem({
          id: itemId,
          initialPartId: createId(),
          kind: 'song',
          title: cleanTitle,
          artist,
          tuning: finalTuning || undefined,
          capo: capoNum,
          guitarType: guitarType || undefined,
          difficulty: difficulty || undefined,
          youtubeUrl: youtubeUrl.trim() || undefined,
          spotifyUrl: spotifyUrl.trim() || undefined,
          isFutureLearn: isFutureLearn || undefined,
          resources: resources.length > 0 ? resources : undefined,
          chordChart:
            normalizedChart.lines.length > 0 ? normalizedChart : undefined,
          tab: savedTab.notes.length > 0 ? savedTab : undefined,
          updatedAt: new Date().toISOString(),
        }),
      );

      onCreated?.(itemId);
    } catch (saveError) {
      setError(
        saveError instanceof Error ?
          saveError.message
        : 'No se pudo guardar el elemento del repertorio.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={(event) => void addItem(event)} className='mt-6'>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end'>
        <label className='block text-xs text-muted'>
          {text.songs}
          <TextField
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={100}
            placeholder={text.titlePlaceholder}
            required
            className='mt-1'
          />
        </label>

        <label className='block text-xs text-muted'>
          {text.artist}
          <TextField
            value={artist}
            onChange={(event) => setArtist(event.target.value)}
            maxLength={100}
            placeholder={text.artistPlaceholder}
            className='mt-1'
          />
        </label>

        <div className='sm:col-span-2 lg:col-span-4'>
          <PracticeResourceEditor
            phaseId='repertoire'
            resources={resources}
            onChange={(_, changes) => setResources(changes.resources ?? [])}
          />
        </div>

        <details className='group lg:col-span-4 mt-2'>
          <summary className='flex cursor-pointer items-center gap-2 text-sm text-muted transition-colors hover:text-ink'>
            <ChevronIcon className='group-open:rotate-90' />
            {text.extraConfig}
          </summary>
          <div className='mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <label className='block text-xs text-muted sm:col-span-2'>
              {text.tuning}
              <SelectField
                className='mt-1'
                value={tuning}
                onChange={setTuning}
                ariaLabel={text.tuning}
                options={COMMON_TUNINGS.map((option) => ({
                  value: option,
                  label: option,
                }))}
              />
            </label>

            {tuning === 'Otra...' && (
              <label className='block text-xs text-muted sm:col-span-2'>
                {text.customTuning}
                <TextField
                  value={customTuning}
                  onChange={(event) => setCustomTuning(event.target.value)}
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
                onChange={(value) => setGuitarType(value as GuitarType | '')}
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
                onChange={(value) =>
                  setDifficulty(value as RepertoireDifficulty | '')
                }
                options={[
                  { value: '', label: text.difficultyNone },
                  ...REPERTOIRE_DIFFICULTIES.map((value) => ({
                    value,
                    label: getDifficultyLabel(text, value),
                  })),
                ]}
              />
            </label>

            <label className='flex cursor-pointer items-center gap-2 text-xs text-muted sm:col-span-4'>
              <input
                type='checkbox'
                checked={isFutureLearn}
                onChange={(event) => setIsFutureLearn(event.target.checked)}
                className='peer sr-only'
              />
              <span
                aria-hidden='true'
                className='flex size-4 items-center justify-center border border-muted text-transparent transition peer-checked:border-accent-green-fg peer-checked:bg-accent-green-fg peer-checked:text-canvas peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-green-fg'
              >
                <svg viewBox='0 0 12 12' className='size-3' fill='none'>
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
        </details>
      </div>

      <p className='mt-6 text-xs uppercase tracking-[0.12em] text-muted'>
        {text.tuningLabel}: {parseTuningNotes(finalTuning || undefined).join(' ')}
      </p>

      <ChordChartEditor value={chordChart} onChange={setChordChart} />
      {isTabEditorEnabled ? (
        <TabEditor value={normalizedTab} onChange={setTab} />
      ) : null}

      <Button
        type='submit'
        variant='primary'
        disabled={isSaving}
        className='mt-6 w-full sm:w-auto'
      >
        {isSaving ? text.saving : text.saveToRepertoire}
      </Button>

      {error && (
        <p className='mt-4 text-sm text-red-300' role='alert'>
          {error}
        </p>
      )}
    </form>
  );
}
