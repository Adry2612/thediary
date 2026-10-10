import type { Dict } from "./dictionary.ts";

export function createTranslator(dictionary: Dict) {
  return function t(path: string): string {
    const value = path.split(".").reduce<unknown>((current, key) => {
      if (current && typeof current === "object" && key in current) {
        return (current as Record<string, unknown>)[key];
      }

      return undefined;
    }, dictionary);

    return typeof value === "string" ? value : path;
  };
}
