import { MAX_BPM, MIN_BPM } from "./metronome-tempo.ts";

export type TempoRampIntervalUnit = "bars" | "seconds" | "minutes";

export function isTempoRampIntervalUnit(
  value: string,
): value is TempoRampIntervalUnit {
  return Object.hasOwn(MAX_INTERVAL_BY_UNIT, value);
}

export interface TempoRampSettings {
  enabled: boolean;
  intervalValue: number;
  intervalUnit: TempoRampIntervalUnit;
  incrementBpm: number;
  maximumBpm: number;
}

export const DEFAULT_TEMPO_RAMP_SETTINGS: TempoRampSettings = {
  enabled: false,
  intervalValue: 4,
  intervalUnit: "bars",
  incrementBpm: 2,
  maximumBpm: MAX_BPM,
};

const MAX_INTERVAL_BY_UNIT: Record<TempoRampIntervalUnit, number> = {
  bars: 64,
  seconds: 3_600,
  minutes: 60,
};

function clampInteger(value: number, minimum: number, maximum: number): number {
  if (!Number.isFinite(value)) return minimum;
  return Math.min(maximum, Math.max(minimum, Math.round(value)));
}

export function normalizeTempoRampSettings(
  settings: TempoRampSettings,
): TempoRampSettings {
  return {
    enabled: settings.enabled,
    intervalValue: clampInteger(
      settings.intervalValue,
      1,
      MAX_INTERVAL_BY_UNIT[settings.intervalUnit],
    ),
    intervalUnit: settings.intervalUnit,
    incrementBpm: clampInteger(settings.incrementBpm, 1, 20),
    maximumBpm: clampInteger(settings.maximumBpm, MIN_BPM, MAX_BPM),
  };
}

export function getTempoRampIntervalSeconds(
  settings: TempoRampSettings,
): number | null {
  if (settings.intervalUnit === "bars") return null;
  if (settings.intervalUnit === "minutes") {
    return settings.intervalValue * 60;
  }
  return settings.intervalValue;
}

export function increaseTempoWithinLimit(
  bpm: number,
  incrementBpm: number,
  maximumBpm: number,
): number {
  if (bpm >= maximumBpm) return bpm;
  return Math.min(bpm + incrementBpm, maximumBpm);
}
