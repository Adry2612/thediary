"use client";

import { useEffect, useRef, useState } from "react";
import { useAppData } from "@/components/providers/AppDataProvider";
import { GuitarProViewer } from "@/components/practice/GuitarProViewer";
import { MusicNoteIcon, PlayIcon } from "@/components/ui/icons";
import { useI18nSection } from "@/i18n/I18nProvider";
import { useAssetUrl } from "@/hooks/useAssetUrl";
import { extractYoutubeVideoId } from "@/utils/practice-resource-links";
import { RESOURCE_LABELS } from "@/utils/practice-resources";
import type { PracticeResource } from "@/types/practice";

/**
 * Vista previa compacta del material de un lick para la biblioteca. Carga el
 * visor pesado solo cuando la tarjeta se acerca al viewport.
 */
export function LickMaterialPreview({
  resources = [],
}: {
  resources?: PracticeResource[];
}) {
  const text = useI18nSection("licks");
  const [selectedId, setSelectedId] = useState(resources[0]?.id);
  const active =
    resources.find((resource) => resource.id === selectedId) ?? resources[0];
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || isVisible) return;
    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { rootMargin: "200px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [isVisible]);

  if (!active) {
    return (
      <div className="mt-4 flex h-40 items-center justify-center rounded-lg border border-dashed border-line bg-canvas/40 text-xs text-muted">
        {text.noMaterialPreview}
      </div>
    );
  }

  return (
    <div className="mt-4 min-h-0 min-w-0">
      {resources.length > 1 ? (
        <div
          role="group"
          aria-label="Material del lick"
          className="mb-2 flex gap-1.5 overflow-x-auto pb-1"
        >
          {resources.map((resource) => (
            <button
              key={resource.id}
              type="button"
              onClick={() => setSelectedId(resource.id)}
              aria-pressed={resource.id === active.id}
              className={`max-w-40 shrink-0 truncate rounded-md border px-2 py-1 text-[11px] transition ${
                resource.id === active.id
                  ? "border-ink/40 bg-white/5 text-ink"
                  : "border-line text-muted hover:text-ink"
              }`}
            >
              {resource.title}
            </button>
          ))}
        </div>
      ) : null}

      <div
        ref={containerRef}
        className="relative h-40 overflow-hidden rounded-lg border border-line bg-canvas/40"
      >
        {isVisible ? (
          <MaterialPreviewContent resource={active} />
        ) : (
          <PreviewPlaceholder resource={active} />
        )}
        <span className="pointer-events-none absolute right-2 top-2 rounded bg-black/70 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.08em] text-white/90">
          {RESOURCE_LABELS[active.kind]}
        </span>
      </div>
      {resources.length === 1 ? (
        <p className="mt-1 truncate text-[11px] text-muted">{active.title}</p>
      ) : null}
    </div>
  );
}

function MaterialPreviewContent({ resource }: { resource: PracticeResource }) {
  const { user } = useAppData();
  const needsUrl = resource.kind === "image" || resource.kind === "pdf";
  const { url, error } = useAssetUrl(needsUrl ? resource : null, user?.id);

  if (resource.kind === "guitarpro") {
    return <GuitarProViewer resource={resource} userId={user?.id} compact />;
  }

  if (resource.kind === "youtube") {
    const videoId = extractYoutubeVideoId(resource.url ?? "");
    if (!videoId) return <PreviewPlaceholder resource={resource} />;
    return (
      <div className="relative h-full w-full">
        <img
          src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
          alt={resource.title}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-9 items-center justify-center rounded-full bg-black/70 text-white">
            <PlayIcon className="size-4" />
          </span>
        </span>
      </div>
    );
  }

  if (resource.kind === "image") {
    if (error || !url) return <PreviewPlaceholder resource={resource} />;
    return (
      <img
        src={url}
        alt={resource.title}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    );
  }

  if (resource.kind === "pdf") {
    if (error || !url) return <PreviewPlaceholder resource={resource} />;
    return (
      <iframe
        src={url}
        title={resource.title}
        aria-hidden="true"
        tabIndex={-1}
        className="pointer-events-none h-full w-full border-0 bg-white"
      />
    );
  }

  return <PreviewPlaceholder resource={resource} />;
}

function PreviewPlaceholder({ resource }: { resource: PracticeResource }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 px-4 text-center text-muted">
      <MusicNoteIcon className="size-6" />
      <p className="w-full truncate text-xs">{resource.title}</p>
      <p className="text-[10px] uppercase tracking-[0.08em]">
        {RESOURCE_LABELS[resource.kind]}
      </p>
    </div>
  );
}
