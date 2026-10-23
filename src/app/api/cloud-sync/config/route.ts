import { NextResponse } from "next/server";
import { getCloudProviderConfigurations } from "@/services/cloud-sync/config";
import type { CloudSyncProvider } from "@/types/cloud-sync";

export const dynamic = "force-dynamic";

export function GET() {
  const providers = getCloudProviderConfigurations().reduce(
    (result, configuration) => {
      result[configuration.provider] = { enabled: configuration.enabled };
      return result;
    },
    {} as Record<CloudSyncProvider, { enabled: boolean }>,
  );

  return NextResponse.json({ providers });
}
