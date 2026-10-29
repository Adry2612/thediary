import {
  getTempoRampIntervalSeconds,
  increaseTempoWithinLimit,
  type TempoRampSettings,
} from "./metronome-tempo-ramp.ts";
import {
  getBeatState,
  type MetronomeBeatState,
} from "./metronome-beat-pattern.ts";

const SCHEDULE_AHEAD_SECONDS = 0.1;

export interface MetronomeScheduleState {
  nextBeatTime: number;
  beatNumber: number;
  subdivisionNumber: number;
  completedBars: number;
  nextTempoIncreaseAt: number | null;
  nextTempoIncreaseBar: number | null;
}

/** Qué clic suena en un pulso programado. */
export type MetronomeBeatClick =
  | "accent"
  | "accentClosed"
  | "normal"
  | "none";

export interface ScheduledMetronomeBeat {
  scheduledAt: number;
  beat: number;
  subdivision: number;
  click: MetronomeBeatClick;
}

interface GetScheduledMetronomeBeatsInput {
  state: MetronomeScheduleState;
  currentTime: number;
  bpm: number;
  subdivision: number;
  beatsPerMeasure: number;
  beatPattern: readonly MetronomeBeatState[];
  tempoRamp: TempoRampSettings;
}

interface ScheduledMetronomeBeats {
  state: MetronomeScheduleState;
  bpm: number;
  beats: ScheduledMetronomeBeat[];
}

export function getScheduledMetronomeBeats({
  state,
  currentTime,
  bpm,
  subdivision,
  beatsPerMeasure,
  beatPattern,
  tempoRamp,
}: GetScheduledMetronomeBeatsInput): ScheduledMetronomeBeats {
  const beats: ScheduledMetronomeBeat[] = [];
  const schedulingLimit = currentTime + SCHEDULE_AHEAD_SECONDS;
  let nextBeatTime = state.nextBeatTime;
  let beatNumber = state.beatNumber;
  let subdivisionNumber = state.subdivisionNumber;
  let completedBars = state.completedBars;
  let nextTempoIncreaseAt = state.nextTempoIncreaseAt;
  let nextTempoIncreaseBar = state.nextTempoIncreaseBar;
  let currentBpm = bpm;
  const intervalSeconds = getTempoRampIntervalSeconds(tempoRamp);

  while (nextBeatTime < schedulingLimit) {
    // El incremento por compases sigue el inicio del compás, no el acento:
    // silenciar el primer pulso no debe parar la subida de tempo.
    const isBarStart = beatNumber === 0 && subdivisionNumber === 0;
    const beatState = getBeatState(beatPattern, beatNumber);
    const click: MetronomeBeatClick =
      beatState === "muted" ? "none"
      : beatState === "accent" && subdivisionNumber === 0 ? "accent"
      : beatState === "accentClosed" && subdivisionNumber === 0 ? "accentClosed"
      : "normal";

    if (
      tempoRamp.enabled &&
      tempoRamp.intervalUnit === "bars" &&
      isBarStart &&
      nextTempoIncreaseBar !== null &&
      completedBars >= nextTempoIncreaseBar
    ) {
      currentBpm = increaseTempoWithinLimit(
        currentBpm,
        tempoRamp.incrementBpm,
        tempoRamp.maximumBpm,
      );
      if (currentBpm >= tempoRamp.maximumBpm) {
        nextTempoIncreaseBar = null;
        nextTempoIncreaseAt = null;
      } else {
        nextTempoIncreaseBar += tempoRamp.intervalValue;
      }
    }

    while (
      tempoRamp.enabled &&
      intervalSeconds !== null &&
      nextTempoIncreaseAt !== null &&
      nextBeatTime >= nextTempoIncreaseAt &&
      currentBpm < tempoRamp.maximumBpm
    ) {
      currentBpm = increaseTempoWithinLimit(
        currentBpm,
        tempoRamp.incrementBpm,
        tempoRamp.maximumBpm,
      );
      if (currentBpm >= tempoRamp.maximumBpm) {
        nextTempoIncreaseAt = null;
      } else {
        nextTempoIncreaseAt += intervalSeconds;
      }
    }

    beats.push({
      scheduledAt: nextBeatTime,
      beat: beatNumber,
      subdivision: subdivisionNumber,
      click,
    });

    nextBeatTime += 60 / currentBpm / subdivision;
    subdivisionNumber += 1;
    if (subdivisionNumber >= subdivision) {
      subdivisionNumber = 0;
      beatNumber += 1;
      if (beatNumber >= beatsPerMeasure) {
        beatNumber = 0;
        completedBars += 1;
      }
    }
  }

  return {
    state: {
      nextBeatTime,
      beatNumber,
      subdivisionNumber,
      completedBars,
      nextTempoIncreaseAt,
      nextTempoIncreaseBar,
    },
    bpm: currentBpm,
    beats,
  };
}
