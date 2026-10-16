import { getCloudProviderConfigurations, getCloudProviderSecret } from "./config.ts";
import type { CloudSyncProvider } from "./types.ts";
import { CloudProviderError } from "./provider.ts";
import type { CloudTokenSession } from "./session.ts";

export function isCloudSyncProvider(value: string): value is CloudSyncProvider {
  return value === "google-drive" || value === "onedrive";
}

export async function exchangeOAuthCode(
  provider: CloudSyncProvider,
  code: string,
): Promise<CloudTokenSession> {
  const configuration = getCloudProviderConfigurations().find(
    (item) => item.provider === provider,
  );
  if (!configuration?.enabled) {
    throw new CloudProviderError("provider-unavailable", "El proveedor no está configurado.");
  }

  const isGoogle = provider === "google-drive";
  const tokenUrl = isGoogle
    ? "https://oauth2.googleapis.com/token"
    : "https://login.microsoftonline.com/common/oauth2/v2.0/token";
  const clientSecret = getCloudProviderSecret(provider);
  if (!clientSecret) {
    throw new CloudProviderError("provider-unavailable", "El proveedor no está configurado.");
  }
  const body = new URLSearchParams({
    code,
    client_id: configuration.clientId!,
    client_secret: clientSecret,
    redirect_uri: configuration.redirectUri!,
    grant_type: "authorization_code",
  });
  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!response.ok) {
    throw new CloudProviderError("authorization-cancelled", "No se pudo completar la autorización.");
  }
  const result = (await response.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };
  if (!result.access_token) {
    throw new CloudProviderError("authorization-cancelled", "El proveedor no devolvió una sesión válida.");
  }
  return {
    provider,
    accessToken: result.access_token,
    refreshToken: result.refresh_token,
    expiresAt: result.expires_in ? Date.now() + result.expires_in * 1000 : undefined,
  };
}
