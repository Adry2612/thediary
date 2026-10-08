export const MIN_BPM = 40;
export const MAX_BPM = 240;

const TAP_RESET_MS = 2_000;
const MIN_TAP_INTERVAL_MS = 250;
const MAX_TAP_INTERVALS = 4;

export interface TapTempoState {
  lastTapTime: number | null;
  intervals: number[];
  tapCount: number;
}

export interface TapTempoUpdate {
  state: TapTempoState;
  bpm: number | null;
  accepted: boolean;
}

export function clampMetronomeBpm(value: number) {
  return Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(value)));
}

export function clampMetronomeVolume(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function getTapTempoUpdate(
  state: TapTempoState,
  tapTime: number,
): TapTempoUpdate {
  if (
    state.lastTapTime === null ||
    tapTime - state.lastTapTime > TAP_RESET_MS
  ) {
    return {
      state: { lastTapTime: tapTime, intervals: [], tapCount: 1 },
      bpm: null,
      accepted: true,
    };
  }

  const interval = tapTime - state.lastTapTime;
  if (interval < MIN_TAP_INTERVAL_MS) {
    return { state, bpm: null, accepted: false };
  }

  const intervals = [...state.intervals, interval].slice(-MAX_TAP_INTERVALS);
  const averageInterval =
    intervals.reduce((total, value) => total + value, 0) / intervals.length;

  return {
    state: {
      lastTapTime: tapTime,
      intervals,
      tapCount: intervals.length + 1,
    },
    bpm: 60_000 / averageInterval,
    accepted: true,
  };
}
