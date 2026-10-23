export interface SearchPickerItem {
  id: string;
  label: string;
  description?: string;
  /** Texto adicional que participa en la búsqueda (por ejemplo, partes). */
  searchText?: string;
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");
}

/**
 * Filtro compartido por los buscadores de canciones y técnicas. Busca por
 * palabras en el título, la descripción y el texto adicional, sin distinguir
 * mayúsculas ni acentos.
 */
export function filterSearchPickerItems(
  items: readonly SearchPickerItem[],
  query: string,
): SearchPickerItem[] {
  const terms = normalizeSearchText(query)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return items.filter((item) => {
    if (!terms.length) return true;
    const haystack = normalizeSearchText(
      item.searchText ?? `${item.label} ${item.description ?? ""}`,
    );
    return terms.every((term) => haystack.includes(term));
  });
}
