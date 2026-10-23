/** Estados posibles de la sesión de práctica, sin texto de interfaz. */
export type PracticeSessionStatus = "completed" | "running" | "paused";

/**
 * Estado de la sesión a partir de si ya terminó y de si el reloj corre. El
 * texto que se muestra lo decide el componente con su sección de i18n.
 */
export function getSessionStatus(
  isCompleted: boolean,
  isRunning: boolean,
): PracticeSessionStatus {
  if (isCompleted) return "completed";
  if (isRunning) return "running";
  return "paused";
}
