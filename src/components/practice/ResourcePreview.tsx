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
      <div>
        <iframe
          src={safeUrl}
          title={resource.title}
          className="h-[24rem] w-full border-0 bg-white sm:h-[32rem]"
          loading="lazy"
          allow="fullscreen"
        />
        <a
          href={safeUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block text-sm text-muted underline underline-offset-4"
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
