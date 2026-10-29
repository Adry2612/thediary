const PRACTICE_SKILLS = new Set([
  "technique",
  "theory",
  "repertoire",
  "lick",
  "improvisation",
]);

export type PracticePlanPhase = {
  id: number | string;
  name: string;
  durationMinutes: number;
  skill: string;
  repertoireItemId?: string;
  repertoirePartId?: string;
  lickId?: string;
};

export interface PracticePlanLibraries {
  repertoireItems?: readonly {
    id: string;
    kind?: string;
    parts?: readonly { id: string }[];
  }[];
  licks?: readonly { id: string }[];
}

export type PracticeTemplateValidationError = "name" | "phases" | "phase";

export function validatePracticeTemplate(
  name: string,
  phases: PracticePlanPhase[],
  libraries: PracticePlanLibraries = {},
): PracticeTemplateValidationError | null {
  if (!name.trim() || name.trim().length > 80) return "name";
  if (phases.length === 0) return "phases";

  const phaseIds = new Set<string | number>();
  for (const phase of phases) {
    if (
      !phase.name.trim() ||
      !Number.isFinite(phase.durationMinutes) ||
      phase.durationMinutes <= 0 ||
      !PRACTICE_SKILLS.has(phase.skill) ||
      phaseIds.has(phase.id)
    ) {
      return "phase";
    }

    if (phase.skill === "repertoire") {
      if (!phase.repertoireItemId) return "phase";
      const song = libraries.repertoireItems?.find(
        (item) => item.id === phase.repertoireItemId,
      );
      if (libraries.repertoireItems && !song) return "phase";
      if (
        phase.repertoirePartId &&
        song?.parts &&
        !song.parts.some((part) => part.id === phase.repertoirePartId)
      ) {
        return "phase";
      }
    }

    if (phase.skill === "lick") {
      if (!phase.lickId) return "phase";
      if (
        libraries.licks &&
        !libraries.licks.some((lick) => lick.id === phase.lickId)
      ) {
        return "phase";
      }
    }

    phaseIds.add(phase.id);
  }

  return null;
}

export function normalizeSongsterrUrl(value: string): string | null {
  try {
    const url = new URL(value.trim());
    const isSongsterr =
      url.hostname === "songsterr.com" ||
      url.hostname.endsWith(".songsterr.com");
    if (url.protocol !== "https:" || !isSongsterr) return null;
    url.username = "";
    url.password = "";
    return url.toString();
  } catch {
    return null;
  }
}

export function getPracticeFileKind(
  fileName: string,
  mimeType = "",
): "audio" | "guitarpro" | "pdf" | "image" | null {
  const extension = fileName.split(".").at(-1)?.toLowerCase();
  if (extension === "pdf") return "pdf";
  if (["gp", "gpx", "gp3", "gp4", "gp5"].includes(extension ?? "")) {
    return "guitarpro";
  }
  if (isSupportedPracticeAudio(fileName, mimeType)) return "audio";
  if (isSupportedPracticeImage(fileName, mimeType)) return "image";
  return null;
}

const PRACTICE_IMAGE_EXTENSIONS = new Set([
  "avif",
  "gif",
  "jpeg",
  "jpg",
  "png",
  "webp",
]);

const PRACTICE_IMAGE_MIME_TYPES = new Set([
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export function isSupportedPracticeImage(
  fileName: string,
  mimeType: string,
): boolean {
  const extension = fileName.split(".").at(-1)?.toLowerCase();
  return (
    PRACTICE_IMAGE_MIME_TYPES.has(mimeType) ||
    PRACTICE_IMAGE_EXTENSIONS.has(extension ?? "")
  );
}

const PRACTICE_AUDIO_EXTENSIONS = new Set([
  "aac",
  "flac",
  "m4a",
  "mp3",
  "oga",
  "ogg",
  "opus",
  "wav",
  "webm",
]);

export function isSupportedPracticeAudio(
  fileName: string,
  mimeType: string,
): boolean {
  const extension = fileName.split(".").at(-1)?.toLowerCase();
  return (
    mimeType.startsWith("audio/") ||
    PRACTICE_AUDIO_EXTENSIONS.has(extension ?? "")
  );
}
