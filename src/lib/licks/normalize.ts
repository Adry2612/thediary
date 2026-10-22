import type { BpmLogEntry, GuitarLick } from "../../types/lick.ts";
import { normalizeMusicalKey } from "./keys.ts";
import { normalizeTechniques } from "./techniques.ts";
import { MAX_BPM, MIN_BPM } from "../metronome-tempo.ts";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeIsoDate(value: unknown): string | undefined {
  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    return undefined;
  }
  return value;
}

/** BPM válido para un lick: el mismo rango que el metrónomo, redondeado. */
export function normalizeLickBpm(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  const bpm = Math.round(value);
  return bpm >= MIN_BPM && bpm <= MAX_BPM ? bpm : undefined;
}

function normalizeBpmEntry(
  value: unknown,
  fallbackId: string,
): BpmLogEntry | undefined {
  if (!isRecord(value)) return undefined;
  const bpm = normalizeLickBpm(value.bpm);
  const date = normalizeIsoDate(value.date);
  if (bpm === undefined || !date) return undefined;

  const id =
    typeof value.id === "string" && value.id.trim()
      ? value.id
      : fallbackId;
  const notes =
    typeof value.notes === "string" && value.notes.trim()
      ? value.notes.trim()
      : undefined;

  return { id, bpm, date, ...(notes ? { notes } : {}) };
}

function normalizeHistory(value: unknown): BpmLogEntry[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry, index) =>
      normalizeBpmEntry(
        entry,
        `bpm-${String(index).padStart(2, "0")}`,
      ),
    )
    .filter((entry): entry is BpmLogEntry => entry !== undefined)
    .sort((first, second) => Date.parse(first.date) - Date.parse(second.date));
}

export function normalizeLick(value: unknown): GuitarLick | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== "string" || !value.id.trim()) return null;

  const bpmHistory = normalizeHistory(value.bpmHistory);
  const lastEntry = bpmHistory.at(-1);
  const createdAt = normalizeIsoDate(value.createdAt) ?? new Date().toISOString();
  const lastPracticedAt = normalizeIsoDate(value.lastPracticedAt);
  const associatedSongId =
    typeof value.associatedSongId === "string" && value.associatedSongId.trim()
      ? value.associatedSongId
      : undefined;
  const practiceCount =
    typeof value.practiceCount === "number" &&
    Number.isFinite(value.practiceCount) &&
    value.practiceCount >= 0
      ? Math.floor(value.practiceCount)
      : 0;
  const key = normalizeMusicalKey(value.key);
  const techniques = normalizeTechniques(value.techniques);
  const targetBpm = normalizeLickBpm(value.targetBpm);

  return {
    id: value.id,
    title: typeof value.title === "string" ? value.title : "",
    tabContent: typeof value.tabContent === "string" ? value.tabContent : "",
    ...(key ? { key } : {}),
    techniques,
    ...(associatedSongId ? { associatedSongId } : {}),
    ...(targetBpm !== undefined ? { targetBpm } : {}),
    ...(lastEntry ? { currentBpm: lastEntry.bpm } : {}),
    bpmHistory,
    createdAt,
    ...(lastPracticedAt ? { lastPracticedAt } : {}),
    practiceCount,
  };
}

/** Normaliza una colección y descarta duplicados por identidad. */
export function normalizeLicks(value: unknown): GuitarLick[] {
  if (!Array.isArray(value)) return [];
  const byId = new Map<string, GuitarLick>();
  for (const item of value) {
    const lick = normalizeLick(item);
    if (lick) byId.set(lick.id, lick);
  }
  return [...byId.values()];
}
