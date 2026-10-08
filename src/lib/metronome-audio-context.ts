interface AudioContextConstructor {
  new (): AudioContext;
}

export function getOrCreateMetronomeAudioContext(
  context: AudioContext | null,
  AudioContextConstructor: AudioContextConstructor,
): AudioContext {
  if (context && context.state !== "closed") return context;
  return new AudioContextConstructor();
}

export async function resumeMetronomeAudioContext(
  context: AudioContext,
): Promise<void> {
  await context.resume();
}

export async function suspendMetronomeAudioContext(
  context: AudioContext,
): Promise<void> {
  if (context.state !== "running") return;
  await context.suspend();
}

export function closeMetronomeAudioContext(context: AudioContext): void {
  if (context.state === "closed") return;
  void context.close();
}
