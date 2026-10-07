const PRACTICE_SKILLS = new Set([
  "technique",
  "theory",
  "repertoire",
  "improvisation",
]);

export type PracticePlanPhase = {
  id: number | string;
  name: string;
  durationMinutes: number;
  skill: string;
};

export type PracticeTemplateValidationError = "name" | "phases" | "phase";

export function validatePracticeTemplate(
  name: string,
  phases: PracticePlanPhase[],
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
): "guitarpro" | "pdf" | null {
  const extension = fileName.split(".").at(-1)?.toLowerCase();
  if (extension === "pdf") return "pdf";
  if (["gp", "gpx", "gp3", "gp4", "gp5"].includes(extension ?? "")) {
    return "guitarpro";
  }
  return null;
}
