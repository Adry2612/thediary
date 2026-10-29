export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
  /** Nombre del bloque. Los bloques con el mismo nombre se agrupan. */
  group?: string;
  /** Miniatura opcional que acompaña a la etiqueta. */
  image?: string;
};

export type SelectEntry =
  | { kind: "header"; key: string; label: string }
  | { kind: "option"; option: SelectOption; index: number };

/**
 * Convierte una lista plana de opciones en entradas de lista, intercalando una
 * cabecera no seleccionable al empezar cada grupo. La cabecera no lleva índice
 * de opción, así que el teclado nunca la alcanza.
 */
export function buildSelectEntries(options: SelectOption[]): SelectEntry[] {
  const entries: SelectEntry[] = [];
  let currentGroup: string | undefined;
  options.forEach((option, index) => {
    if (option.group && option.group !== currentGroup) {
      entries.push({
        kind: "header",
        key: `header:${option.group}:${index}`,
        label: option.group,
      });
    }
    currentGroup = option.group;
    entries.push({ kind: "option", option, index });
  });
  return entries;
}
