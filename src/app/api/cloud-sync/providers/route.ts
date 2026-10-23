import { NextResponse } from "next/server";
import { getProviderAvailability } from "@/services/cloud-sync/server";

export function GET() {
  return NextResponse.json({ providers: getProviderAvailability() });
}
