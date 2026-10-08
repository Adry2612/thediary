import type { PracticeSkill, SessionRecord } from "../types/practice";

const PRACTICE_SKILLS: PracticeSkill[] = [
  "technique",
  "theory",
  "repertoire",
  "improvisation",
];

export type ManualPracticeInput = {
  title: string;
  startedAtLocal: string;
  blocks: {
    name: string;
    durationMinutes: number;
    skill: PracticeSkill;
  }[];
  notes: string;
};

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
    improvisation: 0,
  } satisfies Record<PracticeSkill, number>;

  for (const phase of phases) {
    skillSeconds[phase.skill] += phase.elapsedSeconds;
  }

  return {
    id: crypto.randomUUID(),
    title: input.title.trim() || "Práctica manual",
    startedAt: startedAt.toISOString(),
    durationSeconds,
    averageBpm: 0,
    completed: true,
    skillSeconds,
    notes: notes || undefined,
    phases,
  };
}
