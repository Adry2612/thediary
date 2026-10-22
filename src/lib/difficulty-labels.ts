import type { RepertoireDifficulty } from "@/types/practice";

/** Clave del diccionario con el nombre de cada dificultad. */
export const DIFFICULTY_LABEL_KEYS: Record<RepertoireDifficulty, string> = {
  beginner: "difficultyBeginner",
  intermediate: "difficultyIntermediate",
  advanced: "difficultyAdvanced",
};

/** Nombre de la dificultad en el idioma activo. */
export function getDifficultyLabel(
  text: Record<string, string>,
  difficulty: RepertoireDifficulty | undefined,
): string {
  if (!difficulty) return text.difficultyNone ?? "";
  return text[DIFFICULTY_LABEL_KEYS[difficulty]] ?? difficulty;
}
