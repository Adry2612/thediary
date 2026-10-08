import type { RepertoireItem, RepertoireItemKind } from "../types/practice";

interface CreateRepertoireItemInput {
  id: string;
  initialPartId: string;
  kind: RepertoireItemKind;
  title: string;
  artist: string;
  guitarPro?: RepertoireItem["guitarPro"];
  updatedAt: string;
}

export function createRepertoireItem({
  id,
  initialPartId,
  kind,
  title,
  artist,
  guitarPro,
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
    updatedAt,
  };
}
