import type { PracticeAsset } from "../types/practice-library.ts";
import { deletePracticeAsset, getPracticeAsset, savePracticeAsset } from "./practice-library.ts";
import {
  deleteCloudPracticeAsset,
  getCloudPracticeAsset,
  saveCloudPracticeAsset,
} from "./supabase/practice-files.ts";

/**
 * Material del usuario: se intenta la nube primero y, si no está disponible o
 * el archivo aún vive solo en este dispositivo, se usa la copia local.
 */
export async function getPracticeAssetForUser(
  assetId: string,
  userId?: string,
): Promise<PracticeAsset | undefined> {
  if (userId) {
    try {
      const cloudAsset = await getCloudPracticeAsset(userId, assetId);
      if (cloudAsset) return cloudAsset;
    } catch (error) {
      console.warn(
        "No se pudo cargar el material de la nube; se usa la copia local.",
        error,
      );
    }
  }

  return getPracticeAsset(assetId);
}

/**
 * Guarda siempre la copia local y, si hay cuenta, también la remota. Si la
 * subida falla, el archivo local ya está a salvo y el error se propaga para
 * poder avisar sin deshacer el resto del formulario.
 */
export async function savePracticeAssetForUser(
  asset: PracticeAsset,
  userId?: string,
): Promise<void> {
  await savePracticeAsset(asset);
  if (!userId) return;
  await saveCloudPracticeAsset(userId, asset);
}

/**
 * Borra el archivo del dispositivo y, si hay cuenta, de la nube. Un fallo
 * remoto no impide limpiar la copia local ni seguir con el borrado de la foto.
 */
export async function deletePracticeAssetForUser(
  assetId: string,
  userId?: string,
): Promise<void> {
  if (userId) {
    try {
      await deleteCloudPracticeAsset(userId, assetId);
    } catch (error) {
      console.warn(
        "No se pudo borrar el archivo de la nube; se borra la copia local.",
        error,
      );
    }
  }

  await deletePracticeAsset(assetId);
}
