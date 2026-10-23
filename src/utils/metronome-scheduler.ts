import {
  getTempoRampIntervalSeconds,
  increaseTempoWithinLimit,
  type TempoRampSettings,
} from "./metronome-tempo-ramp.ts";

const SCHEDULE_AHEAD_SECONDS = 0.1;

export interface MetronomeScheduleState {
  nextBeatTime: number;
  beatNumber: number;
  subdivisionNumber: number;
  completedBars: number;
  nextTempoIncreaseAt: number | null;
  nextTempoIncreaseBar: number | null;
}

export interface ScheduledMetronomeBeat {
  scheduledAt: number;
  beat: number;
  subdivision: number;
  isDownbeat: boolean;
}

interface GetScheduledMetronomeBeatsInput {
  state: MetronomeScheduleState;
  currentTime: number;
  bpm: number;
  subdivision: number;
  beatsPerMeasure: number;
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
    const isDownbeat = beatNumber === 0 && subdivisionNumber === 0;

    if (
      tempoRamp.enabled &&
      tempoRamp.intervalUnit === "bars" &&
      isDownbeat &&
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
      isDownbeat,
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
