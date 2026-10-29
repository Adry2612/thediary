/** Minutos enteros positivos; cualquier otro valor se descarta. */
export function normalizeTargetMinutes(value: unknown): number | undefined {
  const numeric =
    typeof value === "string" && value.trim() !== "" ? Number(value) : value;

  if (
    typeof numeric !== "number" ||
    !Number.isInteger(numeric) ||
    numeric <= 0
  ) {
    return undefined;
  }

  return numeric;
}

/** Segundos del objetivo, o `null` cuando la sesión no tiene uno. */
export function targetMinutesToSeconds(
  minutes: number | undefined,
): number | null {
  const normalized = normalizeTargetMinutes(minutes);
  return normalized ? normalized * 60 : null;
}
