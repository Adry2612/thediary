export function getRecordingDurationSeconds(
  startedAtMilliseconds: number,
  stoppedAtMilliseconds: number,
): number {
  if (
    !Number.isFinite(startedAtMilliseconds) ||
    !Number.isFinite(stoppedAtMilliseconds) ||
    stoppedAtMilliseconds < startedAtMilliseconds
  ) {
    throw new RangeError("El intervalo de grabación no es válido.");
  }

  return (stoppedAtMilliseconds - startedAtMilliseconds) / 1_000;
}

export function getPlaybackDurationSeconds(
  mediaDurationSeconds: number,
  recordedDurationSeconds: number | undefined,
): number | null {
  if (Number.isFinite(mediaDurationSeconds) && mediaDurationSeconds > 0) {
    return mediaDurationSeconds;
  }

  if (
    recordedDurationSeconds !== undefined &&
    Number.isFinite(recordedDurationSeconds) &&
    recordedDurationSeconds > 0
  ) {
    return recordedDurationSeconds;
  }

  return null;
}
