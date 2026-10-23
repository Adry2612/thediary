import { NextResponse } from "next/server";
import { GoogleDriveAdapter } from "@/services/cloud-sync/google-drive";
import { OneDriveAdapter } from "@/services/cloud-sync/onedrive";
import {
  cloudTokenCookieNames,
  readCloudTokenSession,
} from "@/services/cloud-sync/session";
import { isCloudSyncProvider } from "@/services/cloud-sync/oauth";

export async function GET(
  request: Request,
  context: { params: Promise<{ provider: string }> },
) {
  const { provider } = await context.params;
  if (!isCloudSyncProvider(provider)) return NextResponse.json({ error: "Proveedor no válido." }, { status: 400 });
  const session = readCloudTokenSession(request.headers.get("cookie"), provider);
  if (!session) return NextResponse.json({ provider, connected: false });
  try {
    const adapter = provider === "google-drive"
      ? new GoogleDriveAdapter(session.accessToken)
      : new OneDriveAdapter(session.accessToken);
    return NextResponse.json(await adapter.getConnection());
  } catch {
    return NextResponse.json({ provider, connected: false });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ provider: string }> },
) {
  const { provider } = await context.params;
  if (!isCloudSyncProvider(provider)) return NextResponse.json({ error: "Proveedor no válido." }, { status: 400 });
  const response = NextResponse.json({ connected: false });
  for (const name of cloudTokenCookieNames(provider)) {
    response.cookies.delete(name);
  }
  return response;
}
