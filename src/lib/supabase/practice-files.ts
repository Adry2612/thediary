import type {
  PracticeAsset,
  PracticeAudioRecording,
} from "@/lib/practice-library";
import {
  listPracticeAssets,
  listPracticeRecordings,
} from "@/lib/practice-library";
import { getSupabaseClient } from "./client";

const STORAGE_BUCKET = "practice-files";
const STORAGE_PAGE_SIZE = 1000;
const STORAGE_DELETE_BATCH_SIZE = 100;

interface RecordingRow {
  id: string;
  storage_path: string;
  title: string;
  session_name: string;
  session_id: string | null;
  practice_date: string | null;
  phase_id: string | null;
  phase_order: number | null;
  phase_name: string | null;
  practice_skill: PracticeAudioRecording["practiceSkill"] | null;
  created_at: string;
  duration_seconds: number | null;
  mime_type: string;
}

interface AssetRow {
  id: string;
  storage_path: string;
  file_name: string;
  kind: PracticeAsset["kind"];
  mime_type: string;
}

function getFileExtension(fileName: string, mimeType: string): string {
  const lastDot = fileName.lastIndexOf(".");
  const extension =
    lastDot >= 0 ? fileName.slice(lastDot + 1).toLowerCase() : "";
  if (extension) return extension;
  if (mimeType === "audio/mp4") return "mp4";
  if (mimeType === "audio/ogg") return "ogg";
  if (mimeType === "audio/mpeg") return "mp3";
  if (mimeType === "audio/wav" || mimeType === "audio/x-wav") return "wav";
  if (mimeType === "application/pdf") return "pdf";
  return "webm";
}

function throwSupabaseError(message: string, error: { message: string }) {
  throw new Error(`${message}: ${error.message}`);
}

async function listUserStoragePaths(
  userId: string,
  category: "recordings" | "assets",
): Promise<string[]> {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase no está configurado.");

  const paths: string[] = [];
  const storage = client.storage.from(STORAGE_BUCKET);
  let offset = 0;

  while (true) {
    const { data, error } = await storage.list(`${userId}/${category}`, {
      limit: STORAGE_PAGE_SIZE,
      offset,
    });
    if (error) throwSupabaseError("No se pudieron localizar tus archivos", error);

    const files = (data ?? []).filter((item) => item.id !== null);
    paths.push(
      ...files.map((file) => `${userId}/${category}/${file.name}`),
    );
    if ((data?.length ?? 0) < STORAGE_PAGE_SIZE) return paths;
    offset += STORAGE_PAGE_SIZE;
  }
}

export async function deleteAllCloudPracticeFiles(userId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase no está configurado.");

  const paths = [
    ...(await listUserStoragePaths(userId, "recordings")),
    ...(await listUserStoragePaths(userId, "assets")),
  ];
  const storage = client.storage.from(STORAGE_BUCKET);

  for (let index = 0; index < paths.length; index += STORAGE_DELETE_BATCH_SIZE) {
    const { error } = await storage.remove(
      paths.slice(index, index + STORAGE_DELETE_BATCH_SIZE),
    );
    if (error) throwSupabaseError("No se pudieron borrar tus archivos", error);
  }

  const { error: recordingsError } = await client
    .from("practice_recordings")
    .delete()
    .eq("user_id", userId);
  if (recordingsError) {
    throwSupabaseError("No se pudieron borrar los datos de tus grabaciones", recordingsError);
  }

  const { error: assetsError } = await client
    .from("practice_assets")
    .delete()
    .eq("user_id", userId);
  if (assetsError) {
    throwSupabaseError("No se pudieron borrar los datos de tus archivos", assetsError);
  }
}

async function uploadFile(
  userId: string,
  category: "recordings" | "assets",
  id: string,
  fileName: string,
  blob: Blob,
): Promise<string> {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase no está configurado.");

  const extension = getFileExtension(fileName, blob.type);
  const path = `${userId}/${category}/${id}.${extension}`;
  const { error } = await client.storage.from(STORAGE_BUCKET).upload(path, blob, {
    contentType:
      blob.type.split(";")[0]?.trim() || "application/octet-stream",
    upsert: true,
  });
  if (error) throwSupabaseError("No se pudo subir el archivo", error);
  return path;
}

async function getSignedUrl(path: string): Promise<string> {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase no está configurado.");

  const { data, error } = await client.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(path, 60 * 60);
  if (error) throwSupabaseError("No se pudo crear el enlace temporal", error);
  if (!data) throw new Error("Supabase no devolvió un enlace de audio.");
  return data.signedUrl;
}

export async function saveCloudPracticeAsset(
  userId: string,
  asset: PracticeAsset,
): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase no está configurado.");

  const storagePath = await uploadFile(
    userId,
    "assets",
    asset.id,
    asset.fileName,
    asset.blob,
  );
  const { error } = await client.from("practice_assets").upsert(
    {
      id: asset.id,
      user_id: userId,
      storage_path: storagePath,
      file_name: asset.fileName,
      kind: asset.kind,
      mime_type: asset.blob.type || "application/octet-stream",
    },
    { onConflict: "id" },
  );
  if (error) throwSupabaseError("No se pudo guardar el material", error);
}

