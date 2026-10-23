/**
 * Reductores para listas de elementos con `id`.
 *
 * Varios editores (fases de una práctica, bloques de una sesión, materiales,
 * partes de una canción) modifican su lista con el mismo par de operaciones:
 * parchear el elemento que coincide con un id y quitar el que coincide. Tenerlo
 * una sola vez evita que cada editor escriba su propio `map`/`filter` —y su
 * propia decisión sobre ids que no existen.
 *
 * Ambas funciones devuelven una lista nueva: no mutan la recibida.
 */

interface Identifiable {
  id: string;
}

/**
 * Devuelve la lista con `changes` fusionado en el elemento cuyo id coincide.
 * Si ningún id coincide, devuelve una lista equivalente a la recibida.
 */
export function updateById<T extends Identifiable>(
  items: readonly T[],
  id: string,
  changes: Partial<T>,
): T[] {
  return items.map((item) => (item.id === id ? { ...item, ...changes } : item));
}

/**
 * Devuelve la lista sin el elemento cuyo id coincide, conservando el orden.
 * Si ningún id coincide, devuelve una lista equivalente a la recibida.
 */
export function removeById<T extends Identifiable>(
  items: readonly T[],
  id: string,
): T[] {
  return items.filter((item) => item.id !== id);
}
