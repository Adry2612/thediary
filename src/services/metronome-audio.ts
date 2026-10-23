const CLICK_DURATION_SECONDS = 0.075;

interface ScheduleMetronomeClickInput {
  context: AudioContext;
  scheduledAt: number;
  volume: number;
  isDownbeat: boolean;
  activeOscillators: Set<OscillatorNode>;
}

export function scheduleMetronomeClick({
  context,
  scheduledAt,
  volume,
  isDownbeat,
  activeOscillators,
}: ScheduleMetronomeClickInput) {
  if (volume === 0) return;

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const peakVolume = isDownbeat ? volume : volume * 0.78;

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(isDownbeat ? 1_000 : 760, scheduledAt);
  gain.gain.setValueAtTime(0.0001, scheduledAt);
  gain.gain.linearRampToValueAtTime(peakVolume, scheduledAt + 0.004);
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    scheduledAt + CLICK_DURATION_SECONDS,
  );

  oscillator.connect(gain);
  gain.connect(context.destination);
  activeOscillators.add(oscillator);
  oscillator.addEventListener(
    "ended",
    () => {
      activeOscillators.delete(oscillator);
      oscillator.disconnect();
      gain.disconnect();
    },
    { once: true },
  );
  oscillator.start(scheduledAt);
  oscillator.stop(scheduledAt + CLICK_DURATION_SECONDS);
}
