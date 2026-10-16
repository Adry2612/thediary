import { NextResponse } from "next/server";
import { exchangeOAuthCode, isCloudSyncProvider } from "@/lib/cloud-sync/oauth";
import {
  cloudTokenCookieNames,
  serializeCloudTokenSessionCookies,
} from "@/lib/cloud-sync/session";

export async function GET(
  request: Request,
  context: { params: Promise<{ provider: string }> },
) {
  const { provider } = await context.params;
  if (!isCloudSyncProvider(provider)) {
    return NextResponse.json({ error: "Proveedor no válido." }, { status: 400 });
  }
  const url = new URL(request.url);
  const stateCookie = request.headers.get("cookie")?.match(
    new RegExp(`(?:^|; )thediary-oauth-state-${provider}=([^;]+)`),
  )?.[1];
  const [expectedState, encodedReturnTo = "%2Frecordings", popup = "0"] = decodeURIComponent(
    stateCookie ?? "|%2Frecordings|0",
  ).split("|");
  const returnTo = decodeURIComponent(encodedReturnTo);
  const isPopup = popup === "1";
  if (!expectedState || expectedState !== url.searchParams.get("state")) {
    if (isPopup) return popupResult("error", provider, "Estado OAuth no válido.");
    return NextResponse.json({ error: "Estado OAuth no válido." }, { status: 400 });
  }
  const code = url.searchParams.get("code");
  if (!code) {
    if (isPopup) return popupResult("cancelled", provider, "La autorización fue cancelada.");
    return NextResponse.redirect(new URL(`${returnTo}?cloudSync=cancelled`, url));
  }

  try {
    const session = await exchangeOAuthCode(provider, code);
    const response = isPopup
      ? popupResult("connected", provider)
      : NextResponse.redirect(new URL(`${returnTo}?cloudSync=connected`, url));
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    };
    const sessionCookies = serializeCloudTokenSessionCookies(session);
    for (const cookie of sessionCookies) {
      response.cookies.set(cookie.name, cookie.value, cookieOptions);
    }
    // Remove chunks left over from a previously larger session.
    for (const name of cloudTokenCookieNames(provider).slice(sessionCookies.length)) {
      response.cookies.delete(name);
    }
    response.cookies.delete(`thediary-oauth-state-${provider}`);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo conectar el proveedor.";
    if (isPopup) return popupResult("error", provider, message);
    return NextResponse.redirect(new URL(`${returnTo}?cloudSync=error`, url));
  }
}

function popupResult(
  result: "connected" | "cancelled" | "error",
  provider: string,
  message?: string,
) {
  const payload = JSON.stringify({
    type: "thediary-cloud-sync",
    provider,
    result,
    message,
  });
  return new NextResponse(
    `<!doctype html><html><body><script>window.opener?.postMessage(${payload}, window.location.origin); window.close();</script><p>Esta ventana se cerrará automáticamente.</p></body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}
