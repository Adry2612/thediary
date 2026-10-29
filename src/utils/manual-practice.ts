import {
  PRACTICE_SKILLS,
  type GuitarType,
  type PracticeSkill,
  type SessionRecord,
} from "../types/practice.ts";
import { createId } from "./create-id.ts";

export type ManualPracticeInput = {
  title: string;
  startedAtLocal: string;
  blocks: {
    name: string;
    durationMinutes: number;
    skill: PracticeSkill;
    repertoireItemId?: string;
    repertoirePartId?: string;
  }[];
  notes: string;
  guitarType?: GuitarType;
  guitarId?: string;
};

/** Canción mínima que necesita el registro manual para enlazar un bloque. */
export type ManualPracticeSong = { id: string; title: string };

/**
 * Bloque tal como se edita en el formulario de práctica manual: la duración es
 * el texto del campo, no un número, y lleva id para que React pueda seguir la
 * fila mientras se escribe.
 *
 * Es la forma editable de `ManualPracticeInput["blocks"]`;
 * `manualPracticeBlocksFromDrafts` hace el paso de una a otra.
 */
export type ManualPracticeBlockDraft = {
  id: string;
  name: string;
  durationMinutes: string;
  skill: PracticeSkill;
  /** Canción del repertorio a la que acredita el tiempo, si el usuario la enlaza. */
  repertoireItemId?: string;
  repertoirePartId?: string;
};

/** Bloque nuevo, con los valores con los que abre el formulario. */
export function createManualPracticeBlockDraft(): ManualPracticeBlockDraft {
  return {
    id: createId(),
    name: "",
    durationMinutes: "30",
    skill: "technique",
  };
}

/** Enlaza el bloque con una canción: el nombre pasa a ser el título de la canción. */
export function linkManualPracticeSong(
  block: ManualPracticeBlockDraft,
  song: ManualPracticeSong,
  partId?: string,
): ManualPracticeBlockDraft {
  return {
    ...block,
    name: song.title,
    repertoireItemId: song.id,
    repertoirePartId: partId || undefined,
  };
}

/** Cambia solo la parte elegida, manteniendo la canción enlazada. */
export function changeManualPracticeSongPart(
  block: ManualPracticeBlockDraft,
  partId?: string,
): ManualPracticeBlockDraft {
  return { ...block, repertoirePartId: partId || undefined };
}

/** Quita el enlace y deja el nombre editable otra vez. */
export function clearManualPracticeSong(
  block: ManualPracticeBlockDraft,
): ManualPracticeBlockDraft {
  const { repertoireItemId, repertoirePartId, ...rest } = block;
  return rest;
}

/**
 * Cambia el tipo de práctica. Solo los bloques de repertorio pueden acreditar
 * una canción, así que cualquier otro tipo suelta el enlace.
 */
export function changeManualPracticeSkill(
  block: ManualPracticeBlockDraft,
  skill: PracticeSkill,
): ManualPracticeBlockDraft {
  return skill === "repertoire"
    ? { ...block, skill }
    : clearManualPracticeSong({ ...block, skill });
}

/**
 * Valor local `AAAA-MM-DDTHH:MM` que pide un input `datetime-local`. Resta el
 * desplazamiento del huso para que el campo muestre la hora del reloj del
 * usuario y no la de UTC.
 */
export function toLocalDateTimeInputValue(date: Date): string {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}

/**
 * Pasa los bloques editados a los bloques que valida
 * `createManualPracticeRecord`. Con la lista de canciones, un enlace huérfano
 * se descarta en vez de guardar una referencia que ya no existe.
 */
export function manualPracticeBlocksFromDrafts(
  blocks: ManualPracticeBlockDraft[],
  songs: readonly ManualPracticeSong[] = [],
): ManualPracticeInput["blocks"] {
  const songsById = new Map(songs.map((song) => [song.id, song]));

  return blocks.map(
    ({ name, durationMinutes, skill, repertoireItemId, repertoirePartId }) => {
      const song = repertoireItemId ? songsById.get(repertoireItemId) : undefined;
      const keepLink = Boolean(repertoireItemId && (songs.length === 0 || song));

      return {
        name: song?.title ?? name,
        durationMinutes: Number(durationMinutes),
        skill,
        ...(keepLink
          ? {
              repertoireItemId,
              ...(repertoirePartId
                ? { repertoirePartId }
                : {}),
            }
          : {}),
      };
    },
  );
}

export function createManualPracticeRecord(
  input: ManualPracticeInput,
): SessionRecord {
  const localDateTime = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(
    input.startedAtLocal,
  );
  const startedAt = new Date(input.startedAtLocal);
  const expectedDateParts = localDateTime?.slice(1).map(Number);
  const actualDateParts = [
    startedAt.getFullYear(),
    startedAt.getMonth() + 1,
    startedAt.getDate(),
    startedAt.getHours(),
    startedAt.getMinutes(),
  ];
  if (
    !expectedDateParts ||
    !Number.isFinite(startedAt.getTime()) ||
    expectedDateParts.some((part, index) => part !== actualDateParts[index])
  ) {
    throw new TypeError("Introduce una fecha y hora válidas.");
  }
  if (input.blocks.length === 0) {
    throw new RangeError("Añade al menos un bloque de práctica.");
  }

  const phases = input.blocks.map((block, index) => {
    if (!block.name.trim()) {
      throw new TypeError(`Escribe el nombre del bloque ${index + 1}.`);
    }
    if (
      !Number.isSafeInteger(block.durationMinutes) ||
      block.durationMinutes <= 0 ||
      block.durationMinutes > 240
    ) {
      throw new RangeError(
        "La duración de cada bloque debe ser un entero entre 1 y 240 minutos.",
      );
    }
    if (!PRACTICE_SKILLS.includes(block.skill)) {
      throw new TypeError("Selecciona un tipo de práctica válido.");
    }

    const elapsedSeconds = block.durationMinutes * 60;
    return {
      id: index + 1,
      name: block.name.trim(),
      skill: block.skill,
      durationMinutes: block.durationMinutes,
      elapsedSeconds,
      ...(block.repertoireItemId
        ? { repertoireItemId: block.repertoireItemId }
        : {}),
      ...(block.repertoireItemId && block.repertoirePartId
        ? { repertoirePartId: block.repertoirePartId }
        : {}),
    };
  });
  const durationSeconds = phases.reduce(
    (total, phase) => total + phase.elapsedSeconds,
    0,
  );
  const notes = input.notes.trim();
  const skillSeconds = {
    technique: 0,
    theory: 0,
    repertoire: 0,
    lick: 0,
    improvisation: 0,
  } satisfies Record<PracticeSkill, number>;

  for (const phase of phases) {
    skillSeconds[phase.skill] += phase.elapsedSeconds;
  }

  return {
    id: createId(),
    title: input.title.trim() || "Práctica manual",
    startedAt: startedAt.toISOString(),
    durationSeconds,
    averageBpm: 0,
    completed: true,
    skillSeconds,
    notes: notes || undefined,
    ...(input.guitarType ? { guitarType: input.guitarType } : {}),
    ...(input.guitarId ? { guitarId: input.guitarId } : {}),
    phases,
  };
}
