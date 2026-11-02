export type WakeLockDecisionInput = {
  isRunning: boolean;
  isVisible: boolean;
  isSupported: boolean;
};

/** Solo se pide el bloqueo con el cronómetro en marcha, la página visible y soporte. */
export function shouldHoldWakeLock({
  isRunning,
  isVisible,
  isSupported,
}: WakeLockDecisionInput): boolean {
  return isRunning && isVisible && isSupported;
}
