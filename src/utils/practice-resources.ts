import {
  PRACTICE_RESOURCE_KINDS,
  type PracticeResource,
  type PracticeResourceKind,
} from "../types/practice.ts";

/**
 * Nombre visible de cada tipo de material. Es un `Record` completo a propósito:
 * añadir un tipo a `PRACTICE_RESOURCE_KINDS` sin darle nombre deja de compilar,
 * y el listado de materiales nunca muestra un hueco.
 */
export const RESOURCE_LABELS: Record<PracticeResourceKind, string> = {
  songsterr: "Songsterr",
  pdf: "PDF",
  audio: "Audio",
  image: "Imagen",
  guitarpro: "Guitar Pro",
  youtube: "YouTube",
  spotify: "Spotify",
  link: "Enlace",
};

const RESOURCE_KINDS = new Set<PracticeResourceKind>(PRACTICE_RESOURCE_KINDS);

function cleanString(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const clean = value.trim();
  return clean ? clean.slice(0, maxLength) : undefined;
}

/**
 * Conserva solo materiales con identidad y tipo válidos. Los tipos retirados,
 * como el antiguo TAB de texto, se descartan al cargar el estado guardado.
 */
export function normalizePracticeResources(value: unknown): PracticeResource[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const resources: PracticeResource[] = [];

  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const candidate = entry as Partial<PracticeResource>;
    const id = cleanString(candidate.id, 120);
    const title = cleanString(candidate.title, 200);
    const kind = candidate.kind;
    if (!id || !title || !kind || !RESOURCE_KINDS.has(kind) || seen.has(id)) {
      continue;
    }

    seen.add(id);
    const url = cleanString(candidate.url, 500);
    const assetId = cleanString(candidate.assetId, 120);
    const fileName = cleanString(candidate.fileName, 200);

    resources.push({
      id,
      title,
      kind,
      ...(url ? { url } : {}),
      ...(assetId ? { assetId } : {}),
      ...(fileName ? { fileName } : {}),
    });
  }

  return resources;
}

/** Devuelve la fase conservando todo salvo los materiales retirados. */
export function normalizePracticePhaseResources<
  T extends { resources?: PracticeResource[] },
>(phase: T): T {
  const resources = normalizePracticeResources(phase.resources);
  const { resources: _discarded, ...rest } = phase;
  return {
    ...rest,
    ...(resources.length > 0 ? { resources } : {}),
  } as T;
}
