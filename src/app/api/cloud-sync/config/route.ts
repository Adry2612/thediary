import { NextResponse } from "next/server";
import { getCloudProviderConfigurations } from "@/lib/cloud-sync/config";
import type { CloudSyncProvider } from "@/lib/cloud-sync/types";

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
