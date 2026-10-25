import type {
  GuitarType,
  RepertoireDifficulty,
  RepertoireItem,
  RepertoirePart,
} from "../types/practice.ts";
import { normalizeCatalogMetadata } from "./repertoire-catalog.ts";

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
  album?: string;
  releaseYear?: string;
  coverUrl?: string;
}

/** Capo admitido: del 0 (sin cejilla) al 12. */
const MAX_CAPO = 12;

interface RepertoireCapoParseResult {
  isValid: boolean;
  value: number | undefined;
}

/** Lee el capo de un campo de texto; vacío significa «sin cejilla». */
export function parseRepertoireCapo(value: string): RepertoireCapoParseResult {
  const capoNumber = value.trim() ? Number(value) : undefined;

  if (
    capoNumber !== undefined &&
    (isNaN(capoNumber) || capoNumber < 0 || capoNumber > MAX_CAPO)
  ) {
    return { isValid: false, value: undefined };
  }

  return { isValid: true, value: capoNumber };
}

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
  const parsedCapo = parseRepertoireCapo(draft.capo);

  if (!parsedCapo.isValid) {
    return null;
  }

  const capoNumber = parsedCapo.value;

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

  const metadata = normalizeCatalogMetadata({
    album: draft.album ?? "",
    releaseYear:
      draft.releaseYear?.trim() ? Number(draft.releaseYear) : undefined,
    coverUrl: draft.coverUrl ?? "",
  });

  if (draft.album !== undefined && (metadata.album ?? "") !== (current.album ?? ""))
    updates.album = metadata.album;
  if (draft.releaseYear !== undefined && metadata.releaseYear !== current.releaseYear)
    updates.releaseYear = metadata.releaseYear;
  if (draft.coverUrl !== undefined && (metadata.coverUrl ?? "") !== (current.coverUrl ?? ""))
    updates.coverUrl = metadata.coverUrl;

  return updates;
}

/** Si los cambios guardan algo además de la marca de tiempo. */
export function hasRepertoireExtraConfigChanges(
  updates: Partial<RepertoireItem>,
): boolean {
  return Object.keys(updates).length > 1;
}

/** Título y artista tal como los deja el usuario en el editor en línea. */
export interface RepertoireDetailsDraft {
  title: string;
  artist: string;
}

/**
 * Qué hacer con el título y el artista que el usuario acaba de editar: un
 * título vacío se revierte, un par sin cambios no se guarda y el resto se
 * escribe recortado, dejando el artista sin definir cuando queda vacío.
 */
export type RepertoireDetailsUpdate =
  | { kind: "empty-title" }
  | { kind: "unchanged" }
  | {
      kind: "save";
      updates: Pick<RepertoireItem, "title" | "artist" | "updatedAt">;
    };

export function buildRepertoireDetailsUpdate(
  draft: RepertoireDetailsDraft,
  current: RepertoireItem,
  updatedAt: string,
): RepertoireDetailsUpdate {
  const title = draft.title.trim();
  const artist = draft.artist.trim();

  if (!title) return { kind: "empty-title" };
  if (title === current.title && artist === (current.artist ?? "")) {
    return { kind: "unchanged" };
  }

  return {
    kind: "save",
    updates: { title, artist: artist || undefined, updatedAt },
  };
}
