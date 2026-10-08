"use client";

import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { TextArea, TextField } from "@/components/ui/Field";
import { SelectField } from "@/components/ui/SelectField";
import { PRACTICE_SKILL_LABELS } from "@/lib/dashboard-data";
import { createManualPracticeRecord } from "@/lib/manual-practice";
import { usePracticeStore } from "@/stores/usePracticeStore";
import { PRACTICE_SKILLS, type PracticeSkill } from "@/types/practice";

type ManualPracticeBlockDraft = {
  id: string;
  name: string;
  durationMinutes: string;
  skill: PracticeSkill;
};

const SKILL_OPTIONS = PRACTICE_SKILLS.map((skill) => ({
  value: skill,
  label: PRACTICE_SKILL_LABELS[skill],
}));

function createBlockDraft(): ManualPracticeBlockDraft {
  return {
    id: crypto.randomUUID(),
    name: "",
    durationMinutes: "30",
    skill: "technique",
  };
}

function toLocalDateTimeInputValue(date: Date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}

export function ManualPracticeEntry() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const addSession = usePracticeStore((state) => state.addSession);
  const hasHydrated = usePracticeStore((state) => state.hasHydrated);
  const [title, setTitle] = useState("");
  const [startedAtLocal, setStartedAtLocal] = useState(() =>
    toLocalDateTimeInputValue(new Date()),
  );
  const [blocks, setBlocks] = useState(() => [createBlockDraft()]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const totalMinutes = blocks.reduce((total, block) => {
    const duration = Number(block.durationMinutes);
    return Number.isSafeInteger(duration) && duration > 0
      ? total + duration
      : total;
  }, 0);

  function openDialog() {
    setStartedAtLocal(toLocalDateTimeInputValue(new Date()));
    setError(null);
    dialogRef.current?.showModal();
  }

  function updateBlock(
    blockId: string,
    changes: Partial<Omit<ManualPracticeBlockDraft, "id">>,
  ) {
    setBlocks((current) =>
      current.map((block) =>
        block.id === blockId ? { ...block, ...changes } : block,
      ),
    );
  }

  function saveManualPractice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      addSession(
        createManualPracticeRecord({
          title,
          startedAtLocal,
          blocks: blocks.map((block) => ({
            name: block.name,
            durationMinutes: Number(block.durationMinutes),
            skill: block.skill,
          })),
          notes,
        }),
      );
      setTitle("");
      setBlocks([createBlockDraft()]);
      setNotes("");
      dialogRef.current?.close();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo guardar la práctica manual.",
      );
    }
  }

  return (
    <>
      <Button type="button" onClick={openDialog} disabled={!hasHydrated}>
        Añadir práctica anterior
      </Button>
      <dialog
        ref={dialogRef}
        className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto border border-line bg-surface p-0 text-ink backdrop:bg-black/70"
      >
        <form onSubmit={saveManualPractice} className="p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.05em] text-muted">
            Historial
          </p>
          <h2 className="mt-3 font-sans text-2xl font-semibold">
            Registrar práctica anterior
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Añade una sesión que hiciste sin usar el temporizador. Se incluirá
            en tu calendario y estadísticas.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm text-ink sm:col-span-2">
              Nombre de la práctica
              <TextField
                className="mt-2"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Práctica manual"
                maxLength={100}
              />
            </label>
            <label className="block text-sm text-ink sm:col-span-2">
              Fecha y hora
              <TextField
                className="mt-2 font-mono"
                type="datetime-local"
                value={startedAtLocal}
                onChange={(event) => setStartedAtLocal(event.target.value)}
                required
              />
            </label>
            <section className="sm:col-span-2">
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <h3 className="text-sm font-medium text-ink">
                  Bloques de práctica
                </h3>
                <p className="font-mono text-xs tabular-nums text-muted">
                  Total · {totalMinutes} min
                </p>
              </div>
              <div className="space-y-3">
                {blocks.map((block, index) => (
                  <fieldset
                    key={block.id}
                    className="border border-line bg-canvas/60 p-4"
                  >
                    <legend className="sr-only">
                      Bloque {index + 1} de práctica
                    </legend>
                    <div className="mb-3 flex items-center justify-between">
                      <p className="font-mono text-xs uppercase tracking-[0.08em] text-muted">
                        Bloque {String(index + 1).padStart(2, "0")}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setBlocks((current) =>
                            current.filter((candidate) => candidate.id !== block.id),
                          )
                        }
                        disabled={blocks.length === 1}
                        aria-label={`Quitar bloque ${index + 1}`}
                        className="text-xs text-muted underline underline-offset-4 transition hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Quitar
                      </button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block text-sm text-ink sm:col-span-2">
                        Nombre del bloque
                        <TextField
                          className="mt-2"
                          value={block.name}
                          onChange={(event) =>
                            updateBlock(block.id, { name: event.target.value })
                          }
                          placeholder="Técnica"
                          maxLength={100}
                          required
                        />
                      </label>
                      <label className="block text-sm text-ink">
                        Duración (minutos)
                        <TextField
                          className="mt-2"
                          type="number"
                          min="1"
                          max="240"
                          step="1"
                          value={block.durationMinutes}
                          onChange={(event) =>
                            updateBlock(block.id, {
                              durationMinutes: event.target.value,
                            })
                          }
                          required
                        />
                      </label>
                      <div className="block text-sm text-ink">
                        Tipo de práctica
                        <SelectField
                          className="mt-2"
                          value={block.skill}
                          onChange={(value) => {
                            const selectedSkill = PRACTICE_SKILLS.find(
                              (candidate) => candidate === value,
                            );
                            if (selectedSkill) {
                              updateBlock(block.id, { skill: selectedSkill });
                            }
                          }}
                          ariaLabel={`Tipo de práctica del bloque ${index + 1}`}
                          options={SKILL_OPTIONS}
                        />
                      </div>
                    </div>
                  </fieldset>
                ))}
              </div>
              <Button
                type="button"
                onClick={() => setBlocks((current) => [...current, createBlockDraft()])}
                className="mt-3 h-11 px-4"
              >
                Añadir bloque
              </Button>
            </section>
            <label className="block text-sm text-ink sm:col-span-2">
              Notas (opcional)
              <TextArea
                className="mt-2"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Qué trabajaste o cómo fue la práctica…"
                rows={3}
              />
            </label>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-300" role="alert">
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              onClick={() => dialogRef.current?.close()}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Guardar práctica
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
