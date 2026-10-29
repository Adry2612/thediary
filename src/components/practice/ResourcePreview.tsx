"use client";

import { PracticeAudioPlayer } from "@/components/practice/PracticeAudioPlayer";
import { GuitarProViewer } from "@/components/practice/GuitarProViewer";
import { useAssetUrl } from "@/hooks/useAssetUrl";
import { normalizeSongsterrUrl } from "@/utils/practice-templates";
import {
  extractSpotifyTrackId,
  extractYoutubeVideoId,
} from "@/utils/practice-resource-links";
import { RESOURCE_LABELS } from "@/utils/practice-resources";
import type { PracticeResource } from "@/types/practice";

/** El visor que corresponde a un material: enlace incrustado, archivo o TAB. */
export function ResourcePreview({
  resource,
  userId,
}: {
  resource: PracticeResource;
  userId?: string;
}) {
  const { url, error } = useAssetUrl(resource, userId);

  if (resource.kind === "songsterr") {
    const safeUrl = normalizeSongsterrUrl(resource.url ?? "");
    if (!safeUrl) {
      return (
        <p className="p-6 text-sm text-muted">
          El enlace de {RESOURCE_LABELS.songsterr} no es válido.
        </p>
      );
    }

    return (
      <div className="flex flex-col items-start gap-3 p-5 sm:p-6">
        <p className="text-sm text-muted">
          Este material se abre en {RESOURCE_LABELS.songsterr}, fuera de la
          aplicación.
        </p>
        <a
          href={safeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-10 items-center rounded-md border border-line px-3 text-sm text-ink transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/60"
        >
          Abrir {RESOURCE_LABELS.songsterr} en otra pestaña
        </a>
      </div>
    );
  }

  if (resource.kind === "tab" && !resource.assetId) {
    return (
      <pre className="max-h-[32rem] overflow-auto bg-canvas p-4 font-mono text-xs leading-relaxed text-ink sm:text-sm">
        {resource.text}
      </pre>
    );
  }

  if (resource.kind === "youtube") {
    const videoId = extractYoutubeVideoId(resource.url ?? "");
    if (!videoId) {
      return (
        <p className="p-6 text-sm text-muted">
          El enlace de {RESOURCE_LABELS.youtube} no es válido.
        </p>
      );
    }
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;

    return (
      <div>
        <iframe
          src={embedUrl}
          title={resource.title}
          className="aspect-video w-full border-0 bg-black"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
        <a
          href={resource.url}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block text-sm text-muted underline underline-offset-4"
        >
          Abrir en {RESOURCE_LABELS.youtube}
        </a>
      </div>
    );
  }

  if (resource.kind === "spotify") {
    const trackId = extractSpotifyTrackId(resource.url ?? "");
    if (!trackId) {
      return (
        <p className="p-6 text-sm text-muted">
          El enlace de {RESOURCE_LABELS.spotify} no es válido.
        </p>
      );
    }
    const embedUrl = `https://open.spotify.com/embed/track/${trackId}`;

    return (
      <div>
        <iframe
          src={embedUrl}
          title={resource.title}
          className="h-[152px] w-full border-0"
          loading="lazy"
          allow="encrypted-media"
        />
        <a
          href={resource.url}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block text-sm text-muted underline underline-offset-4"
        >
          Abrir en {RESOURCE_LABELS.spotify}
        </a>
      </div>
    );
  }

  if (error) return <p className="p-6 text-sm text-red-300">{error}</p>;
  if (!url) return <p className="p-6 text-sm text-muted">Cargando archivo…</p>;
  if (resource.kind === "image") {
    return (
      <div className="flex flex-col items-center gap-3 p-4 sm:p-5">
        <img
          src={url}
          alt={resource.title}
          className="max-h-[32rem] max-w-full object-contain"
        />
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-muted underline underline-offset-4 hover:text-ink"
        >
          Abrir imagen en otra pestaña
        </a>
      </div>
    );
  }
  if (resource.kind === "audio") {
    return (
      <div className="p-5">
        <PracticeAudioPlayer
          src={url}
          title={resource.title}
          showVolumeControl
        />
      </div>
    );
  }
  if (resource.kind === "pdf") {
    return (
      <iframe
        src={url}
        title={resource.title}
        className="h-[28rem] w-full border-0 bg-white sm:h-[36rem]"
      />
    );
  }

  return <GuitarProViewer resource={resource} userId={userId} />;
}
