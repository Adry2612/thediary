import type { RepertoireItem, RepertoireItemKind, GuitarType, RepertoireDifficulty } from "../types/practice";

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
  isFutureLearn?: boolean;
  chordChart?: RepertoireItem["chordChart"];
  tab?: RepertoireItem["tab"];
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
  isFutureLearn,
  chordChart,
  tab,
  updatedAt,
}: CreateRepertoireItemInput): RepertoireItem {
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
    ...(isFutureLearn ? { isFutureLearn: true } : {}),
    ...(chordChart ? { chordChart } : {}),
    ...(tab ? { tab } : {}),
  };
}
