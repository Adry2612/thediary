'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { AttachMaterialForm } from '@/components/practice/AttachMaterialForm';
import { AttachMaterialMenu } from '@/components/practice/AttachMaterialMenu';
import { ResourcePreview } from '@/components/practice/ResourcePreview';
import { useMaterialSelection } from '@/hooks/useMaterialSelection';
import { usePracticeAttachment } from '@/hooks/usePracticeAttachment';
import type { PracticePhase, PracticeResource } from '@/types/practice';
import { useAppData } from '@/components/providers/AppDataProvider';

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
  const { activeResource, selectResource } = useMaterialSelection(resources);

  function handleAttach(resource: PracticeResource) {
    selectResource(resource.id);
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
                onClick={() => selectResource(resource.id)}
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
