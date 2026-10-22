import type { GuitarLick } from "../../types/lick.ts";
import { createId } from "../create-id.ts";
import { normalizeLickBpm } from "./normalize.ts";

export interface LickProgress {
  startBpm?: number;
  currentBpm?: number;
  targetBpm?: number;
  /** Porcentaje del objetivo alcanzado, nunca por encima de 100. */
  percentage?: number;
  reachedTarget: boolean;
}

function sortHistory(lick: GuitarLick) {
  return [...lick.bpmHistory].sort(
    (first, second) => Date.parse(first.date) - Date.parse(second.date),
  );
}

export function getLickProgress(lick: GuitarLick): LickProgress {
  const history = sortHistory(lick);
  const startBpm = history[0]?.bpm;
  const currentBpm = history.at(-1)?.bpm ?? lick.currentBpm;
  const targetBpm = lick.targetBpm;
  const reachedTarget =
    targetBpm !== undefined &&
    currentBpm !== undefined &&
    currentBpm >= targetBpm;
  const percentage =
    targetBpm !== undefined && targetBpm > 0 && currentBpm !== undefined
      ? Math.min(100, Math.round((currentBpm / targetBpm) * 100))
      : undefined;

  return {
    ...(startBpm !== undefined ? { startBpm } : {}),
    ...(currentBpm !== undefined ? { currentBpm } : {}),
    ...(targetBpm !== undefined ? { targetBpm } : {}),
    ...(percentage !== undefined ? { percentage } : {}),
    reachedTarget,
  };
}

/**
 * Añade un registro al historial y actualiza el estado de práctica del lick.
 * Un BPM fuera del rango del metrónomo no se registra.
 */
export function recordLickBpm(
  lick: GuitarLick,
  bpm: number,
  notes?: string,
  now: Date = new Date(),
): GuitarLick | null {
  const normalizedBpm = normalizeLickBpm(bpm);
  if (normalizedBpm === undefined) return null;

  const trimmedNotes = notes?.trim();
  const entry = {
    id: createId(),
    bpm: normalizedBpm,
    date: now.toISOString(),
    ...(trimmedNotes ? { notes: trimmedNotes } : {}),
  };
  const bpmHistory = [...lick.bpmHistory, entry].sort(
    (first, second) => Date.parse(first.date) - Date.parse(second.date),
  );

  return {
    ...lick,
    bpmHistory,
    currentBpm: bpmHistory.at(-1)?.bpm ?? normalizedBpm,
    lastPracticedAt: now.toISOString(),
    practiceCount: Math.max(0, Math.floor(lick.practiceCount)) + 1,
  };
}

/** Marca el lick como practicado sin tocar su BPM ni su historial. */
export function markLickPracticed(
  lick: GuitarLick,
  now: Date = new Date(),
): GuitarLick {
  return {
    ...lick,
    lastPracticedAt: now.toISOString(),
    practiceCount: Math.max(0, Math.floor(lick.practiceCount)) + 1,
  };
}
