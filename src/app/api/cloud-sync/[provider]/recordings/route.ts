import { NextResponse } from "next/server";
import { GoogleDriveAdapter } from "@/services/cloud-sync/google-drive";
import { OneDriveAdapter } from "@/services/cloud-sync/onedrive";
import { readCloudTokenSession } from "@/services/cloud-sync/session";
import { isCloudSyncProvider } from "@/services/cloud-sync/oauth";
import { normalizeCloudProviderError } from "@/services/cloud-sync/provider";

export async function GET(
  request: Request,
  context: { params: Promise<{ provider: string }> },
) {
  const { provider } = await context.params;
  if (!isCloudSyncProvider(provider)) return NextResponse.json({ error: "Proveedor no válido." }, { status: 400 });
  const session = readCloudTokenSession(request.headers.get("cookie"), provider);
  if (!session) return NextResponse.json({ recordings: [] });
  try {
    const adapter = provider === "google-drive"
      ? new GoogleDriveAdapter(session.accessToken)
      : new OneDriveAdapter(session.accessToken);
    return NextResponse.json({ recordings: await adapter.listManagedRecordings() });
  } catch (error) {
    const normalized = normalizeCloudProviderError(error);
    return NextResponse.json({ error: normalized.message, code: normalized.code }, { status: 502 });
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ provider: string }> },
) {
  const { provider } = await context.params;
  if (!isCloudSyncProvider(provider)) return NextResponse.json({ error: "Proveedor no válido." }, { status: 400 });
  const session = readCloudTokenSession(request.headers.get("cookie"), provider);
  if (!session) return NextResponse.json({ error: "Inicia sesión con el proveedor." }, { status: 401 });
  const form = await request.formData();
  const audio = form.get("audio");
  const recordingValue = form.get("recording");
  if (!(audio instanceof File) || typeof recordingValue !== "string") {
    return NextResponse.json({ error: "Faltan los datos de la grabación." }, { status: 400 });
  }
  try {
    const recording = JSON.parse(recordingValue);
    const adapter = provider === "google-drive"
      ? new GoogleDriveAdapter(session.accessToken)
      : new OneDriveAdapter(session.accessToken);
    const result = await adapter.uploadRecording({
      recording,
      blob: audio,
      existingRemoteFileId: recording.cloudSync?.[provider]?.remoteFileId,
      existingRemoteManifestId: recording.cloudSync?.[provider]?.remoteManifestId,
    });
    return NextResponse.json(result);
  } catch (error) {
    const normalized = normalizeCloudProviderError(error);
    return NextResponse.json({ error: normalized.message, code: normalized.code }, { status: 502 });
  }
}
