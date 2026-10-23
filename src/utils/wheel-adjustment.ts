export type WheelAdjustment = {
  steps: number;
  remainder: number;
};

export function consumeWheelDelta(
  accumulatedDelta: number,
  nextDelta: number,
  pixelsPerStep = 80,
): WheelAdjustment {
  if (
    !Number.isFinite(accumulatedDelta) ||
    !Number.isFinite(nextDelta) ||
    !Number.isFinite(pixelsPerStep) ||
    pixelsPerStep <= 0
  ) {
    throw new RangeError("Los valores de desplazamiento deben ser válidos.");
  }

  const boundedDelta = Math.max(
    -pixelsPerStep,
    Math.min(pixelsPerStep, nextDelta),
  );
  const totalDelta = accumulatedDelta + boundedDelta;
  const steps = Math.trunc(totalDelta / pixelsPerStep);
  return {
    steps,
    remainder: totalDelta - steps * pixelsPerStep,
  };
}
