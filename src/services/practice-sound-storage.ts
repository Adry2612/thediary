import {
  DEFAULT_PRACTICE_END_SOUND,
  DEFAULT_PRACTICE_START_SOUND,
  normalizePracticeSound,
  type PracticeSound,
} from "@/utils/practice-sounds";

const START_KEY = "thediary.practice-start-sound";
const END_KEY = "thediary.practice-end-sound";

function readStored(key: string, fallback: PracticeSound): PracticeSound {
  if (typeof window === "undefined") return fallback;

  try {
    return normalizePracticeSound(window.localStorage.getItem(key), fallback);
  } catch {
    return fallback;
  }
}

function saveStored(key: string, sound: PracticeSound): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, sound);
  } catch {
    // La preferencia es opcional: el aviso sigue sonando con esta elección.
  }
}

export function readPracticeStartSound(): PracticeSound {
  return readStored(START_KEY, DEFAULT_PRACTICE_START_SOUND);
}

export function readPracticeEndSound(): PracticeSound {
  return readStored(END_KEY, DEFAULT_PRACTICE_END_SOUND);
}

export function savePracticeStartSound(sound: PracticeSound): void {
  saveStored(START_KEY, sound);
}

export function savePracticeEndSound(sound: PracticeSound): void {
  saveStored(END_KEY, sound);
}
