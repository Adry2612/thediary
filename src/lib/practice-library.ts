import type { PracticeResourceKind, PracticeSkill } from "@/types/practice";

const DATABASE_NAME = "guitar-practice-library";
const DATABASE_VERSION = 1;
const ASSETS_STORE = "assets";
const RECORDINGS_STORE = "recordings";
let databasePromise: Promise<IDBDatabase> | null = null;

export interface PracticeAsset {
  id: string;
  fileName: string;
  kind: Exclude<PracticeResourceKind, "songsterr">;
  blob: Blob;
}

export interface PracticeAudioRecording {
  id: string;
  title: string;
  sessionName: string;
  sessionId?: string;
  practiceDate?: string;
  phaseId?: string | number;
  phaseOrder?: number;
  phaseName?: string;
  practiceSkill?: PracticeSkill;
  createdAt: string;
  durationSeconds?: number;
  mimeType: string;
  blob?: Blob;
  playbackUrl?: string;
}

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(
      new Error("Este navegador no admite el almacenamiento local de archivos."),
    );
  }

  if (databasePromise) return databasePromise;
  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(ASSETS_STORE)) {
        database.createObjectStore(ASSETS_STORE, { keyPath: "id" });
      }
      if (!database.objectStoreNames.contains(RECORDINGS_STORE)) {
        database.createObjectStore(RECORDINGS_STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => {
      request.result.onversionchange = () => {
        request.result.close();
        databasePromise = null;
      };
      resolve(request.result);
    };
    request.onerror = () => {
      databasePromise = null;
      reject(request.error ?? new Error("No se pudo abrir la biblioteca local."));
    };
    request.onblocked = () => {
      databasePromise = null;
      reject(new Error("Cierra otras pestañas de la app y vuelve a intentarlo."));
    };
  });
  return databasePromise;
}

async function runRequest<T>(
  storeName: string,
  mode: IDBTransactionMode,
  createRequest: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, mode);
    const request = createRequest(transaction.objectStore(storeName));
    let result: T;
    request.onsuccess = () => {
      result = request.result;
    };
    transaction.oncomplete = () => resolve(result);
    request.onerror = () =>
      reject(request.error ?? new Error("No se pudo acceder a la biblioteca."));
    transaction.onabort = () =>
      reject(transaction.error ?? new Error("La operación de biblioteca se canceló."));
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("Falló la operación de biblioteca."));
  });
}

export function savePracticeAsset(asset: PracticeAsset): Promise<IDBValidKey> {
  return runRequest(ASSETS_STORE, "readwrite", (store) => store.put(asset));
}

export function getPracticeAsset(
  assetId: string,
): Promise<PracticeAsset | undefined> {
  return runRequest(ASSETS_STORE, "readonly", (store) => store.get(assetId));
}

export function listPracticeAssets(): Promise<PracticeAsset[]> {
  return runRequest(ASSETS_STORE, "readonly", (store) => store.getAll());
}

export async function clearLocalPracticeLibrary(): Promise<void> {
  await Promise.all([
    runRequest(ASSETS_STORE, "readwrite", (store) => store.clear()),
    runRequest(RECORDINGS_STORE, "readwrite", (store) => store.clear()),
  ]);
}

export function savePracticeRecording(
  recording: PracticeAudioRecording,
): Promise<IDBValidKey> {
  return runRequest(RECORDINGS_STORE, "readwrite", (store) =>
    store.put(recording),
  );
}

export function listPracticeRecordings(): Promise<PracticeAudioRecording[]> {
  return runRequest(RECORDINGS_STORE, "readonly", (store) => store.getAll());
}

export function deletePracticeRecording(recordingId: string): Promise<undefined> {
  return runRequest(RECORDINGS_STORE, "readwrite", (store) =>
    store.delete(recordingId),
  );
}
