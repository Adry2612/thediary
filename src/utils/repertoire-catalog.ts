import type {
  CatalogCandidate,
  CatalogSource,
} from "../types/catalog.ts";
import type { RepertoireItem } from "../types/practice.ts";

const ALBUM_MAX_LENGTH = 120;
const COVER_MAX_LENGTH = 500;
const CATALOG_ID_MAX_LENGTH = 120;
const MIN_RELEASE_YEAR = 1900;

const CATALOG_SOURCES: readonly CatalogSource[] = ["itunes", "deezer"];

/** Metadatos de catálogo tal como llegan antes de validarlos. */
export interface CatalogMetadata {
  album?: string;
  releaseYear?: number;
  coverUrl?: string;
  catalogSource?: CatalogSource;
  catalogId?: string;
}

function normalizeText(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const text = value.replace(/\s+/g, " ").trim();
  if (!text) return undefined;
  return text.slice(0, maxLength);
}

function normalizeCoverUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const text = value.trim();
  if (!text || text.length > COVER_MAX_LENGTH) return undefined;
  try {
    return new URL(text).protocol === "https:" ? text : undefined;
  } catch {
    return undefined;
  }
}

function normalizeReleaseYear(
  value: unknown,
  currentYear: number,
): number | undefined {
  if (!Number.isInteger(value)) return undefined;
  const year = value as number;
  if (year < MIN_RELEASE_YEAR || year > currentYear + 1) return undefined;
  return year;
}

function normalizeSource(value: unknown): CatalogSource | undefined {
  return CATALOG_SOURCES.includes(value as CatalogSource)
    ? (value as CatalogSource)
    : undefined;
}

/**
 * Deja solo los metadatos de catálogo que se pueden guardar. Un valor inválido
 * se descarta en vez de rechazar el guardado: la ficha del usuario nunca se
 * pierde por culpa de una respuesta rara de un catálogo.
 */
export function normalizeCatalogMetadata(
  input: CatalogMetadata,
  currentYear = new Date().getFullYear(),
): CatalogMetadata {
  const metadata: CatalogMetadata = {};
  const album = normalizeText(input.album, ALBUM_MAX_LENGTH);
  const releaseYear = normalizeReleaseYear(input.releaseYear, currentYear);
  const coverUrl = normalizeCoverUrl(input.coverUrl);
  const catalogSource = normalizeSource(input.catalogSource);
  const catalogId = normalizeText(input.catalogId, CATALOG_ID_MAX_LENGTH);

  if (album) metadata.album = album;
  if (releaseYear !== undefined) metadata.releaseYear = releaseYear;
  if (coverUrl) metadata.coverUrl = coverUrl;
  if (catalogSource) metadata.catalogSource = catalogSource;
  if (catalogId) metadata.catalogId = catalogId;

  return metadata;
}

/**
 * Cambios para completar una canción que ya existe con un resultado del
 * catálogo. Solo rellena lo que está vacío: el título, el artista, la
 * afinación, el capo, las partes, la letra y la tablatura no se tocan nunca.
 * Devuelve `null` cuando no hay nada que completar.
 */
export function buildCatalogFillUpdates(
  item: Pick<RepertoireItem, "album" | "releaseYear" | "coverUrl">,
  candidate: CatalogCandidate,
  updatedAt: string,
): Partial<RepertoireItem> | null {
  const metadata = normalizeCatalogMetadata({
    album: candidate.album,
    releaseYear: candidate.releaseYear,
    coverUrl: candidate.coverUrl,
  });

  const updates: Partial<RepertoireItem> = {};

  if (!item.album?.trim() && metadata.album) updates.album = metadata.album;
  if (item.releaseYear === undefined && metadata.releaseYear !== undefined) {
    updates.releaseYear = metadata.releaseYear;
  }
  if (!item.coverUrl?.trim() && metadata.coverUrl) {
    updates.coverUrl = metadata.coverUrl;
  }

  if (Object.keys(updates).length === 0) return null;

  return {
    ...updates,
    catalogSource: candidate.source,
    catalogId: candidate.id,
    updatedAt,
  };
}

/**
 * Consulta con la que arranca el buscador cuando ya hay datos de la canción:
 * título y artista separados por un solo espacio, sin partes vacías. Con dos
 * campos vacíos devuelve cadena vacía, y el buscador espera a que se escriba.
 */
export function buildCatalogQuery(
  title: string | undefined,
  artist: string | undefined,
): string {
  return [title, artist]
    .map((value) => value?.replace(/\s+/g, " ").trim() ?? "")
    .filter(Boolean)
    .join(" ");
}
