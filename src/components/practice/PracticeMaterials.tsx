'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { PracticeAudioPlayer } from '@/components/practice/PracticeAudioPlayer';
import { getPracticeAsset } from '@/lib/practice-library';
import { getCloudPracticeAsset } from '@/lib/supabase/practice-files';
import { normalizeSongsterrUrl } from '@/lib/practice-templates';
import {
  extractSpotifyTrackId,
  extractYoutubeVideoId,
} from '@/lib/practice-resource-links';
import { AttachMaterialForm } from '@/components/practice/AttachMaterialForm';
import { AttachMaterialMenu } from '@/components/practice/AttachMaterialMenu';
import { usePracticeAttachment } from '@/hooks/usePracticeAttachment';
import type { PracticePhase, PracticeResource } from '@/types/practice';
import { useAppData } from '@/components/providers/AppDataProvider';

function GuitarProViewer({
  resource,
  userId,
}: {
  resource: PracticeResource;
  userId?: string;
}) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!container || !resource.assetId) return;
    const target = container;
    let isMounted = true;
    let destroyViewer = () => {};

    async function renderScore() {
      setError(null);
      setIsLoading(true);
      const asset =
        userId ?
          await getCloudPracticeAsset(userId, resource.assetId!)
        : await getPracticeAsset(resource.assetId!);
      if (!asset) throw new Error('No se encontró el archivo Guitar Pro.');
      if (!isMounted) return;

      const alphaTab = await import('@coderline/alphatab');
      if (!isMounted) return;
      const api = new alphaTab.AlphaTabApi(target, {
        core: {
          useWorkers: false,
          fontDirectory: '/alphatab/font/',
        },
        player: { enablePlayer: false },
      });
      destroyViewer = () => api.destroy();
      api.error.on((renderError) => {
        if (isMounted) setError(renderError.message);
      });
      api.load(new Uint8Array(await asset.blob.arrayBuffer()));
      if (isMounted) setIsLoading(false);
    }

    void renderScore().catch((renderError: unknown) => {
      if (!isMounted) return;
      setError(
        renderError instanceof Error ?
          renderError.message
        : 'No se pudo visualizar el archivo Guitar Pro.',
      );
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      destroyViewer();
      target.replaceChildren();
    };
  }, [container, resource.assetId, userId]);

  return (
    <div className='min-h-64 overflow-auto bg-white p-4 text-zinc-900'>
      {isLoading && (
        <p className='text-sm text-zinc-600'>Cargando tablatura…</p>
      )}
      {error && <p className='text-sm text-red-800'>{error}</p>}
      <div ref={setContainer} />
    </div>
  );
}

function useAssetUrl(resource: PracticeResource | null, userId?: string) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let objectUrl: string | null = null;
    setUrl(null);
    setError(null);
    if (!resource?.assetId || resource.kind === 'songsterr') return;

    const assetRequest =
      userId ?
        getCloudPracticeAsset(userId, resource.assetId)
      : getPracticeAsset(resource.assetId);
    void assetRequest
      .then((asset) => {
        if (!asset) throw new Error('No se encontró el archivo.');
        if (!isMounted) return;
        objectUrl = URL.createObjectURL(asset.blob);
        setUrl(objectUrl);
      })
      .catch((loadError: unknown) => {
        if (!isMounted) return;
        setError(
          loadError instanceof Error ?
            loadError.message
          : 'No se pudo abrir el archivo.',
        );
      });

    return () => {
      isMounted = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [resource, userId]);

  return { url, error };
}

function ResourcePreview({
  resource,
  userId,
}: {
  resource: PracticeResource;
  userId?: string;
}) {
  const { url, error } = useAssetUrl(resource, userId);

  if (resource.kind === 'songsterr') {
    const safeUrl = normalizeSongsterrUrl(resource.url ?? '');
    if (!safeUrl) {
      return (
        <p className='p-6 text-sm text-muted'>
          El enlace de Songsterr no es válido.
        </p>
      );
    }

    return (
      <div>
        <iframe
          src={safeUrl}
          title={resource.title}
          className='h-[24rem] w-full border-0 bg-white sm:h-[32rem]'
          loading='lazy'
          allow='fullscreen'
        />
        <a
          href={safeUrl}
          target='_blank'
          rel='noreferrer'
          className='mt-3 inline-block text-sm text-muted underline underline-offset-4'
        >
          Abrir Songsterr en otra pestaña
        </a>
      </div>
    );
  }

  if (resource.kind === 'tab' && !resource.assetId) {
    return (
      <pre className='max-h-[32rem] overflow-auto bg-canvas p-4 font-mono text-xs leading-relaxed text-ink sm:text-sm'>
        {resource.text}
      </pre>
    );
  }

  if (resource.kind === 'youtube') {
    const videoId = extractYoutubeVideoId(resource.url ?? '');
    if (!videoId) {
      return (
        <p className='p-6 text-sm text-muted'>
          El enlace de YouTube no es válido.
        </p>
      );
    }
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;

    return (
      <div>
        <iframe
          src={embedUrl}
          title={resource.title}
          className='aspect-video w-full border-0 bg-black'
          loading='lazy'
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
          allowFullScreen
        />
        <a
          href={resource.url}
          target='_blank'
          rel='noreferrer'
          className='mt-3 inline-block text-sm text-muted underline underline-offset-4'
        >
          Abrir en YouTube
        </a>
      </div>
    );
  }

  if (resource.kind === 'spotify') {
    const trackId = extractSpotifyTrackId(resource.url ?? '');
    if (!trackId) {
      return (
        <p className='p-6 text-sm text-muted'>
          El enlace de Spotify no es válido.
        </p>
      );
    }
    const embedUrl = `https://open.spotify.com/embed/track/${trackId}`;

    return (
      <div>
        <iframe
          src={embedUrl}
          title={resource.title}
          className='h-[152px] w-full border-0'
          loading='lazy'
          allow='encrypted-media'
        />
        <a
          href={resource.url}
          target='_blank'
          rel='noreferrer'
          className='mt-3 inline-block text-sm text-muted underline underline-offset-4'
        >
          Abrir en Spotify
        </a>
      </div>
    );
  }

  if (error) return <p className='p-6 text-sm text-red-300'>{error}</p>;
  if (!url) return <p className='p-6 text-sm text-muted'>Cargando archivo…</p>;
  if (resource.kind === 'audio') {
    return (
      <div className='p-5'>
        <PracticeAudioPlayer
          src={url}
          title={resource.title}
          showVolumeControl
        />
      </div>
    );
  }
  if (resource.kind === 'pdf') {
    return (
      <iframe
        src={url}
        title={resource.title}
        className='h-[28rem] w-full border-0 bg-white sm:h-[36rem]'
      />
    );
  }

  return (
    <GuitarProViewer
      resource={resource}
      userId={userId}
    />
  );
}

