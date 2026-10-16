import { NextResponse } from "next/server";
import { GoogleDriveAdapter } from "@/lib/cloud-sync/google-drive";
import { OneDriveAdapter } from "@/lib/cloud-sync/onedrive";
import { readCloudTokenSession } from "@/lib/cloud-sync/session";
import { isCloudSyncProvider } from "@/lib/cloud-sync/oauth";
import {
  normalizeCloudProviderError,
  type CloudProviderAdapter,
} from "@/lib/cloud-sync/provider";

/**
 * Sirve el audio de una grabación gestionada en la nube. Los archivos de Google
 * Drive solo son visibles con el token de la app, que vive en el servidor, así
 * que el navegador no puede pedirlos directamente: este endpoint los reenvía y
 * respeta las peticiones por rangos para poder buscar dentro del audio.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ provider: string }> },
) {
  const { provider } = await context.params;
  if (!isCloudSyncProvider(provider)) {
    return NextResponse.json({ error: "Proveedor no válido." }, { status: 400 });
  }
  const session = readCloudTokenSession(request.headers.get("cookie"), provider);
  if (!session) {
    return NextResponse.json(
      { error: "Inicia sesión con el proveedor." },
      { status: 401 },
    );
  }
  const fileId = new URL(request.url).searchParams.get("fileId");
  if (!fileId) {
    return NextResponse.json(
      { error: "Falta el archivo solicitado." },
      { status: 400 },
    );
  }

  const adapter: CloudProviderAdapter =
    provider === "google-drive"
      ? new GoogleDriveAdapter(session.accessToken)
      : new OneDriveAdapter(session.accessToken);
  if (!adapter.downloadRecording) {
    return NextResponse.json(
      { error: "Este proveedor no permite la descarga." },
      { status: 501 },
    );
  }

  try {
    const range = request.headers.get("range") ?? undefined;
    const download = await adapter.downloadRecording(fileId, range);
    return new Response(download.body, {
      status: download.status,
      headers: {
        "Content-Type": download.contentType,
        "Accept-Ranges": "bytes",
        "Cache-Control": "private, max-age=300",
        ...(download.contentLength
          ? { "Content-Length": download.contentLength }
          : {}),
        ...(download.contentRange
          ? { "Content-Range": download.contentRange }
          : {}),
      },
    });
  } catch (error) {
    const normalized = normalizeCloudProviderError(error);
    return NextResponse.json(
      { error: normalized.message, code: normalized.code },
      { status: 502 },
    );
  }
}
