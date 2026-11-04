import { formatClockInput, parseClockInput } from "./clock-time.ts";
import type { EditableSession } from "./practice-session-editing.ts";

/** Texto editable de cada tiempo: un reloj por bloque y otro para la sesión. */
export interface SessionClockDrafts {
  blocks: Record<string, string>;
  duration: string;
}

/** Valores iniciales de los campos de reloj a partir del borrador en segundos. */
export function createSessionClockDrafts(
  session: EditableSession,
): SessionClockDrafts {
  return {
    blocks: Object.fromEntries(
      session.blocks.map((block) => [
        block.id,
        formatClockInput(block.actualSeconds),
      ]),
    ),
    duration: formatClockInput(session.durationSeconds),
  };
}

export interface SessionClockResult {
  session: EditableSession;
  /** Errores por campo; las claves `block:<id>` y `duration` identifican el campo. */
  errors: Record<string, string>;
}

/**
 * Vuelca los textos de reloj al borrador en segundos. Un campo vacío vale cero;
 * un texto inválido deja el valor anterior del bloque y devuelve un error, para
 * que el formulario no pierda el resto de cambios.
 */
export function applySessionClockDrafts(
  session: EditableSession,
  drafts: SessionClockDrafts,
): SessionClockResult {
  const errors: Record<string, string> = {};

  const blocks = session.blocks.map((block) => {
    const raw = drafts.blocks[block.id] ?? "";
    if (raw.trim() === "") return { ...block, actualSeconds: 0 };

    const seconds = parseClockInput(raw);
    if (seconds === null) {
      errors[`block:${block.id}`] = "invalid";
      return block;
    }
    return { ...block, actualSeconds: seconds };
  });

  let durationSeconds = session.durationSeconds;
  if (session.blocks.length === 0) {
    if (drafts.duration.trim() === "") {
      durationSeconds = 0;
    } else {
      const seconds = parseClockInput(drafts.duration);
      if (seconds === null) errors.duration = "invalid";
      else durationSeconds = seconds;
    }
  }

  return { session: { ...session, blocks, durationSeconds }, errors };
}
