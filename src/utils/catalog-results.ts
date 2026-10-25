import type { CatalogCandidate } from "../types/catalog.ts";

/** Mínimo de caracteres para lanzar una búsqueda. */
export const MIN_CATALOG_QUERY_LENGTH = 2;
/** Resultados que se muestran si no se pide otra cosa. */
export const DEFAULT_CATALOG_LIMIT = 5;
/** Tope de resultados que admite el endpoint. */
export const MAX_CATALOG_LIMIT = 8;

const ITUNES_ARTWORK_SIZE = "600x600bb";
const MIN_RELEASE_YEAR = 1900;
const MAX_RELEASE_YEAR = 2100;

/** Deja la consulta en una sola línea de espacios simples. */
export function normalizeCatalogQuery(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function isCatalogQueryValid(query: string): boolean {
  return normalizeCatalogQuery(query).length >= MIN_CATALOG_QUERY_LENGTH;
}

/** Lee el parámetro `limit` de la URL y lo deja dentro del rango admitido. */
export function clampCatalogLimit(
  value: string | number | null | undefined,
  fallback = DEFAULT_CATALOG_LIMIT,
  max = MAX_CATALOG_LIMIT,
): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(Math.trunc(parsed), 1), max);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asText(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const text = value.trim();
  return text || undefined;
}

function asIdentifier(value: unknown): string | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return asText(value);
}

/**
 * Las carátulas de iTunes llevan el tamaño en la URL (`100x100bb`). El mismo
 * servicio sirve la de 600 px cambiando solo ese fragmento.
 */
export function upgradeArtworkUrl(value: unknown): string | undefined {
  const text = asText(value);
  if (!text) return undefined;

  try {
    if (new URL(text).protocol !== "https:") return undefined;
  } catch {
    return undefined;
  }

  return text.replace(/\d+x\d+bb/, ITUNES_ARTWORK_SIZE);
}

/** Año de lanzamiento a partir de una fecha ISO, un año suelto o un número. */
export function parseReleaseYear(value: unknown): number | undefined {
  if (typeof value === "number") {
    return Number.isInteger(value) &&
      value >= MIN_RELEASE_YEAR &&
      value <= MAX_RELEASE_YEAR
      ? value
      : undefined;
  }

  const text = asText(value);
  if (!text) return undefined;
  const match = /^(\d{4})/.exec(text);
  if (!match) return undefined;

  const year = Number(match[1]);
  return year >= MIN_RELEASE_YEAR && year <= MAX_RELEASE_YEAR ? year : undefined;
}

export function parseItunesResults(payload: unknown): CatalogCandidate[] {
  const results = asArray(asRecord(payload)?.results);
  const candidates: CatalogCandidate[] = [];

  for (const entry of results) {
    const record = asRecord(entry);
    if (!record) continue;

    const title = asText(record.trackName);
    const artist = asText(record.artistName);
    const id = asIdentifier(record.trackId);
    if (!title || !artist || !id) continue;

    const album = asText(record.collectionName);
    const releaseYear = parseReleaseYear(record.releaseDate);
    const coverUrl = upgradeArtworkUrl(
      record.artworkUrl100 ?? record.artworkUrl60,
    );

    candidates.push({
      source: "itunes",
      id,
      title,
      artist,
      ...(album ? { album } : {}),
      ...(releaseYear !== undefined ? { releaseYear } : {}),
      ...(coverUrl ? { coverUrl } : {}),
    });
  }

  return candidates;
}

export function parseDeezerResults(payload: unknown): CatalogCandidate[] {
  const results = asArray(asRecord(payload)?.data);
  const candidates: CatalogCandidate[] = [];

  for (const entry of results) {
    const record = asRecord(entry);
    if (!record) continue;

    const albumRecord = asRecord(record.album);
    const artistRecord = asRecord(record.artist);
    const title = asText(record.title);
    const artist = asText(artistRecord?.name);
    const id = asIdentifier(record.id);
    if (!title || !artist || !id) continue;

    const album = asText(albumRecord?.title);
    const releaseYear = parseReleaseYear(
      albumRecord?.release_date ?? record.release_date,
    );
    const coverUrl = upgradeArtworkUrl(
      albumRecord?.cover_xl ?? albumRecord?.cover_big,
    );

    candidates.push({
      source: "deezer",
      id,
      title,
      artist,
      ...(album ? { album } : {}),
      ...(releaseYear !== undefined ? { releaseYear } : {}),
      ...(coverUrl ? { coverUrl } : {}),
    });
  }

  return candidates;
}

function matchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/**
 * Dos candidatos son la misma canción cuando coinciden título y artista. El
 * álbum no entra: el mismo tema aparece en el disco original, en un remaster y
 * en una banda sonora, y para el repertorio eso es una sola canción.
 */
function duplicateKey(candidate: CatalogCandidate): string {
  return [matchText(candidate.title), matchText(candidate.artist)].join("|");
}

/**
 * Junta los resultados de los dos catálogos sin reordenarlos. El orden del
 * proveedor ya pone arriba lo que más se escucha, y cualquier puntuación propia
 * acababa colando una versión de tributo por delante del original. Se queda la
 * primera aparición de cada título y artista, y se recorta al límite pedido.
 */
export function mergeCandidates({
  primary,
  fallback = [],
  limit = DEFAULT_CATALOG_LIMIT,
}: {
  primary: CatalogCandidate[];
  fallback?: CatalogCandidate[];
  limit?: number;
}): CatalogCandidate[] {
  const seen = new Set<string>();
  const merged: CatalogCandidate[] = [];

  for (const candidate of [...primary, ...fallback]) {
    const key = duplicateKey(candidate);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(candidate);
  }

  return merged.slice(0, clampCatalogLimit(limit));
}
