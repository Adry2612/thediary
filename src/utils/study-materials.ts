import {
  PRACTICE_RESOURCE_KINDS,
  type PracticeResource,
  type PracticeResourceKind,
  type StudyMaterial,
} from "../types/practice.ts";
import { isHttpsUrl } from "./practice-resource-links.ts";

export { isHttpsUrl };

const TITLE_MAX_LENGTH = 120;
const NOTES_MAX_LENGTH = 500;
const URL_MAX_LENGTH = 500;
const FILE_NAME_MAX_LENGTH = 200;

/** Los tipos que la biblioteca puede crear desde su formulario. */
export const STUDY_MATERIAL_KINDS: readonly PracticeResourceKind[] = [
  "guitarpro",
  "pdf",
  "image",
  "youtube",
  "spotify",
  "songsterr",
  "link",
];

const URL_KINDS = new Set<PracticeResourceKind>([
  "youtube",
  "spotify",
  "songsterr",
  "link",
]);

const FILE_KINDS = new Set<PracticeResourceKind>([
  "guitarpro",
  "pdf",
  "image",
]);

export type StudyMaterialSourceMode = "file" | "url";

export function getStudyMaterialSourceMode(
  kind: PracticeResourceKind,
): StudyMaterialSourceMode {
  return URL_KINDS.has(kind) ? "url" : "file";
}

export function isStudyMaterialFileKind(kind: PracticeResourceKind): boolean {
  return FILE_KINDS.has(kind);
}

/** Un enlace genérico solo vale si es HTTPS, igual que el resto de materiales. */

function normalizeText(
  value: unknown,
  maxLength: number,
): string | undefined {
  if (typeof value !== "string") return undefined;
  const text = value.replace(/\s+/g, " ").trim();
  return text ? text.slice(0, maxLength) : undefined;
}

function normalizeLongText(
  value: unknown,
  maxLength: number,
): string | undefined {
  if (typeof value !== "string") return undefined;
  const text = value.trim();
  return text ? text.slice(0, maxLength) : undefined;
}

function normalizeTimestamp(value: unknown): string {
  return typeof value === "string" && value.trim()
    ? value
    : new Date(0).toISOString();
}

/**
 * Deja solo materiales con identidad y tipo válidos. Un estado antiguo sin la
 * clave produce una lista vacía y una entrada rota se descarta sin afectar al
 * resto de la biblioteca.
 */
export function normalizeStudyMaterials(value: unknown): StudyMaterial[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const materials: StudyMaterial[] = [];

  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const candidate = entry as Partial<StudyMaterial>;
    const id = normalizeText(candidate.id, 120);
    const title = normalizeText(candidate.title, TITLE_MAX_LENGTH);
    const kind = PRACTICE_RESOURCE_KINDS.includes(
      candidate.kind as PracticeResourceKind,
    )
      ? (candidate.kind as PracticeResourceKind)
      : undefined;

    if (!id || !title || !kind || seen.has(id)) continue;
    seen.add(id);

    const url = normalizeText(candidate.url, URL_MAX_LENGTH);
    const assetId = normalizeText(candidate.assetId, 120);
    const fileName = normalizeText(candidate.fileName, FILE_NAME_MAX_LENGTH);
    const notes = normalizeLongText(candidate.notes, NOTES_MAX_LENGTH);

    materials.push({
      id,
      title,
      kind,
      ...(url ? { url } : {}),
      ...(assetId ? { assetId } : {}),
      ...(fileName ? { fileName } : {}),
      ...(notes ? { notes } : {}),
      createdAt: normalizeTimestamp(candidate.createdAt),
      updatedAt: normalizeTimestamp(candidate.updatedAt),
    });
  }

  return materials;
}

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");
}

/**
 * Ordena de más reciente a más antiguo y filtra por texto (título o notas) y
 * por tipo. No muta la lista guardada.
 */
export function filterStudyMaterials(
  materials: readonly StudyMaterial[],
  { query, kind }: { query: string; kind: PracticeResourceKind | "all" },
): StudyMaterial[] {
  const terms = normalizeSearchText(query)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return materials
    .filter((material) => {
      if (kind !== "all" && material.kind !== kind) return false;
      if (!terms.length) return true;
      const haystack = normalizeSearchText(
        `${material.title} ${material.notes ?? ""}`,
      );
      return terms.every((term) => haystack.includes(term));
    })
    .sort((left, right) => {
      const byDate =
        Date.parse(right.updatedAt) - Date.parse(left.updatedAt);
      return byDate !== 0
        ? byDate
        : left.title.localeCompare(right.title, "es");
    });
}

/**
 * Convierte una entrada de la biblioteca en un adjunto con identidad propia.
 * La copia es deliberada: editar o borrar la entrada no reescribe prácticas ya
 * guardadas.
 */
export function studyMaterialToResource(
  material: StudyMaterial,
  id: string,
): PracticeResource {
  const resource: PracticeResource = {
    id,
    title: material.title,
    kind: material.kind,
  };
  if (material.url !== undefined) resource.url = material.url;
  if (material.assetId !== undefined) resource.assetId = material.assetId;
  if (material.fileName !== undefined) resource.fileName = material.fileName;
  return resource;
}
