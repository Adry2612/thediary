import { NextResponse } from "next/server";
import { getProviderAvailability } from "@/lib/cloud-sync/server";

export function GET() {
  return NextResponse.json({ providers: getProviderAvailability() });
}
