"use client";

import { AttachMaterialForm } from "@/components/practice/AttachMaterialForm";
import { AttachMaterialMenu } from "@/components/practice/AttachMaterialMenu";
import { usePracticeAttachment } from "@/hooks/usePracticeAttachment";
import type { PracticePhase, PracticeResource } from "@/types/practice";

interface Props {
  phaseId: PracticePhase["id"];
  resources: PracticeResource[];
  onChange: (
    phaseId: PracticePhase["id"],
    changes: Partial<PracticePhase>,
  ) => void;
}

const RESOURCE_LABELS: Record<PracticeResource["kind"], string> = {
  songsterr: "Songsterr",
  pdf: "PDF",
  audio: "Audio",
  guitarpro: "Guitar Pro",
  youtube: "YouTube",
  spotify: "Spotify",
  tab: "TAB",
};

export function PracticeResourceEditor({
  phaseId,
  resources,
  onChange,
}: Props) {
  function addResource(resource: PracticeResource) {
    onChange(phaseId, { resources: [...resources, resource] });
  }

  function removeResource(resourceId: string) {
    onChange(phaseId, {
      resources: resources.filter((resource) => resource.id !== resourceId),
    });
  }

  const attachment = usePracticeAttachment(addResource);

  return (
    <div className="rounded-lg border border-line bg-canvas/30 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.05em] text-muted">
            Material de estudio
          </p>
          <p className="mt-1 text-sm text-muted">
            Añade una TAB, PDF o enlace para este bloque.
          </p>
        </div>
        <AttachMaterialMenu onSelect={attachment.open} />
      </div>

      {resources.length > 0 && (
        <ul className="mt-4 space-y-2">
          {resources.map((resource) => (
            <li
              key={resource.id}
              className="flex min-w-0 items-center justify-between gap-3 border border-line px-3 py-2 text-sm"
            >
              <span className="min-w-0 truncate">
                {resource.title}
                <span className="ml-2 text-xs text-muted">
                  {RESOURCE_LABELS[resource.kind]}
                </span>
              </span>
              <button
                type="button"
                onClick={() => removeResource(resource.id)}
                aria-label={`Quitar ${resource.title}`}
                className="shrink-0 text-xs text-muted hover:text-ink"
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}

      {attachment.activeType && (
        <div className="mt-4">
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
        </div>
      )}
    </div>
  );
}
