import { NextResponse } from "next/server";
import { searchCatalog } from "@/services/catalog";
import {
  clampCatalogLimit,
  isCatalogQueryValid,
  normalizeCatalogQuery,
} from "@/utils/catalog-results";

export const dynamic = "force-dynamic";

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
};

/**
 * Busca canciones en el catálogo sin exponer el proveedor al navegador.
 * `degraded` viaja en la respuesta para que la interfaz distinga «no hay
 * coincidencias» de «no se pudo preguntar».
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = normalizeCatalogQuery(searchParams.get("q") ?? "");

  if (!isCatalogQueryValid(query)) {
    return NextResponse.json({ error: "query" }, { status: 400 });
  }

  const limit = clampCatalogLimit(searchParams.get("limit"));
  const outcome = await searchCatalog(query, { limit });

  return NextResponse.json(outcome, { headers: CACHE_HEADERS });
}
