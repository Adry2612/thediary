const SCHEDULE_AHEAD_SECONDS = 0.1;
const BEATS_PER_BAR = 4;

export interface MetronomeScheduleState {
  nextBeatTime: number;
  beatNumber: number;
  subdivisionNumber: number;
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
}

interface ScheduledMetronomeBeats {
  state: MetronomeScheduleState;
  beats: ScheduledMetronomeBeat[];
}

export function getScheduledMetronomeBeats({
  state,
  currentTime,
  bpm,
  subdivision,
}: GetScheduledMetronomeBeatsInput): ScheduledMetronomeBeats {
  const beats: ScheduledMetronomeBeat[] = [];
  const schedulingLimit = currentTime + SCHEDULE_AHEAD_SECONDS;
  let nextBeatTime = state.nextBeatTime;
  let beatNumber = state.beatNumber;
  let subdivisionNumber = state.subdivisionNumber;

  while (nextBeatTime < schedulingLimit) {
    beats.push({
      scheduledAt: nextBeatTime,
      beat: beatNumber,
      subdivision: subdivisionNumber,
      isDownbeat: beatNumber === 0 && subdivisionNumber === 0,
    });

    nextBeatTime += 60 / bpm / subdivision;
    subdivisionNumber += 1;
    if (subdivisionNumber >= subdivision) {
      subdivisionNumber = 0;
      beatNumber = (beatNumber + 1) % BEATS_PER_BAR;
    }
  }

  return {
    state: { nextBeatTime, beatNumber, subdivisionNumber },
    beats,
  };
}
