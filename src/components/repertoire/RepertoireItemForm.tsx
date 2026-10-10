'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Field';
import { SelectField } from '@/components/ui/SelectField';
import { getPracticeFileKind } from '@/lib/practice-templates';
import { savePracticeAsset } from '@/lib/practice-library';
import type { PracticeAsset } from '@/lib/practice-library';
import { saveCloudPracticeAsset } from '@/lib/supabase/practice-files';
import { createRepertoireItem } from '@/lib/repertoire-item';
import { usePracticeStore } from '@/stores/usePracticeStore';
import type {
  RepertoireItem,
  RepertoireItemKind,
  GuitarType,
} from '@/types/practice';
import { useAppData } from '@/components/providers/AppDataProvider';
import { PracticeResourceEditor } from '@/components/practice/PracticeResourceEditor';
import type { PracticeResource } from '@/types/practice';
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

export function RepertoireItemForm() {
  const text = useI18nSection('repertoire');
  const { user, isReady } = useAppData();
  const saveRepertoireItem = usePracticeStore(
    (state) => state.saveRepertoireItem,
  );
  const [kind, setKind] = useState<RepertoireItemKind>('song');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [guitarProFile, setGuitarProFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Configuraciones extra
  const [showExtraConfig, setShowExtraConfig] = useState(false);
  const [tuning, setTuning] = useState('');
  const [customTuning, setCustomTuning] = useState('');
  const [capo, setCapo] = useState('');
  const [guitarType, setGuitarType] = useState<GuitarType | ''>('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [isFutureLearn, setIsFutureLearn] = useState(false);
  const [resources, setResources] = useState<PracticeResource[]>([]);

  function validateYoutubeUrl(url: string): boolean {
    if (!url.trim()) return true;
    try {
      const parsed = new URL(url);
      return (
        parsed.hostname === 'www.youtube.com' ||
        parsed.hostname === 'youtube.com' ||
        parsed.hostname === 'youtu.be' ||
        parsed.hostname === 'www.youtu.be'
      );
    } catch {
      return false;
    }
  }

  function validateSpotifyUrl(url: string): boolean {
    if (!url.trim()) return true;
    try {
      const parsed = new URL(url);
      return (
        parsed.hostname === 'open.spotify.com' ||
        parsed.hostname === 'spotify.com'
      );
    } catch {
      return false;
    }
  }

  async function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
       setError(`${text.title}: ${text.search}`);
      return;
    }
    if (
      guitarProFile &&
      getPracticeFileKind(guitarProFile.name) !== 'guitarpro'
    ) {
       setError(text.adjustFilters);
      return;
    }
    if (youtubeUrl.trim() && !validateYoutubeUrl(youtubeUrl)) {
       setError(text.adjustFilters);
      return;
    }
    if (spotifyUrl.trim() && !validateSpotifyUrl(spotifyUrl)) {
       setError(text.adjustFilters);
      return;
    }
    const capoNum = capo.trim() ? Number(capo) : undefined;
    if (
      capoNum !== undefined &&
      (isNaN(capoNum) || capoNum < 0 || capoNum > 12)
    ) {
       setError(text.adjustFilters);
      return;
    }

    setIsSaving(true);
    setError(null);
    const itemId = createId();
    let guitarPro: RepertoireItem['guitarPro'];
    try {
      if (kind === 'lick' && guitarProFile) {
        if (!isReady) {
          throw new Error(
            'Espera a que se carguen tus datos antes de subir archivos.',
          );
        }
        const assetId = createId();
        const asset: PracticeAsset = {
          id: assetId,
          fileName: guitarProFile.name,
          kind: 'guitarpro',
          blob: guitarProFile,
        };
        if (user) {
          await saveCloudPracticeAsset(user.id, asset);
        } else {
          await savePracticeAsset(asset);
        }
        guitarPro = {
          id: createId(),
          title: cleanTitle,
          kind: 'guitarpro',
          fileName: guitarProFile.name,
          assetId,
        };
      }

      const finalTuning =
        tuning === 'Otra...' ? customTuning.trim() : tuning.trim();

      saveRepertoireItem(
        createRepertoireItem({
          id: itemId,
          initialPartId: createId(),
          kind,
          title: cleanTitle,
          artist,
          guitarPro,
          tuning: finalTuning || undefined,
          capo: capoNum,
          guitarType: guitarType || undefined,
          youtubeUrl: youtubeUrl.trim() || undefined,
          spotifyUrl: spotifyUrl.trim() || undefined,
          isFutureLearn: isFutureLearn || undefined,
          resources: resources.length > 0 ? resources : undefined,
          updatedAt: new Date().toISOString(),
        }),
      );
      setTitle('');
      setArtist('');
      setGuitarProFile(null);
      setTuning('');
      setCustomTuning('');
      setCapo('');
      setGuitarType('');
      setYoutubeUrl('');
      setSpotifyUrl('');
      setIsFutureLearn(false);
      setResources([]);
      setShowExtraConfig(false);
      const fileInput =
        event.currentTarget.querySelector<HTMLInputElement>(
          'input[type="file"]',
        );
      if (fileInput) fileInput.value = '';
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
    <section className='enter rounded-xl border border-line bg-surface p-6 sm:p-8'>
      <div>
        <p className='text-xs uppercase tracking-[0.12em] text-muted'>
           {text.library}
        </p>
        <h2 className='mt-2 font-sans text-lg leading-7 font-semibold tracking-tight sm:text-xl sm:leading-8'>
           {text.title}
        </h2>
      </div>

      <form
        onSubmit={(event) => void addItem(event)}
        className='mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end'
      >
        <div className='block text-xs text-muted'>
           {text.typeFilter}
          <SelectField
            className='mt-1'
            value={kind}
             ariaLabel={text.typeFilter}
            onChange={(value) => setKind(value as RepertoireItemKind)}
            options={[
               { value: 'song', label: text.songs },
               { value: 'lick', label: text.licks },
            ]}
          />
        </div>

        <label className='block text-xs text-muted'>
           {kind === 'song' ? text.songs : text.licks}
          <TextField
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={100}
            placeholder={
               kind === 'song' ? text.titlePlaceholder : text.lickPlaceholder
            }
            required
            className='mt-1'
          />
        </label>

        {kind === 'song' ?
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
        : <label className='block cursor-pointer text-xs text-muted'>
             {text.guitarProOptional}
            <span className='mt-1 flex h-12 items-center truncate rounded-md border border-line px-4 text-sm text-muted transition-colors hover:border-white/20'>
               {guitarProFile?.name ?? text.selectGuitarPro}
            </span>
            <input
              type='file'
              accept='.gp,.gpx,.gp3,.gp4,.gp5'
              className='sr-only'
              onChange={(event) =>
                setGuitarProFile(event.target.files?.[0] ?? null)
              }
            />
          </label>
        }

        <div className='sm:col-span-2 lg:col-span-4'>
          <PracticeResourceEditor
            phaseId='repertoire'
            resources={resources}
            onChange={(_, changes) => setResources(changes.resources ?? [])}
          />
        </div>
        <details
          className='lg:col-span-4 mt-2'
          open={showExtraConfig}
        >
             <summary className='cursor-pointer flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink'>
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
          <div className='mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-in slide-in-from-top-2 duration-200'>
            <label className='block text-xs text-muted sm:col-span-2'>
               {text.tuning}
              <SelectField
                className='mt-1'
                value={tuning}
                onChange={(value) => {
                  setTuning(value);
                  if (value === 'Otra...') {
                    // Keep custom tuning empty when selecting "Otra..."
                  }
                }}
                 ariaLabel={text.tuning}
                options={COMMON_TUNINGS.map((t) => ({ value: t, label: t }))}
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

            <label className='flex items-center gap-2 cursor-pointer text-xs text-muted sm:col-span-4'>
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
        </details>
        <Button
          type='submit'
          variant='primary'
          disabled={isSaving}
          className='lg:col-span-4'
        >
          {isSaving ?
             text.saving
           : kind === 'song' ? text.addSong : text.addLick}
        </Button>
      </form>

      {error && (
        <p
          className='mt-4 text-sm text-red-300'
          role='alert'
        >
          {error}
        </p>
      )}
    </section>
  );
}
