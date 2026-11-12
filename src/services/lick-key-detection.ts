import type { MusicalKey } from "../types/lick.ts";
import {
  estimateKey,
  extractPitchesFromScore,
} from "../utils/licks/key-detection.ts";
import { getPracticeAssetForUser } from "./practice-asset.ts";

/**
 * Lee un archivo Guitar Pro y estima su tonalidad a partir de las notas.
 * Devuelve `null` cuando el archivo no se puede leer o no hay notas
 * suficientes para no adivinar.
 */
export async function detectGuitarProKey(
  assetId: string,
  userId?: string,
): Promise<MusicalKey | null> {
  const asset = await getPracticeAssetForUser(assetId, userId);
  if (!asset) return null;

  const alphaTab = await import("@coderline/alphatab");
  const score = alphaTab.importer.ScoreLoader.loadScoreFromBytes(
    new Uint8Array(await asset.blob.arrayBuffer()),
  );

  for (let index = 0; index < score.tracks.length; index += 1) {
    if (score.tracks[index].isPercussion) continue;
    const key = estimateKey(extractPitchesFromScore(score, index));
    if (key) return key;
  }

  return null;
}
