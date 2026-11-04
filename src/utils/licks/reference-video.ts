import { extractYoutubeVideoId } from "../practice-resource-links.ts";
import {
  MAX_CLOCK_SECONDS,
  formatClockInput,
  parseClockInput,
} from "../clock-time.ts";
import type { LickReferenceVideo } from "../../types/lick.ts";

const MAX_SECONDS = MAX_CLOCK_SECONDS;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * El clip y la edición de prácticas comparten el mismo parser y formateador.
 * Se mantienen estos alias para no romper a los consumidores del clip.
 */
export const parseClipTime = parseClockInput;
export const formatClipTime = formatClockInput;

export type ReferenceDraftError =
  | "invalidUrl"
  | "invalidStart"
  | "invalidEnd";

export type ReferenceDraftResult =
  | { value?: LickReferenceVideo }
  | { error: ReferenceDraftError };

/** Valida los tres campos del editor y normaliza el clip. */
export function validateReferenceDraft({
  url,
  start,
  end,
}: {
  url: string;
  start: string;
  end: string;
}): ReferenceDraftResult {
  const trimmedUrl = url.trim();
  const hasStart = start.trim() !== "";
  const hasEnd = end.trim() !== "";

  if (!trimmedUrl && !hasStart && !hasEnd) return {};

  if (!trimmedUrl || !extractYoutubeVideoId(trimmedUrl)) {
    return { error: "invalidUrl" };
  }

  const startSeconds = hasStart ? parseClipTime(start) : 0;
  if (startSeconds === null) return { error: "invalidStart" };

  const endSeconds = parseClipTime(end);
  if (endSeconds === null || endSeconds <= startSeconds) {
    return { error: "invalidEnd" };
  }

  return {
    value: { url: trimmedUrl, startSeconds, endSeconds },
  };
}

/** Normaliza un clip guardado; si algo no encaja devuelve `undefined`. */
export function normalizeReferenceVideo(
  value: unknown,
): LickReferenceVideo | undefined {
  if (!isRecord(value)) return undefined;
  if (typeof value.url !== "string" || !extractYoutubeVideoId(value.url)) {
    return undefined;
  }

  const start = value.startSeconds;
  const end = value.endSeconds;
  if (typeof start !== "number" || typeof end !== "number") return undefined;
  if (!Number.isInteger(start) || !Number.isInteger(end)) return undefined;
  if (start < 0 || end <= start || end >= MAX_SECONDS) return undefined;

  return {
    url: value.url,
    startSeconds: start,
    endSeconds: end,
  };
}

/** URL del iframe con el fragmento marcado, para el respaldo sin API. */
export function youtubeEmbedUrl(video: LickReferenceVideo): string | null {
  const videoId = extractYoutubeVideoId(video.url);
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}?start=${video.startSeconds}&end=${video.endSeconds}&playsinline=1&rel=0`;
}

/** Enlace externo que abre YouTube en el segundo de inicio del clip. */
export function youtubeWatchUrl(video: LickReferenceVideo): string | null {
  const videoId = extractYoutubeVideoId(video.url);
  if (!videoId) return null;
  return `https://www.youtube.com/watch?v=${videoId}&t=${video.startSeconds}s`;
}
