import type { GuitarLick, TechniqueId } from "../../types/lick.ts";
import type { RepertoireItem } from "../../types/practice.ts";
import { getDaysSince } from "./dates.ts";
import { getLickTechnique, isTechniqueId } from "./techniques.ts";

/** Paleta compartida por las barras y el donut de la librería. */
export const LICK_CHART_COLORS = [
  "#8fc194",
  "#7aa7d9",
  "#d9a86c",
  "#c98bc4",
  "#75c7c2",
  "#c9c46c",
  "#d98b8b",
  "#9b9bd1",
  "#8bc99b",
  "#c0a37a",
] as const;

export function getLastPracticedLabel(
  text: Record<string, string>,
  lastPracticedAt: string | undefined,
  today: Date,
): string {
  if (!lastPracticedAt) return text.neverPracticed;
  const days = getDaysSince(lastPracticedAt, today);
  if (days === undefined) return text.neverPracticed;
  if (days <= 0) return text.practicedToday;
  return days === 1
    ? `${text.dayAgoPrefix}${days}${text.dayAgoSuffix}`
    : `${text.daysAgoPrefix}${days}${text.daysAgoSuffix}`;
}

export function getTechniqueLabel(
  text: Record<string, string>,
  id: TechniqueId,
): string {
  const descriptor = getLickTechnique(id);
  return descriptor ? (text[descriptor.labelKey] ?? id) : id;
}

export function getTechniqueLabels(
  text: Record<string, string>,
  techniques: TechniqueId[],
): string[] {
  return techniques.filter(isTechniqueId).map((id) => getTechniqueLabel(text, id));
}

export function findLinkedSong(
  songs: RepertoireItem[],
  associatedSongId: string | undefined,
): RepertoireItem | undefined {
  if (!associatedSongId) return undefined;
  return songs.find(
    (song) =>
      song.id === associatedSongId && song.kind === "song",
  );
}

export function formatLickDate(
  isoDate: string,
  locale: string,
  withTime = false,
): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(date);
}

export function formatShortLickDate(isoDate: string, locale: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
  }).format(date);
}

export function getLickTitle(
  text: Record<string, string>,
  lick: GuitarLick,
): string {
  return lick.title.trim() || text.untitled;
}
