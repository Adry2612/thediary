const NOTATION_KEY = "thediary.tab-score-notation";
const PREVIEW_KEY = "thediary.tab-score-preview";

function readBoolean(key: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(key) === "true";
  } catch {
    return false;
  }
}

function writeBoolean(key: string, value: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value ? "true" : "false");
  } catch {
    // Sin almacenamiento se mantiene el valor por defecto en memoria.
  }
}

export function readShowStandardNotation(): boolean {
  return readBoolean(NOTATION_KEY);
}

export function saveShowStandardNotation(value: boolean): void {
  writeBoolean(NOTATION_KEY, value);
}

export function readNotePreview(): boolean {
  return readBoolean(PREVIEW_KEY);
}

export function saveNotePreview(value: boolean): void {
  writeBoolean(PREVIEW_KEY, value);
}
