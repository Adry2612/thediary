"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { TextField, TextArea } from "@/components/ui/Field";
import { SelectField } from "@/components/ui/SelectField";
import { TrashIcon } from "@/components/ui/icons";
import { PracticeBlockLinkFields } from "@/components/practice/PracticeBlockLinkFields";
import { PracticeBlockNotesField } from "@/components/practice/PracticeBlockNotesField";
import { PRACTICE_SKILL_LABELS } from "@/utils/dashboard-data";
import {
  applySessionEdit,
  toEditableSession,
  type EditableSession,
  type EditableSessionBlock,
} from "@/utils/practice-session-editing";
import {
  applySessionClockDrafts,
  createSessionClockDrafts,
  type SessionClockDrafts,
} from "@/utils/practice-session-editor";
import { formatClockInput, parseClockInput } from "@/utils/clock-time";
import { createId } from "@/utils/create-id";
import { usePracticeStore } from "@/stores/usePracticeStore";
import { useI18nSection } from "@/i18n/I18nProvider";
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

interface EditorState {
  draft: EditableSession;
  clocks: SessionClockDrafts;
  fieldErrors: Record<string, string>;
}

function createEditorState(session: SessionRecord): EditorState {
  const draft = toEditableSession(session);
  return {
    draft,
    clocks: createSessionClockDrafts(draft),
    fieldErrors: {},
  };
}

