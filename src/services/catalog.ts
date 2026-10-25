import type {
  CatalogCandidate,
  CatalogSearchOutcome,
} from "../types/catalog.ts";
import {
  DEFAULT_CATALOG_LIMIT,
  mergeCandidates,
  normalizeCatalogQuery,
  parseDeezerResults,
  parseItunesResults,
} from "../utils/catalog-results.ts";

const ITUNES_SEARCH_URL = "https://itunes.apple.com/search";
const DEEZER_SEARCH_URL = "https://api.deezer.com/search";
const ITUNES_TIMEOUT_MS = 3_500;
const DEEZER_TIMEOUT_MS = 2_500;
const CACHE_TTL_MS = 15 * 60 * 1000;
const CACHE_MAX_ENTRIES = 100;
const UPSTREAM_LIMIT = 10;

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

interface CacheEntry {
  expiresAt: number;
  outcome: CatalogSearchOutcome;
}

const cache = new Map<string, CacheEntry>();

/** Vacía la caché en memoria. Solo lo usan las pruebas. */
export function clearCatalogCache(): void {
  cache.clear();
}

export interface SearchCatalogOptions {
  limit?: number;
  /** Se inyecta en las pruebas; en producción es el `fetch` global. */
  fetchImpl?: FetchLike;
  itunesTimeoutMs?: number;
  deezerTimeoutMs?: number;
  now?: () => number;
}

function readCache(key: string, now: number): CatalogSearchOutcome | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= now) {
    cache.delete(key);
    return null;
  }
  return entry.outcome;
}

function writeCache(key: string, outcome: CatalogSearchOutcome, now: number) {
  if (cache.size >= CACHE_MAX_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey !== undefined) cache.delete(oldestKey);
  }
  cache.set(key, { expiresAt: now + CACHE_TTL_MS, outcome });
}

function copyOutcome(outcome: CatalogSearchOutcome): CatalogSearchOutcome {
  return { results: [...outcome.results], degraded: outcome.degraded };
}

function buildItunesUrl(query: string): string {
  const url = new URL(ITUNES_SEARCH_URL);
  url.searchParams.set("term", query);
  url.searchParams.set("entity", "song");
  url.searchParams.set("limit", String(UPSTREAM_LIMIT));
  url.searchParams.set("country", "ES");
  return url.toString();
}

function buildDeezerUrl(query: string): string {
  const url = new URL(DEEZER_SEARCH_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("limit", String(UPSTREAM_LIMIT));
  return url.toString();
}

function timeoutSignal(milliseconds: number): AbortSignal {
  return AbortSignal.timeout(milliseconds);
}

async function fetchCandidates(
  url: string,
  fetchImpl: FetchLike,
  timeoutMs: number,
  parse: (payload: unknown) => CatalogCandidate[],
): Promise<CatalogCandidate[]> {
  const response = await fetchImpl(url, { signal: timeoutSignal(timeoutMs) });
  if (!response.ok) {
    throw new Error(`Catálogo no disponible (${response.status})`);
  }
  return parse(await response.json());
}

/**
 * Busca una canción en el catálogo. iTunes manda; Deezer solo entra si iTunes
 * falla o no encuentra nada. La respuesta distingue «sin coincidencias» de «no
 * se pudo preguntar al catálogo», que para la interfaz son mensajes distintos.
 */
export async function searchCatalog(
  query: string,
  {
    limit = DEFAULT_CATALOG_LIMIT,
    fetchImpl,
    itunesTimeoutMs = ITUNES_TIMEOUT_MS,
    deezerTimeoutMs = DEEZER_TIMEOUT_MS,
    now = Date.now,
  }: SearchCatalogOptions = {},
): Promise<CatalogSearchOutcome> {
  const normalizedQuery = normalizeCatalogQuery(query);
  if (!normalizedQuery) return { results: [], degraded: false };

  const cacheKey = `${limit}:${normalizedQuery.toLowerCase()}`;
  const cached = readCache(cacheKey, now());
  if (cached) return copyOutcome(cached);

  const request = fetchImpl ?? ((input, init) => fetch(input, init));

  let primary: CatalogCandidate[] = [];
  try {
    primary = await fetchCandidates(
      buildItunesUrl(normalizedQuery),
      request,
      itunesTimeoutMs,
      parseItunesResults,
    );
  } catch {
    primary = [];
  }

  let fallback: CatalogCandidate[] = [];
  let fallbackFailed = false;

  if (primary.length === 0) {
    try {
      fallback = await fetchCandidates(
        buildDeezerUrl(normalizedQuery),
        request,
        deezerTimeoutMs,
        parseDeezerResults,
      );
    } catch {
      fallbackFailed = true;
    }
  }

  const outcome: CatalogSearchOutcome = {
    results: mergeCandidates({
      primary,
      fallback,
      limit,
    }),
    degraded: fallbackFailed && primary.length === 0,
  };

  writeCache(cacheKey, outcome, now());
  return copyOutcome(outcome);
}
