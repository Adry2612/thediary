export type TutorialProgress = "completed" | "skipped";

const TUTORIAL_PROGRESS_KEY = "thediary-tutorial-progress-v1";

type TutorialStorage = Pick<Storage, "getItem" | "setItem">;

export function readTutorialProgress(
  storage: TutorialStorage,
): TutorialProgress | null {
  const progress = storage.getItem(TUTORIAL_PROGRESS_KEY);
  if (progress === null) return null;
  if (progress === "completed" || progress === "skipped") return progress;

  throw new Error("El estado guardado del tutorial no es válido.");
}

export function saveTutorialProgress(
  storage: TutorialStorage,
  progress: TutorialProgress,
): void {
  storage.setItem(TUTORIAL_PROGRESS_KEY, progress);
}
