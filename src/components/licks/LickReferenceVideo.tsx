"use client";

import { useEffect, useRef, useState } from "react";
import { useI18nSection } from "@/i18n/I18nProvider";
import { extractYoutubeVideoId } from "@/utils/practice-resource-links";
import {
  formatClipTime,
  youtubeEmbedUrl,
  youtubeWatchUrl,
} from "@/utils/licks/reference-video";
import type { LickReferenceVideo as ReferenceVideo } from "@/types/lick";

type YouTubePlayer = {
  destroy: () => void;
  playVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
};

type YouTubeNamespace = {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string;
      width?: string;
      height?: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onStateChange?: (event: { data: number }) => void;
        onError?: () => void;
      };
    },
  ) => YouTubePlayer;
  PlayerState: { ENDED: number };
};

declare global {
  interface Window {
    YT?: YouTubeNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YouTubeNamespace> | null = null;

/** Carga la IFrame API una sola vez y comparte la promesa entre montajes. */
function loadYouTubeApi(): Promise<YouTubeNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;

  apiPromise = new Promise<YouTubeNamespace>((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT) resolve(window.YT);
    };

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.addEventListener("error", () => {
      apiPromise = null;
      reject(new Error("youtube-api"));
    });
    document.head.appendChild(script);
  });

  return apiPromise;
}

/**
 * Reproductor del fragmento de referencia. Sin autoplay; al llegar al final
 * vuelve al inicio del fragmento y sigue, cosa que `loop=1` no hace.
 */
export function LickReferenceVideo({ video }: { video: ReferenceVideo }) {
  const text = useI18nSection("licks");
  const hostRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const videoId = extractYoutubeVideoId(video.url);
  const embedUrl = youtubeEmbedUrl(video);
  const watchUrl = youtubeWatchUrl(video);

  useEffect(() => {
    const host = hostRef.current;
    if (!videoId || !host) return;

    let disposed = false;
    let player: YouTubePlayer | null = null;
    host.replaceChildren();
    setFailed(false);

    void loadYouTubeApi()
      .then((youTube) => {
        if (disposed || !hostRef.current) return;
        const element = document.createElement("div");
        host.replaceChildren(element);
        player = new youTube.Player(element, {
          videoId,
          width: "100%",
          height: "100%",
          playerVars: {
            start: video.startSeconds,
            end: video.endSeconds,
            playsinline: 1,
            rel: 0,
            origin: window.location.origin,
          },
          events: {
            onStateChange: (event) => {
              if (event.data !== youTube.PlayerState.ENDED) return;
              player?.seekTo(video.startSeconds, true);
              player?.playVideo();
            },
            onError: () => {
              if (!disposed) setFailed(true);
            },
          },
        });
      })
      .catch(() => {
        if (!disposed) setFailed(true);
      });

    return () => {
      disposed = true;
      try {
        player?.destroy();
      } catch {
        // El reproductor pudo no llegar a crearse.
      }
      host.replaceChildren();
    };
  }, [videoId, video.startSeconds, video.endSeconds]);

  if (!embedUrl || !watchUrl) return null;

  return (
    <div className="rounded-xl border border-line bg-surface p-4 sm:p-5">
      <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
        {text.referenceVideoTitle}
      </p>
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
        {failed ? (
          <iframe
            title={text.referenceVideoTitle}
            src={embedUrl}
            className="absolute inset-0 size-full"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div ref={hostRef} className="absolute inset-0 size-full" />
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted">
          {text.referenceVideoRange
            .replace("{start}", formatClipTime(video.startSeconds))
            .replace("{end}", formatClipTime(video.endSeconds))}
        </p>
        <a
          href={watchUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-ink underline underline-offset-4 transition hover:text-ink/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/60"
        >
          {text.referenceVideoOpen}
        </a>
      </div>

      {failed ? (
        <p role="alert" className="mt-2 text-xs text-amber-200">
          {text.referenceVideoUnavailable}
        </p>
      ) : null}
    </div>
  );
}