export function SessionEditor({ session, onSave, onCancel }: SessionEditorProps) {
  const [state, setState] = useState<EditorState>(() =>
    createEditorState(session),
  );
  const guitars = usePracticeStore((state) => state.guitars);
  const repertoireItems = usePracticeStore((state) => state.repertoireItems);
  const licks = usePracticeStore((state) => state.licks);
  const practiceText = useI18nSection("practice");
  const [error, setError] = useState<string | null>(null);
  const { draft, clocks, fieldErrors } = state;
  const repertoireSongs = repertoireItems.filter(
    (item) => item.kind === "song",
  );

  const derivedSeconds = draft.blocks.reduce(
    (total, block) => total + block.actualSeconds,
    0,
  );

  function updateBlock(
    blockId: EditableSessionBlock["id"],
    changes: Partial<EditableSessionBlock>,
  ) {
    setState((current) => ({
      ...current,
      draft: {
        ...current.draft,
        blocks: current.draft.blocks.map((block) =>
          block.id === blockId ? { ...block, ...changes } : block,
        ),
      },
    }));
  }

  function updateBlockClock(blockId: EditableSessionBlock["id"], value: string) {
    setState((current) => {
      const clocks = {
        ...current.clocks,
        blocks: { ...current.clocks.blocks, [blockId]: value },
      };
      const parsed = value.trim() === "" ? 0 : parseClockInput(value);
      if (parsed === null) return { ...current, clocks };

      return {
        ...current,
        clocks,
        draft: {
          ...current.draft,
          blocks: current.draft.blocks.map((block) =>
            block.id === blockId ? { ...block, actualSeconds: parsed } : block,
          ),
        },
        fieldErrors: { ...current.fieldErrors, [`block:${blockId}`]: "" },
      };
    });
  }

  function validateBlockClock(blockId: EditableSessionBlock["id"]) {
    setState((current) => {
      const value = current.clocks.blocks[blockId] ?? "";
      const fieldErrors = { ...current.fieldErrors };
      if (value.trim() !== "" && parseClockInput(value) === null) {
        fieldErrors[`block:${blockId}`] = practiceText.clockTimeInvalid;
      } else {
        delete fieldErrors[`block:${blockId}`];
      }
      return { ...current, fieldErrors };
    });
  }

  function updateDurationClock(value: string) {
    setState((current) => {
      const clocks = { ...current.clocks, duration: value };
      const parsed = value.trim() === "" ? 0 : parseClockInput(value);
      if (parsed === null) return { ...current, clocks };

      return {
        ...current,
        clocks,
        draft: { ...current.draft, durationSeconds: parsed },
        fieldErrors: { ...current.fieldErrors, duration: "" },
      };
    });
  }

  function validateDurationClock() {
    setState((current) => {
      const value = current.clocks.duration;
      const fieldErrors = { ...current.fieldErrors };
      if (value.trim() !== "" && parseClockInput(value) === null) {
        fieldErrors.duration = practiceText.clockTimeInvalid;
      } else {
        delete fieldErrors.duration;
      }
      return { ...current, fieldErrors };
    });
  }

  function addBlock() {
    const id = createId();
    setState((current) => ({
      ...current,
      draft: {
        ...current.draft,
        blocks: [
          ...current.draft.blocks,
          {
            id,
            name: "",
            skill: "technique",
            plannedMinutes: null,
            actualSeconds: 0,
            notes: "",
            repertoirePartIds: [],
          },
        ],
      },
      clocks: {
        ...current.clocks,
        blocks: { ...current.clocks.blocks, [id]: "0:00" },
      },
    }));
  }

  function removeBlock(blockId: EditableSessionBlock["id"]) {
    setState((current) => {
      const blocks = { ...current.clocks.blocks };
      delete blocks[blockId];
      const nextErrors = { ...current.fieldErrors };
      delete nextErrors[`block:${blockId}`];
      return {
        ...current,
        draft: {
          ...current.draft,
          blocks: current.draft.blocks.filter((block) => block.id !== blockId),
        },
        clocks: { ...current.clocks, blocks },
        fieldErrors: nextErrors,
      };
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = applySessionClockDrafts(draft, clocks);
    if (Object.keys(parsed.errors).length > 0) {
      setState((current) => ({
        ...current,
        fieldErrors: {
          ...current.fieldErrors,
          ...Object.fromEntries(
            Object.keys(parsed.errors).map((key) => [
              key,
              practiceText.clockTimeInvalid,
            ]),
          ),
        },
      }));
      setError(practiceText.clockTimeInvalid);
      return;
    }

    if (parsed.session.blocks.some((block) => !block.name.trim())) {
      setError("Cada bloque necesita un nombre.");
      return;
    }
    if (
      parsed.session.blocks.length === 0 &&
      parsed.session.durationSeconds <= 0
    ) {
      setError("Indica una duración mayor que cero.");
      return;
    }
    setError(null);
    onSave(applySessionEdit(session, parsed.session));
  }

  return (
    <form
      noValidate
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
            setState((current) => ({
              ...current,
              draft: { ...current.draft, title: event.target.value },
            }))
          }
          className="mt-1"
        />
      </label>

      <label className="mt-4 block text-xs text-muted">
        Notas de la sesión
        <TextArea
          value={draft.notes}
          onChange={(event) =>
            setState((current) => ({
              ...current,
              draft: { ...current.draft, notes: event.target.value },
            }))
          }
          className="mt-1"
        />
      </label>

      <div className="mt-4 block max-w-56 text-xs text-muted">
        Tipo de guitarra
        <SelectField
          className="mt-1"
          ariaLabel="Tipo de guitarra"
          value={draft.guitarType ?? "unspecified"}
          options={[
            { value: "unspecified", label: "Sin especificar" },
            { value: "electric", label: "Eléctrica" },
            { value: "acoustic", label: "Acústica" },
          ]}
          onChange={(value) =>
            setState((current) => ({
              ...current,
              draft: {
                ...current.draft,
                guitarType:
                  value === "electric" || value === "acoustic" ? value : null,
              },
            }))
          }
        />
      </div>

      {guitars.length > 1 && (
        <div className="mt-4 block max-w-56 text-xs text-muted">
          {practiceText.guitar}
          <SelectField
            className="mt-1"
            ariaLabel={practiceText.guitarAria}
            value={draft.guitarId ?? "none"}
            options={[
              { value: "none", label: practiceText.guitarNone },
              ...guitars.map((guitar) => ({
                value: guitar.id,
                label: guitar.name,
              })),
            ]}
            onChange={(value) =>
              setState((current) => ({
                ...current,
                draft: {
                  ...current.draft,
                  guitarId: value === "none" ? null : value,
                },
              }))
            }
          />
        </div>
      )}

      <section className="mt-6 border-t border-line pt-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h3 className="text-base font-semibold text-ink">
            Bloques de práctica
          </h3>
          <span className="font-mono text-xs text-muted">
            {draft.blocks.length > 0
              ? `${formatClockInput(derivedSeconds)} ${practiceText.realTotalSuffix}`
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
                  <PracticeBlockLinkFields
                    index={index}
                    value={block}
                    songs={repertoireSongs}
                    licks={licks}
                    onChange={(changes) => updateBlock(block.id, changes)}
                  />
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
                          ...(value === "repertoire"
                            ? {}
                            : {
                                repertoireItemId: undefined,
                                repertoirePartId: undefined,
                                repertoirePartIds: undefined,
                                catalogSong: undefined,
                              }),
                          ...(value === "lick" ? {} : { lickId: undefined }),
                        })
                      }
                    />
                  </div>
                  <label className="block text-xs text-muted">
                    {practiceText.actualTime}
                    <TextField
                      type="text"
                      inputMode="numeric"
                      value={clocks.blocks[block.id] ?? ""}
                      onChange={(event) =>
                        updateBlockClock(block.id, event.target.value)
                      }
                      onBlur={() => validateBlockClock(block.id)}
                      aria-invalid={Boolean(fieldErrors[`block:${block.id}`])}
                      className="mt-1 font-mono"
                    />
                    {fieldErrors[`block:${block.id}`] ? (
                      <span
                        role="alert"
                        className="mt-1 block text-xs text-red-300"
                      >
                        {fieldErrors[`block:${block.id}`]}
                      </span>
                    ) : null}
                  </label>
                  <label className="block text-xs text-muted">
                    {practiceText.plannedTime}
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
                <PracticeBlockNotesField
                  value={block.notes}
                  ariaLabelSuffix={`Bloque ${index + 1}`}
                  onChange={(notes) => updateBlock(block.id, { notes })}
                />
              </li>
            ))}
          </ul>
        )}

        {draft.blocks.length === 0 && (
          <label className="mt-4 block max-w-48 text-xs text-muted">
            {practiceText.sessionDuration}
            <TextField
              type="text"
              inputMode="numeric"
              value={clocks.duration}
              onChange={(event) => updateDurationClock(event.target.value)}
              onBlur={validateDurationClock}
              aria-invalid={Boolean(fieldErrors.duration)}
              className="mt-1 font-mono"
            />
            {fieldErrors.duration ? (
              <span role="alert" className="mt-1 block text-xs text-red-300">
                {fieldErrors.duration}
              </span>
            ) : null}
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
            setState((current) => ({
              ...current,
              draft: { ...current.draft, completed: event.target.checked },
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
