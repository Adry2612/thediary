import type { RepertoireItem, RepertoireItemKind, GuitarType } from "../types/practice";

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
  youtubeUrl?: string;
  spotifyUrl?: string;
  isFutureLearn?: boolean;
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
  youtubeUrl,
  spotifyUrl,
  isFutureLearn,
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
    ...(youtubeUrl?.trim() ? { youtubeUrl: youtubeUrl.trim() } : {}),
    ...(spotifyUrl?.trim() ? { spotifyUrl: spotifyUrl.trim() } : {}),
    ...(isFutureLearn ? { isFutureLearn: true } : {}),
  };
}
