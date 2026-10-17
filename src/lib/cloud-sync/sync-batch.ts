import type { PracticeAudioRecording } from "../practice-library.ts";
import { getPendingRecordings } from "./pending-recordings.ts";

export interface SyncBatchResult {
  /** Grabaciones locales que aún no estaban en el proveedor. */
  pending: number;
  uploaded: number;
  errors: string[];
}

export interface SyncBatchDependencies {
  listRemoteIds: () => Promise<ReadonlySet<string>>;
  listLocal: () => Promise<PracticeAudioRecording[]>;
  upload: (recording: PracticeAudioRecording) => Promise<unknown>;
  isAuthorizationError?: (error: unknown) => boolean;
}

/**
 * Sube al proveedor las grabaciones locales que aún no están en su catálogo.
 *
 * Es de mejor esfuerzo: un fallo individual no detiene el lote, pero un error
 * de autorización sí, porque repetirlo solo produciría fallos idénticos. Nunca
 * se pierde ni se modifica la copia local.
 */
export async function syncPendingRecordings({
  listRemoteIds,
  listLocal,
  upload,
  isAuthorizationError,
}: SyncBatchDependencies): Promise<SyncBatchResult> {
  const remoteIds = await listRemoteIds();
  const localRecordings = await listLocal();
  const targets = getPendingRecordings(localRecordings, remoteIds);

  let uploaded = 0;
  const errors: string[] = [];
  for (const recording of targets) {
    try {
      await upload(recording);
      uploaded += 1;
    } catch (error) {
      errors.push(
        error instanceof Error
          ? error.message
          : "No se pudo sincronizar la grabación.",
      );
      if (isAuthorizationError?.(error)) break;
    }
  }

  return { pending: targets.length, uploaded, errors };
}
