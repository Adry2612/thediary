"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { TextField, TextArea } from "@/components/ui/Field";
import { SelectField } from "@/components/ui/SelectField";
import { TrashIcon } from "@/components/ui/icons";
import { PRACTICE_SKILL_LABELS } from "@/lib/dashboard-data";
import {
  applySessionEdit,
  toEditableSession,
  type EditableSession,
  type EditableSessionBlock,
} from "@/lib/practice-session-editing";
import { createId } from "@/lib/create-id";
import { PRACTICE_SKILLS, type SessionRecord } from "@/types/practice";

interface SessionEditorProps {
  session: SessionRecord;
  onSave: (session: SessionRecord) => void;
  onCancel: () => void;
}

const SKILL_OPTIONS = PRACTICE_SKILLS.map((skill) => ({
  value: skill,
  label: PRACTICE_SKILL_LABELS[skill],
}));

function toNumberInput(value: string): number {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

export function SessionEditor({ session, onSave, onCancel }: SessionEditorProps) {
  const [draft, setDraft] = useState<EditableSession>(() =>
    toEditableSession(session),
  );
  const [error, setError] = useState<string | null>(null);

  const derivedMinutes = draft.blocks.reduce(
    (total, block) => total + block.actualMinutes,
    0,
  );

  function updateBlock(
    blockId: EditableSessionBlock["id"],
    changes: Partial<EditableSessionBlock>,
  ) {
    setDraft((current) => ({
      ...current,
      blocks: current.blocks.map((block) =>
        block.id === blockId ? { ...block, ...changes } : block,
      ),
    }));
  }

  function addBlock() {
    setDraft((current) => ({
      ...current,
      blocks: [
        ...current.blocks,
        {
          id: createId(),
          name: "",
          skill: "technique",
          plannedMinutes: null,
          actualMinutes: 0,
          notes: "",
        },
      ],
    }));
  }

  function removeBlock(blockId: EditableSessionBlock["id"]) {
    setDraft((current) => ({
      ...current,
      blocks: current.blocks.filter((block) => block.id !== blockId),
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (draft.blocks.some((block) => !block.name.trim())) {
      setError("Cada bloque necesita un nombre.");
      return;
    }
    if (draft.blocks.length === 0 && draft.durationMinutes <= 0) {
      setError("Indica una duración mayor que cero.");
      return;
    }
    setError(null);
    onSave(applySessionEdit(session, draft));
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-accent-green-fg/40 bg-surface p-6 sm:p-8"
    >
      <h2 className="text-xl font-semibold text-ink sm:text-2xl">
        Editar práctica
      </h2>

      <label className="mt-5 block text-xs text-muted">
        Nombre de la sesión
        <TextField
          value={draft.title}
          maxLength={80}
          onChange={(event) =>
            setDraft((current) => ({ ...current, title: event.target.value }))
          }
          className="mt-1"
        />
      </label>

      <label className="mt-4 block text-xs text-muted">
        Notas de la sesión
        <TextArea
          value={draft.notes}
          onChange={(event) =>
            setDraft((current) => ({ ...current, notes: event.target.value }))
          }
          className="mt-1"
        />
      </label>

      <section className="mt-6 border-t border-line pt-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h3 className="text-base font-semibold text-ink">
            Bloques de práctica
          </h3>
          <span className="font-mono text-xs text-muted">
            {draft.blocks.length > 0
              ? `${derivedMinutes} min reales`
              : "Sin bloques"}
          </span>
        </div>

        {draft.blocks.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            Esta práctica no tiene bloques. Puedes añadirlos o dejar solo una
            duración.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {draft.blocks.map((block, index) => (
              <li
                key={block.id}
                className="rounded-lg border border-line bg-canvas/60 p-4"
              >
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted">
                    Bloque {index + 1}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeBlock(block.id)}
                    className="inline-flex items-center gap-1 text-xs text-red-300 underline underline-offset-4 hover:text-red-200"
                  >
                    <TrashIcon className="size-3.5" />
                    Quitar bloque
                  </button>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="block text-xs text-muted">
                    Nombre del bloque
                    <TextField
                      value={block.name}
                      maxLength={80}
                      onChange={(event) =>
                        updateBlock(block.id, { name: event.target.value })
                      }
                      className="mt-1"
                    />
                  </label>
                  <div className="block text-xs text-muted">
                    Categoría
                    <SelectField
                      className="mt-1"
                      ariaLabel={`Categoría del bloque ${index + 1}`}
                      value={block.skill}
                      options={SKILL_OPTIONS}
                      onChange={(value) =>
                        updateBlock(block.id, {
                          skill: value as EditableSessionBlock["skill"],
                        })
                      }
                    />
                  </div>
                  <label className="block text-xs text-muted">
                    Tiempo real (min)
                    <TextField
                      type="number"
                      min={0}
                      step={0.5}
                      value={String(block.actualMinutes)}
                      onChange={(event) =>
                        updateBlock(block.id, {
                          actualMinutes: toNumberInput(event.target.value),
                        })
                      }
                      className="mt-1"
                    />
                  </label>
                  <label className="block text-xs text-muted">
                    Tiempo planificado (min)
                    <TextField
                      type="number"
                      min={0}
                      step={1}
                      value={
                        block.plannedMinutes === null
                          ? ""
                          : String(block.plannedMinutes)
                      }
                      onChange={(event) =>
                        updateBlock(block.id, {
                          plannedMinutes:
                            event.target.value === ""
                              ? null
                              : toNumberInput(event.target.value),
                        })
                      }
                      className="mt-1"
                    />
                  </label>
                </div>
              </li>
            ))}
          </ul>
        )}

        {draft.blocks.length === 0 && (
          <label className="mt-4 block max-w-48 text-xs text-muted">
            Duración (min)
            <TextField
              type="number"
              min={0}
              step={1}
              value={String(draft.durationMinutes)}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  durationMinutes: toNumberInput(event.target.value),
                }))
              }
              className="mt-1"
            />
          </label>
        )}

        <Button type="button" size="field" onClick={addBlock} className="mt-4">
          Añadir bloque
        </Button>
      </section>

      <label className="mt-5 flex items-center gap-3 text-sm text-ink">
        <input
          type="checkbox"
          checked={draft.completed}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              completed: event.target.checked,
            }))
          }
          className="size-4 accent-current"
        />
        Práctica completada
      </label>

      {error && (
        <p className="mt-4 text-sm text-red-300" role="alert">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-line pt-5">
        <Button type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          Guardar cambios
        </Button>
      </div>
    </form>
  );
}
