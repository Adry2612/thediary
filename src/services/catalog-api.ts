import type {
  CatalogCandidate,
  CatalogSearchOutcome,
} from "../types/catalog.ts";

export const CATALOG_API_PATH = "/api/catalog/search";

function readCandidates(value: unknown): CatalogCandidate[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (entry): entry is CatalogCandidate =>
      typeof entry === "object" &&
      entry !== null &&
      typeof (entry as CatalogCandidate).id === "string" &&
      typeof (entry as CatalogCandidate).title === "string" &&
      typeof (entry as CatalogCandidate).artist === "string",
  );
}

/**
 * Pregunta al endpoint propio, nunca al catálogo directamente: así el
 * proveedor, su límite de peticiones y su CORS no llegan al navegador.
 */
export async function searchCatalogApi(
  query: string,
  { limit = 5, signal }: { limit?: number; signal?: AbortSignal } = {},
): Promise<CatalogSearchOutcome> {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  const response = await fetch(`${CATALOG_API_PATH}?${params}`, { signal });
  if (!response.ok) {
    throw new Error(`Catálogo no disponible (${response.status})`);
  }

  const payload = (await response.json()) as {
    results?: unknown;
    degraded?: unknown;
  };

  return {
    results: readCandidates(payload?.results),
    degraded: Boolean(payload?.degraded),
  };
}
