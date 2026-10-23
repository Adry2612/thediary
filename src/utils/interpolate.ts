/**
 * Sustituye marcadores `{nombre}` de una plantilla de texto.
 */
export function interpolate<T extends object>(
  template: string,
  values: T,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    if (!(key in values)) return match;

    const value = (values as Record<string, unknown>)[key];
    return value === undefined ? match : String(value);
  });
}
