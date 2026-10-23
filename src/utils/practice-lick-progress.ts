/**
 * Licks que cuentan como practicados al guardar una sesión: cada lick distinto
 * con al menos un bloque realizado. Un lick repetido en dos bloques cuenta una
 * sola vez.
 */
export function getPracticedLickIds(
  phases: readonly { lickId?: string; elapsedSeconds: number }[],
): string[] {
  const ids = new Set<string>();
  for (const phase of phases) {
    if (phase.lickId && phase.elapsedSeconds > 0) ids.add(phase.lickId);
  }
  return [...ids];
}
