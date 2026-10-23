export const RECORDING_SAVED_EVENT = "thediary:practice-recording-saved";

export function notifyRecordingSaved(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(RECORDING_SAVED_EVENT));
}
