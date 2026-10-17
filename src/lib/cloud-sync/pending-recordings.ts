import type { PracticeAudioRecording } from "../practice-library.ts";

/**
 * Devuelve las grabaciones locales que todavía no están en el proveedor.
 *
 * El catálogo remoto manda: una grabación se considera pendiente solo si tiene
 * audio local legible y su identificador no aparece entre las ya presentes en
 * el proveedor conectado. Así no hace falta un estado de sincronización local
 * persistente, evitando re-subidas y duplicados.
 */
export function getPendingRecordings(
  localRecordings: readonly PracticeAudioRecording[],
  remoteRecordingIds: ReadonlySet<string>,
): PracticeAudioRecording[] {
  return localRecordings.filter(
    (recording) =>
      Boolean(recording.blob && recording.blob.size > 0) &&
      !remoteRecordingIds.has(recording.id),
  );
}
