import type {
  GuitarLick,
} from "../types/lick.ts";
import type {
  RepertoireItem,
  SessionPhaseRecord,
} from "../types/practice.ts";
import type { CatalogNameLanguage } from "../types/display.ts";
import { getTechniqueName } from "./catalogs/techniques.ts";
import { getTheoryName } from "./catalogs/theory.ts";
import { getRepertoirePartIds } from "./practice-parts.ts";

/** Elemento de repertorio al que apunta un bloque, si todavía existe. */
export function getLinkedRepertoireItem(
  phase: Pick<SessionPhaseRecord, "repertoireItemId">,
  repertoireItems: readonly RepertoireItem[],
): RepertoireItem | undefined {
  if (!phase.repertoireItemId) return undefined;
  return repertoireItems.find(
    (candidate) => candidate.id === phase.repertoireItemId,
  );
}

/**
 * Nombre legible del vínculo de repertorio de un bloque guardado. La canción
 * basta cuando el bloque no eligió parte o cuando la parte ya no existe.
 */
export function getLinkedRepertoireLabel(
  phase: Pick<
    SessionPhaseRecord,
    "repertoireItemId" | "repertoirePartId" | "repertoirePartIds"
  >,
  repertoireItems: RepertoireItem[],
): string | null {
  const item = getLinkedRepertoireItem(phase, repertoireItems);
  if (!item) return null;

  const partNames = getRepertoirePartIds(phase)
    .map((partId) => item.parts.find((part) => part.id === partId)?.name)
    .filter((name): name is string => Boolean(name));

  return partNames.length > 0
    ? `${item.title} · ${partNames.join(", ")}`
    : item.title;
}

/** Nombres de las partes guardadas, solo las que todavía existen en la canción. */
export function getLinkedRepertoirePartName(
  phase: Pick<
    SessionPhaseRecord,
    "repertoireItemId" | "repertoirePartId" | "repertoirePartIds"
  >,
  repertoireItems: RepertoireItem[],
): string | null {
  const item = getLinkedRepertoireItem(phase, repertoireItems);
  if (!item || getRepertoirePartIds(phase).length === 0) return null;
  const names = getRepertoirePartIds(phase)
    .map((partId) => item.parts.find((part) => part.id === partId)?.name)
    .filter((name): name is string => Boolean(name));
  return names.length > 0 ? names.join(", ") : null;
}

/**
 * Título que debe mostrar un bloque de práctica. En repertorio manda siempre
 * la canción vinculada; el nombre guardado solo es el respaldo de datos
 * antiguos o de una referencia que ya no existe.
 */
export function getPracticeBlockTitle(
  phase: Pick<
    SessionPhaseRecord,
    "name" | "skill" | "repertoireItemId"
  >,
  repertoireItems: readonly RepertoireItem[],
): string {
  if (phase.skill !== "repertoire") return phase.name;
  return getLinkedRepertoireItem(phase, repertoireItems)?.title ?? phase.name;
}

/**
 * Título visible de un bloque: resuelve las técnicas y los temas de teoría al
 * idioma elegido, y deja intactos los nombres personalizados.
 */
export function getPracticeBlockDisplayTitle(
  phase: Pick<
    SessionPhaseRecord,
    "name" | "skill" | "repertoireItemId"
  >,
  repertoireItems: readonly RepertoireItem[],
  language: CatalogNameLanguage,
): string {
  const title = getPracticeBlockTitle(phase, repertoireItems);
  if (phase.skill === "technique") return getTechniqueName(title, language);
  if (phase.skill === "theory") return getTheoryName(title, language);
  return title;
}

/** Título del lick vinculado a un bloque guardado, si todavía existe. */
export function getLinkedLickLabel(
  phase: Pick<SessionPhaseRecord, "lickId">,
  licks: readonly GuitarLick[],
): string | null {
  if (!phase.lickId) return null;
  return licks.find((lick) => lick.id === phase.lickId)?.title ?? null;
}
