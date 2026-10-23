import { NextResponse } from "next/server";
import { GoogleDriveAdapter } from "@/services/cloud-sync/google-drive";
import { OneDriveAdapter } from "@/services/cloud-sync/onedrive";
import { isCloudSyncProvider } from "@/services/cloud-sync/oauth";
import { getProviderAvailability } from "@/services/cloud-sync/server";
import { randomBytes } from "node:crypto";

export async function GET(
  request: Request,
  context: { params: Promise<{ provider: string }> },
) {
  const { provider } = await context.params;
  const requestUrl = new URL(request.url);
  const popup = requestUrl.searchParams.get("popup") === "1";
  if (!isCloudSyncProvider(provider) || !getProviderAvailability()[provider]) {
    if (popup) {
      return popupError(
        provider,
        "Este proveedor no está configurado. Añade sus credenciales OAuth y reinicia la aplicación.",
      );
    }
    return NextResponse.json({ error: "Proveedor no disponible." }, { status: 404 });
  }
  const state = randomBytes(24).toString("base64url");
  const returnTo = requestUrl.searchParams.get("returnTo") ?? "/recordings";
  const adapter = provider === "google-drive"
    ? new GoogleDriveAdapter("")
    : new OneDriveAdapter("");
  const authorizationUrl = await adapter.beginAuthorization(state);
  const response = NextResponse.redirect(authorizationUrl);
  response.cookies.set(
    `thediary-oauth-state-${provider}`,
    `${state}|${encodeURIComponent(returnTo)}|${popup ? "1" : "0"}`,
    {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
    },
  );
  return response;
}

function popupError(provider: string, message: string) {
  const payload = JSON.stringify({
    type: "thediary-cloud-sync",
    provider,
    result: "error",
    message,
  });
  return new NextResponse(
    `<!doctype html><html><body><script>window.opener?.postMessage(${payload}, window.location.origin); window.close();</script><p>${message}</p></body></html>`,
    { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}