export async function getCloudPracticeAsset(
  userId: string,
  assetId: string,
): Promise<PracticeAsset | undefined> {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase no está configurado.");

  const { data, error } = await client
    .from("practice_assets")
    .select("storage_path,file_name,kind")
    .eq("user_id", userId)
    .eq("id", assetId)
    .maybeSingle();
  if (error) throwSupabaseError("No se pudo cargar el material", error);
  if (!data) return undefined;

  const row = data as unknown as Pick<AssetRow, "storage_path" | "file_name" | "kind">;
  const { data: blob, error: downloadError } = await client.storage
    .from(STORAGE_BUCKET)
    .download(row.storage_path);
  if (downloadError) {
    throwSupabaseError("No se pudo descargar el material", downloadError);
  }
  if (!blob) throw new Error("Supabase no devolvió el archivo solicitado.");
  return {
    id: assetId,
    fileName: row.file_name,
    kind: row.kind,
    blob,
  };
}

export async function saveCloudPracticeRecording(
  userId: string,
  recording: PracticeAudioRecording,
): Promise<void> {
  if (!recording.blob) {
    throw new Error("No se encontró el archivo de esta grabación.");
  }

  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase no está configurado.");

  const storagePath = await uploadFile(
    userId,
    "recordings",
    recording.id,
    `${recording.id}.${getFileExtension(recording.id, recording.mimeType)}`,
    recording.blob,
  );
  const { error } = await client.from("practice_recordings").upsert(
    {
      id: recording.id,
      user_id: userId,
      storage_path: storagePath,
      title: recording.title,
      session_name: recording.sessionName,
      session_id: recording.sessionId ?? null,
      practice_date: recording.practiceDate ?? null,
      phase_id:
        recording.phaseId === undefined ? null : String(recording.phaseId),
      phase_order: recording.phaseOrder ?? null,
      phase_name: recording.phaseName ?? null,
      practice_skill: recording.practiceSkill ?? null,
      created_at: recording.createdAt,
      duration_seconds: recording.durationSeconds ?? null,
      mime_type: recording.mimeType,
    },
    { onConflict: "id" },
  );
  if (error) throwSupabaseError("No se pudo guardar la grabación", error);
}

export async function listCloudPracticeRecordings(
  userId: string,
): Promise<PracticeAudioRecording[]> {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase no está configurado.");

  const { data, error } = await client
    .from("practice_recordings")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throwSupabaseError("No se pudieron cargar las grabaciones", error);

  return Promise.all(
    ((data ?? []) as unknown as RecordingRow[]).map(async (row) => ({
      id: row.id,
      title: row.title,
      sessionName: row.session_name,
      sessionId: row.session_id ?? undefined,
      practiceDate: row.practice_date ?? undefined,
      phaseId: row.phase_id ?? undefined,
      phaseOrder: row.phase_order ?? undefined,
      phaseName: row.phase_name ?? undefined,
      practiceSkill: row.practice_skill ?? undefined,
      createdAt: row.created_at,
      durationSeconds: row.duration_seconds ?? undefined,
      mimeType: row.mime_type,
      playbackUrl: await getSignedUrl(row.storage_path),
    })),
  );
}

export async function deleteCloudPracticeRecording(
  userId: string,
  recordingId: string,
): Promise<void> {
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase no está configurado.");

  const { data, error } = await client
    .from("practice_recordings")
    .select("storage_path")
    .eq("user_id", userId)
    .eq("id", recordingId)
    .maybeSingle();
  if (error) throwSupabaseError("No se pudo localizar la grabación", error);
  if (!data) return;

  const row = data as unknown as Pick<RecordingRow, "storage_path">;
  const { error: storageError } = await client.storage
    .from(STORAGE_BUCKET)
    .remove([row.storage_path]);
  if (storageError) {
    throwSupabaseError("No se pudo borrar el archivo de audio", storageError);
  }

  const { error: rowError } = await client
    .from("practice_recordings")
    .delete()
    .eq("user_id", userId)
    .eq("id", recordingId);
  if (rowError) {
    throwSupabaseError("Se borró el audio, pero no su registro", rowError);
  }
}

export async function importCloudPracticeAsset(
  userId: string,
  asset: PracticeAsset,
): Promise<void> {
  await saveCloudPracticeAsset(userId, asset);
}

export async function importCloudPracticeRecording(
  userId: string,
  recording: PracticeAudioRecording,
): Promise<void> {
  await saveCloudPracticeRecording(userId, recording);
}

export async function importLocalPracticeFiles(
  userId: string,
): Promise<{ assets: number; recordings: number }> {
  const [assets, recordings] = await Promise.all([
    listPracticeAssets(),
    listPracticeRecordings(),
  ]);
  for (const asset of assets) {
    await importCloudPracticeAsset(userId, asset);
  }
  for (const recording of recordings) {
    await importCloudPracticeRecording(userId, recording);
  }
  return { assets: assets.length, recordings: recordings.length };
}
