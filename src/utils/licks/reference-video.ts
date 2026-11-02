import { extractYoutubeVideoId } from "../practice-resource-links.ts";
import type { LickReferenceVideo } from "../../types/lick.ts";

const MAX_SECONDS = 24 * 60 * 60;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Acepta `83`, `1:23` y `1:02:03`; devuelve segundos o `null`. */
export function parseClipTime(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^\d+(:\d{1,2}){0,2}$/.test(trimmed)) return null;

  const parts = trimmed.split(":").map(Number);
  if (parts.some((part) => !Number.isInteger(part) || part < 0)) return null;

  let seconds: number;
  if (parts.length === 1) {
    seconds = parts[0];
  } else if (parts.length === 2) {
    if (parts[1] >= 60) return null;
    seconds = parts[0] * 60 + parts[1];
  } else {
    if (parts[1] >= 60 || parts[2] >= 60) return null;
    seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  return seconds < MAX_SECONDS ? seconds : null;
}

/** Devuelve `m:ss` o `h:mm:ss`. */
export function formatClipTime(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const rest = safe % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
  }
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

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
