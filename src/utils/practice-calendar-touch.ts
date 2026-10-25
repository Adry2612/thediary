/**
 * Cómo debe responder el calendario anual al activar un día.
 *
 * En un puntero fino (ratón) o desde teclado/tecnología de asistencia se entra
 * directamente al detalle. En una pantalla táctil el primer toque solo abre el
 * resumen del día; el segundo toque sobre ese mismo día entra al detalle.
 */

export type DayPointerType = "coarse" | "fine";

export type DayActivationInput = {
  /** Tipo de puntero que ha activado el día en este gesto. */
  pointer: DayPointerType;
  /** Activación sin clic de ratón: teclado o tecnología de asistencia. */
  isKeyboard: boolean;
  /** Si el día tiene sesiones guardadas; sin ellas nunca se navega. */
  hasPractice: boolean;
  /** Día cuyo resumen está abierto por un toque, si lo hay. */
  armedDate: string | null;
  /** Día que se acaba de activar. */
  dateKey: string;
};

export type DayActivation = "arm" | "navigate";

export function resolveDayActivation({
  pointer,
  isKeyboard,
  hasPractice,
  armedDate,
  dateKey,
}: DayActivationInput): DayActivation {
  if (!hasPractice) return "arm";
  if (isKeyboard || pointer === "fine") return "navigate";

  return armedDate === dateKey ? "navigate" : "arm";
}
