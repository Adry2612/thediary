import type { RepertoireItem } from "../types/practice.ts";

export type RepertoireGroupBy = "none" | "artist" | "album";

export interface RepertoireGroup {
  key: string;
  label: string;
  items: RepertoireItem[];
}

const REPERTOIRE_GROUP_BY: RepertoireGroupBy[] = ["none", "artist", "album"];

export function isRepertoireGroupBy(
  value: string,
): value is RepertoireGroupBy {
  return REPERTOIRE_GROUP_BY.some((option) => option === value);
}

/** Clave de agrupación: sin acentos, sin mayúsculas y con espacios simples. */
function normalizeGroupKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase("es")
    .replace(/\s+/g, " ");
}

/**
 * Reparte una lista ya filtrada y ordenada en secciones por artista o por
 * álbum. No filtra, no ordena por dentro y no escribe nada: solo decide qué
 * canciones van juntas y en qué orden se muestran los grupos.
 *
 * - Las claves ignoran acentos y mayúsculas, así que «Metallica» y «metallica»
 *   caen en el mismo grupo; la etiqueta es la primera grafía encontrada.
 * - Las canciones sin el dato van en un último grupo, con la etiqueta que pase
 *   el llamador, para que no desaparezcan del listado.
 */
export function groupRepertoireItems(
  items: RepertoireItem[],
  groupBy: RepertoireGroupBy,
  { unknownLabel }: { unknownLabel: string },
): RepertoireGroup[] {
  if (groupBy === "none") {
    return items.length > 0 ? [{ key: "all", label: "", items }] : [];
  }

  const field: "artist" | "album" = groupBy;
  const groups = new Map<string, RepertoireGroup>();
  const withoutValue: RepertoireItem[] = [];

  for (const item of items) {
    const value = (item[field] ?? "").trim();
    if (!value) {
      withoutValue.push(item);
      continue;
    }

    const key = normalizeGroupKey(value);
    const group = groups.get(key);
    if (group) group.items.push(item);
    else groups.set(key, { key, label: value, items: [item] });
  }

  const ordered = [...groups.values()].sort(
    (first, second) =>
      first.label.localeCompare(second.label, "es", { sensitivity: "base" }) ||
      first.key.localeCompare(second.key, "es", { sensitivity: "base" }),
  );

  if (withoutValue.length > 0) {
    ordered.push({ key: "__unknown", label: unknownLabel, items: withoutValue });
  }

  return ordered;
}