interface PracticeMaterialsProps {
  phases: PracticePhase[];
  attachedResources?: PracticeResource[];
  onAttach?: (resource: PracticeResource) => void;
  embedded?: boolean;
  splitView?: boolean;
}

export function PracticeMaterials({
  phases,
  attachedResources = [],
  onAttach,
  embedded = false,
  splitView = false,
}: PracticeMaterialsProps) {
  const { user } = useAppData();
  const resources = useMemo(
    () => [
      ...phases.flatMap((phase) =>
        (phase.resources ?? []).map((resource) => ({
          phaseName: phase.name,
          resource,
        })),
      ),
      ...attachedResources.map((resource) => ({
        phaseName: 'Adjunto',
        resource,
      })),
    ],
    [phases, attachedResources],
  );
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(
    resources[0]?.resource.id ?? null,
  );
  const activeResource =
    resources.find(({ resource }) => resource.id === selectedResourceId)
      ?.resource ?? resources[0]?.resource;

  useEffect(() => {
    if (!resources.some(({ resource }) => resource.id === selectedResourceId)) {
      setSelectedResourceId(resources[0]?.resource.id ?? null);
    }
  }, [resources, selectedResourceId]);

  function handleAttach(resource: PracticeResource) {
    setSelectedResourceId(resource.id);
    onAttach?.(resource);
  }

  const attachment = usePracticeAttachment(handleAttach);

  if (resources.length === 0 && !onAttach) return null;

  return (
    <Card
      bare={embedded}
      className={embedded ? 'p-4 sm:p-6' : 'p-5 sm:p-8'}
    >
      <div className='mb-5 flex items-start justify-between gap-4'>
        <div className='min-w-0'>
          <p className='text-xs uppercase text-muted'>Material de estudio</p>
          <h2 className='mt-2 font-sans text-lg leading-7 font-semibold tracking-tight sm:text-xl sm:leading-8'>
            Material y backing tracks
          </h2>
        </div>
        {onAttach && <AttachMaterialMenu onSelect={attachment.open} />}
      </div>
      {attachment.activeType && (
        <AttachMaterialForm
          type={attachment.activeType}
          tabMode={attachment.tabMode}
          draft={attachment.draft}
          error={attachment.error}
          isSaving={attachment.isSaving}
          onTabModeChange={attachment.setTabMode}
          onDraftChange={attachment.updateDraft}
          onSubmit={attachment.submit}
          onFileSelect={attachment.submitFile}
          onCancel={attachment.close}
        />
      )}
      {resources.length === 0 && (
        <p className='text-sm text-muted'>
          Aún no hay material. Usa el botón + para adjuntar una TAB, un PDF o un
          enlace de YouTube o Spotify.
        </p>
      )}
      {resources.length > 0 && (
        <div className={splitView ? 'grid min-h-0 gap-5' : 'grid gap-5 md:grid-cols-[12rem_minmax(0,1fr)]'}>
          <nav
            aria-label='Materiales de práctica'
            className={splitView ? '-mx-1 flex flex-nowrap gap-2 overflow-x-auto overflow-y-hidden px-1 pb-1' : '-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 md:mx-0 md:block md:space-y-2 md:overflow-visible md:px-0 md:pb-0'}
          >
            {resources.map(({ phaseName, resource }) => (
              <button
                key={resource.id}
                type='button'
                onClick={() => setSelectedResourceId(resource.id)}
                aria-current={
                  resource.id === activeResource?.id ? 'true' : undefined
                }
                className={`${splitView ? 'w-40 shrink-0' : 'block w-44 shrink-0 md:w-full'} border p-3 text-left transition ${
                  resource.id === activeResource?.id ?
                    'border-ink/40 bg-white/5'
                  : 'border-line hover:bg-white/5'
                }`}
              >
                <span className='block truncate text-sm'>{resource.title}</span>
                <span className='mt-1 block truncate text-xs text-muted'>
                  {phaseName}
                </span>
              </button>
            ))}
          </nav>
          {activeResource && (
            <div className='min-w-0'>
              <p className='mb-3 text-xs text-muted'>{activeResource.title}</p>
              <div className='overflow-hidden border border-line'>
                <ResourcePreview
                  key={activeResource.id}
                  resource={activeResource}
                  userId={user?.id}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
