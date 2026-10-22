import type {
  GuitarType,
  RepertoireDifficulty,
  RepertoireItem,
  RepertoirePart,
} from "@/types/practice";

interface RepertoireBpmParseResult {
  isValid: boolean;
  value: number | null;
}

export function parseRepertoireBpm(value: string): RepertoireBpmParseResult {
  const normalizedValue = value.trim();
  if (!normalizedValue) return { isValid: true, value: null };

  const parsedValue = Number(normalizedValue);
  if (
    !Number.isInteger(parsedValue) ||
    parsedValue < 0 ||
    parsedValue > 400
  ) {
    return { isValid: false, value: null };
  }

  return { isValid: true, value: parsedValue };
}

export function createRepertoirePart(
  id: string,
  sequenceNumber: number,
): RepertoirePart {
  return {
    id,
    name: `Parte ${sequenceNumber}`,
    learned: false,
    masteredBpm: null,
    targetBpm: null,
  };
}

export function updateRepertoirePart(
  item: RepertoireItem,
  partId: string,
  changes: Partial<RepertoirePart>,
  updatedAt: string,
): RepertoireItem {
  return {
    ...item,
    parts: item.parts.map((part) =>
      part.id === partId ? { ...part, ...changes } : part,
    ),
    updatedAt,
  };
}

/**
 * Valores que el editor de repertorio deja ajustar fuera de las partes. Las
 * afinaciones y el capo llegan como texto porque vienen de campos de
 * formulario.
 */
export interface RepertoireExtraConfigDraft {
  tuning: string;
  customTuning: string;
  capo: string;
  guitarType: GuitarType | "";
  difficulty: RepertoireDifficulty | "";
  youtubeUrl: string;
  spotifyUrl: string;
  isFutureLearn: boolean;
}

/** Capo admitido: del 0 (sin cejilla) al 12. */
const MAX_CAPO = 12;

/**
 * Cambios que hay que aplicar al elemento con la configuración extra que el
 * usuario acaba de dejar (`draft`).
 *
 * Devuelve solo lo que cambia, más la marca de tiempo, o `null` si el capo no
 * es un número entre 0 y 12: en ese caso no hay nada que guardar y el editor
 * deja el formulario como está. Cuando no cambia nada, el resultado es la marca
 * de tiempo sola.
 */
export function buildRepertoireExtraConfigUpdates(
  draft: RepertoireExtraConfigDraft,
  current: RepertoireItem,
  updatedAt: string,
): Partial<RepertoireItem> | null {
  const finalTuning =
    draft.tuning === "Otra..."
      ? draft.customTuning.trim()
      : draft.tuning.trim();
  const capoNumber = draft.capo.trim() ? Number(draft.capo) : undefined;

  if (
    capoNumber !== undefined &&
    (isNaN(capoNumber) || capoNumber < 0 || capoNumber > MAX_CAPO)
  ) {
    return null;
  }

  const updates: Partial<RepertoireItem> = { updatedAt };

  if (finalTuning !== (current.tuning ?? ""))
    updates.tuning = finalTuning || undefined;
  if (capoNumber !== current.capo) updates.capo = capoNumber;
  if (draft.guitarType !== (current.guitarType ?? ""))
    updates.guitarType = draft.guitarType || undefined;
  if (draft.difficulty !== (current.difficulty ?? ""))
    updates.difficulty = draft.difficulty || undefined;
  if (draft.youtubeUrl.trim() !== (current.youtubeUrl ?? ""))
    updates.youtubeUrl = draft.youtubeUrl.trim() || undefined;
  if (draft.spotifyUrl.trim() !== (current.spotifyUrl ?? ""))
    updates.spotifyUrl = draft.spotifyUrl.trim() || undefined;
  if (draft.isFutureLearn !== (current.isFutureLearn ?? false))
    updates.isFutureLearn = draft.isFutureLearn || undefined;

  return updates;
}

/** Si los cambios guardan algo además de la marca de tiempo. */
export function hasRepertoireExtraConfigChanges(
  updates: Partial<RepertoireItem>,
): boolean {
  return Object.keys(updates).length > 1;
}
