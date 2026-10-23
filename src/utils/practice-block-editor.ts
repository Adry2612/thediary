import type { GuitarLick } from "../types/lick.ts";
import type {
  PracticePhase,
  PracticeSkill,
  RepertoireItem,
} from "../types/practice.ts";

export interface PracticeBlockOption {
  value: string;
  label: string;
}

/**
 * Nombres que puede elegir un bloque de técnica: el catálogo predefinido y, si
 * una rutina antigua guardó un nombre fuera del catálogo, ese nombre para que
 * no se pierda al editarla.
 */
export function getTechniqueNames(
  catalogLabels: readonly string[],
  currentName: string,
): string[] {
  const names = [...catalogLabels];
  const customName = currentName.trim();
  if (customName && !names.includes(customName)) names.push(customName);

  return names;
}

/** Partes de la canción elegida; el bloque puede no elegir ninguna. */
export function getRepertoirePartOptions(
  song: RepertoireItem | undefined,
  placeholder: string,
  missingId?: string,
  missingLabel = "",
): PracticeBlockOption[] {
  const options: PracticeBlockOption[] = [
    { value: "", label: placeholder },
    ...(song?.parts ?? []).map((part) => ({
      value: part.id,
      label: part.name,
    })),
  ];

  if (
    missingId &&
    !(song?.parts ?? []).some((part) => part.id === missingId)
  ) {
    options.push({ value: missingId, label: missingLabel });
  }

  return options;
}

/** Licks que puede elegir un bloque de lick. */
export function getLickOptions(
  licks: readonly GuitarLick[],
  placeholder: string,
  missingId?: string,
  missingLabel = "",
): PracticeBlockOption[] {
  const options: PracticeBlockOption[] = [
    { value: "", label: placeholder },
    ...licks.map((lick) => ({ value: lick.id, label: lick.title })),
  ];

  if (missingId && !licks.some((lick) => lick.id === missingId)) {
    options.push({ value: missingId, label: missingLabel });
  }

  return options;
}

/**
 * Datos que cambian en un bloque de repertorio al elegir una canción. El nombre
 * no es editable: siempre pasa a ser el título de la canción.
 */
export function getRepertoireSongChanges(
  song: Pick<RepertoireItem, "id" | "title">,
): Pick<
  PracticePhase,
  "name" | "repertoireItemId" | "repertoirePartId"
> {
  return {
    name: song.title,
    repertoireItemId: song.id,
    repertoirePartId: undefined,
  };
}

/**
 * Cambia la categoría del bloque y elimina los vínculos que dejan de tener
 * sentido. El nombre se conserva tal cual: si el usuario lo personalizó, no se
 * pisa al cambiar de categoría.
 */
export function applySkillChange(
  phase: PracticePhase,
  skill: PracticeSkill,
): PracticePhase {
  const next: PracticePhase = { ...phase, skill };

  if (skill !== "repertoire") {
    next.repertoireItemId = undefined;
    next.repertoirePartId = undefined;
  }
  if (skill !== "lick") {
    next.lickId = undefined;
  }

  return next;
}

/**
 * El nombre del bloque adopta el del elemento vinculado solo cuando está vacío
 * o seguía siendo el título del elemento anterior. Un nombre propio se respeta.
 */
export function shouldAdoptLinkedTitle(
  currentName: string,
  previousTitle: string | undefined,
): boolean {
  const name = currentName.trim();
  return !name || name === previousTitle;
}
