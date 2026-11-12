import type { RepertoireItem, RepertoireItemKind, GuitarType, RepertoireDifficulty } from "../types/practice.ts";
import type { CatalogSource } from "../types/catalog.ts";
import { normalizeCatalogMetadata } from "./repertoire-catalog.ts";
import { getCommonTuningValues } from "./catalogs/tunings.ts";
import { normalizePracticeResources } from "./practice-resources.ts";

/**
 * Afinaciones que ofrecen los formularios de repertorio. La última opción no es
 * una afinación: abre el campo para escribir una propia.
 */
export const COMMON_TUNINGS = getCommonTuningValues();

/** Dificultades admitidas, de la más suave a la más exigente. */
export const REPERTOIRE_DIFFICULTIES: RepertoireDifficulty[] = [
  "beginner",
  "intermediate",
  "advanced",
];

export function isRepertoireDifficulty(
  value: unknown,
): value is RepertoireDifficulty {
  return (
    typeof value === "string" &&
    REPERTOIRE_DIFFICULTIES.some((difficulty) => difficulty === value)
  );
}

/** Devuelve la dificultad solo si es una de las admitidas. */
export function normalizeRepertoireDifficulty(
  value: unknown,
): RepertoireDifficulty | undefined {
  return isRepertoireDifficulty(value) ? value : undefined;
}

/**
 * Descarta los campos de tablatura retirados y los materiales que ya no son
 * válidos, sin tocar el resto de la ficha.
 */
export function normalizeRepertoireItemResources(
  item: RepertoireItem,
): RepertoireItem {
  const {
    resources: storedResources,
    score: _discardedScore,
    tab: _discardedTab,
    ...rest
  } = item as RepertoireItem & { score?: unknown; tab?: unknown };
  const resources = normalizePracticeResources(storedResources);
  return {
    ...rest,
    ...(resources.length > 0 ? { resources } : {}),
  };
}

interface CreateRepertoireItemInput {
  id: string;
  initialPartId: string;
  kind: RepertoireItemKind;
  title: string;
  artist: string;
  guitarPro?: RepertoireItem["guitarPro"];
  resources?: RepertoireItem["resources"];
  tuning?: string;
  capo?: number;
  guitarType?: GuitarType;
  difficulty?: RepertoireDifficulty;
  youtubeUrl?: string;
  spotifyUrl?: string;
  album?: string;
  releaseYear?: number;
  coverUrl?: string;
  catalogSource?: CatalogSource;
  catalogId?: string;
  isFutureLearn?: boolean;
  chordChart?: RepertoireItem["chordChart"];
  updatedAt: string;
}

export function createRepertoireItem({
  id,
  initialPartId,
  kind,
  title,
  artist,
  guitarPro,
  resources,
  tuning,
  capo,
  guitarType,
  difficulty,
  youtubeUrl,
  spotifyUrl,
  album,
  releaseYear,
  coverUrl,
  catalogSource,
  catalogId,
  isFutureLearn,
  chordChart,
  updatedAt,
}: CreateRepertoireItemInput): RepertoireItem {
  const catalogMetadata = normalizeCatalogMetadata({
    album,
    releaseYear,
    coverUrl,
    catalogSource,
    catalogId,
  });

  return {
    id,
    kind,
    title: title.trim(),
    ...(kind === "song" && artist.trim()
      ? { artist: artist.trim() }
      : {}),
    parts: [
      {
        id: initialPartId,
        name: kind === "song" ? "Canción completa" : "Lick principal",
        learned: false,
        masteredBpm: null,
        targetBpm: null,
      },
    ],
    guitarPro,
    ...(resources?.length ? { resources } : {}),
    updatedAt,
    ...(tuning?.trim() ? { tuning: tuning.trim() } : {}),
    ...(capo !== undefined && capo > 0 && capo <= 12 ? { capo } : {}),
    ...(guitarType ? { guitarType } : {}),
    ...(difficulty ? { difficulty } : {}),
    ...(youtubeUrl?.trim() ? { youtubeUrl: youtubeUrl.trim() } : {}),
    ...(spotifyUrl?.trim() ? { spotifyUrl: spotifyUrl.trim() } : {}),
    ...catalogMetadata,
    ...(isFutureLearn ? { isFutureLearn: true } : {}),
    ...(chordChart ? { chordChart } : {}),
  };
}
