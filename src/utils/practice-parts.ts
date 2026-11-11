/**
 * Vínculo de un bloque con las partes de una canción del repertorio.
 *
 * Los datos antiguos guardaban una sola parte en `repertoirePartId`. Los nuevos
 * guardan varias en `repertoirePartIds`; ambos formatos conviven para no perder
 * prácticas ya sincronizadas.
 */
export type RepertoirePartLink = {
  repertoirePartId?: string;
  repertoirePartIds?: string[];
};

/** Partes marcadas en un bloque, sin duplicados y admitiendo los dos formatos. */
export function getRepertoirePartIds(link: RepertoirePartLink): string[] {
  const ids = (link.repertoirePartIds ?? []).filter(Boolean);
  if (ids.length > 0) return [...new Set(ids)];
  return link.repertoirePartId ? [link.repertoirePartId] : [];
}

/**
 * Campos compactos para guardar las partes marcadas: `repertoirePartId` cuando
 * solo hay una (compatible con los datos y lectores antiguos) y
 * `repertoirePartIds` cuando hay varias. Sin partes no se escribe ninguna clave.
 */
export function withRepertoirePartIds(
  ids: readonly string[],
): RepertoirePartLink {
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return {};
  if (unique.length === 1) return { repertoirePartId: unique[0] };
  return { repertoirePartIds: unique };
}

/**
 * Cambios para actualizar un bloque en memoria: además de escribir la forma
 * compacta, borra la otra clave para que no quede una selección anterior.
 */
export function repertoirePartChanges(
  ids: readonly string[],
): {
  repertoirePartId: string | undefined;
  repertoirePartIds: string[] | undefined;
} {
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) {
    return { repertoirePartId: undefined, repertoirePartIds: undefined };
  }
  if (unique.length === 1) {
    return { repertoirePartId: unique[0], repertoirePartIds: undefined };
  }
  return { repertoirePartId: undefined, repertoirePartIds: unique };
}

/** Marca o desmarca una parte manteniendo el resto. */
export function toggleRepertoirePartId(
  ids: readonly string[],
  partId: string,
): string[] {
  return ids.includes(partId)
    ? ids.filter((id) => id !== partId)
    : [...ids, partId];
}
