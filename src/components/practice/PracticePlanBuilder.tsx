"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/Field";
import Link from "next/link";
import {
  getPracticeFileKind,
  normalizeSongsterrUrl,
  validatePracticeTemplate,
} from "@/lib/practice-templates";
import { savePracticeAsset } from "@/lib/practice-library";
import { usePracticeStore } from "@/stores/usePracticeStore";
import {
  PRACTICE_SKILLS,
  type PracticePhase,
  type PracticeResource,
  type PracticeSkill,
  type PracticeTemplate,
  type RepertoireItem,
} from "@/types/practice";

const SKILL_NAMES: Record<PracticeSkill, string> = {
  technique: "Técnica",
  theory: "Teoría",
  repertoire: "Repertorio",
  improvisation: "Improvisación",
};

type PracticePlanBuilderProps = {
  initialName?: string;
  initialPhases: PracticePhase[];
  onStart: (name: string, phases: PracticePhase[]) => void;
};

function createId() {
  return crypto.randomUUID();
}

function ExerciseListEditor({
  exercises,
  onChange,
}: {
  exercises: string[];
  onChange: (nextExercises: string[]) => void;
}) {
  const [newExercise, setNewExercise] = useState("");

  function addExercise(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const exercise = newExercise.trim();
    if (!exercise) return;
    onChange([...exercises, exercise]);
    setNewExercise("");
  }

  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-[0.05em] text-muted">
        Ejercicios
      </p>
      {exercises.length > 0 && (
        <ul className="mb-3 flex flex-wrap gap-2">
          {exercises.map((exercise, index) => (
            <li
              key={`${exercise}-${index}`}
              className="flex items-center gap-2 border border-line bg-canvas px-3 py-1.5 text-sm"
            >
              <span>{exercise}</span>
              <button
                type="button"
                onClick={() =>
                  onChange(exercises.filter((_, itemIndex) => itemIndex !== index))
                }
                aria-label={`Quitar ${exercise}`}
                className="text-muted hover:text-ink"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={addExercise} className="flex gap-2">
        <TextField
          value={newExercise}
          onChange={(event) => setNewExercise(event.target.value)}
          placeholder="p. ej. Sweep picking"
          aria-label="Nuevo ejercicio"
          className="flex-1"
        />
        <Button type="submit" aria-label="Añadir ejercicio">
          Añadir
        </Button>
      </form>
    </div>
  );
}

function PhaseEditor({
  phase,
  repertoireItems,
  onChange,
  onRemove,
  onAddResource,
  onRemoveResource,
}: {
  phase: PracticePhase;
  repertoireItems: RepertoireItem[];
  onChange: (changes: Partial<PracticePhase>) => void;
  onRemove: () => void;
  onAddResource: (resource: PracticeResource) => void;
  onRemoveResource: (resourceId: string) => void;
}) {
  const [songsterrUrl, setSongsterrUrl] = useState("");
  const [songsterrTitle, setSongsterrTitle] = useState("");
  const [resourceError, setResourceError] = useState<string | null>(null);
  const [isSavingFile, setIsSavingFile] = useState(false);
  const selectedPartExists = repertoireItems.some(
    (item) =>
      item.id === phase.repertoireItemId &&
      item.parts.some((part) => part.id === phase.repertoirePartId),
  );

  function addSongsterrLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const url = normalizeSongsterrUrl(songsterrUrl);
    if (!url) {
      setResourceError("Introduce un enlace HTTPS válido de Songsterr.");
      return;
    }

    onAddResource({
      id: createId(),
      title: songsterrTitle.trim() || "Tab de Songsterr",
      kind: "songsterr",
      url,
    });
    setSongsterrUrl("");
    setSongsterrTitle("");
    setResourceError(null);
  }

  async function addFile(file: File | undefined) {
    if (!file) return;
    const kind = getPracticeFileKind(file.name);
    if (!kind) {
      setResourceError("El archivo debe ser PDF o Guitar Pro (.gp, .gpx, .gp3–.gp5).");
      return;
    }

    setIsSavingFile(true);
    setResourceError(null);
    try {
      const assetId = createId();
      await savePracticeAsset({ id: assetId, fileName: file.name, kind, blob: file });
      onAddResource({
        id: createId(),
        title: file.name,
        kind,
        fileName: file.name,
        assetId,
      });
    } catch (error) {
      setResourceError(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el archivo en este dispositivo.",
      );
    } finally {
      setIsSavingFile(false);
    }
  }

  return (
    <fieldset className="border-t border-line pt-5">
      <legend className="sr-only">{phase.name || "Etapa"} de práctica</legend>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_7rem_11rem_auto]">
        <label className="text-xs text-muted">
          Nombre del bloque
          <TextField
            value={phase.name}
            onChange={(event) => onChange({ name: event.target.value })}
            placeholder="Técnica"
            className="mt-1"
          />
        </label>
        <label className="text-xs text-muted">
          Minutos
          <TextField
            type="number"
            min={1}
            max={240}
            step={1}
            value={phase.durationMinutes}
            onChange={(event) =>
              onChange({ durationMinutes: Number(event.target.value) })
            }
            className="mt-1 font-mono"
          />
        </label>
        <label className="text-xs text-muted">
          Categoría
          <select
            value={phase.skill}
            onChange={(event) =>
              onChange({ skill: event.target.value as PracticeSkill })
            }
            className="mt-1 h-11 w-full border border-line bg-canvas px-3 text-sm text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink/60"
          >
            {PRACTICE_SKILLS.map((skill) => (
              <option key={skill} value={skill}>
                {SKILL_NAMES[skill]}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <Button
            type="button"
            onClick={onRemove}
            aria-label={`Quitar bloque ${phase.name || "sin nombre"}`}
            className="h-11 px-3"
          >
            Quitar
          </Button>
        </div>
      </div>

      <label className="mt-4 block text-xs text-muted">
        Parte del repertorio
        <select
          value={phase.repertoirePartId ?? ""}
          onChange={(event) => {
            const selectedPartId = event.target.value;
            const item = repertoireItems.find((candidate) =>
              candidate.parts.some((part) => part.id === selectedPartId),
            );
            const part = item?.parts.find(
              (candidate) => candidate.id === selectedPartId,
            );
            onChange({
              repertoireItemId: item?.id,
              repertoirePartId: part?.id,
            });
          }}
          className="mt-1 h-12 w-full rounded-md border border-line bg-canvas px-4 text-sm text-ink transition-colors hover:border-white/20 focus-visible:border-accent-green-fg/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green-bg"
        >
          <option value="">Sin vincular</option>
          {phase.repertoirePartId && !selectedPartExists && (
            <option value={phase.repertoirePartId} disabled>
              La referencia guardada ya no existe
            </option>
          )}
          {repertoireItems.map((item) => (
            <optgroup
              key={item.id}
              label={`${item.kind === "song" ? "Canción" : "Lick"} · ${item.title}`}
            >
              {item.parts.map((part) => (
                <option key={part.id} value={part.id}>
                  {part.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {repertoireItems.length === 0 && (
          <span className="mt-2 block leading-relaxed">
            Añade canciones o licks desde{" "}
            <Link
              href="/repertoire"
              className="text-ink underline decoration-line underline-offset-4"
            >
              Mi repertorio
            </Link>{" "}
            para poder registrar el tiempo por parte.
          </span>
        )}
      </label>

      <div className="mt-5">
        <ExerciseListEditor
          exercises={phase.exercises ?? []}
          onChange={(exercises) => onChange({ exercises })}
        />
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs uppercase tracking-[0.05em] text-muted">
          Tablaturas y partituras
        </p>
        {phase.resources && phase.resources.length > 0 && (
          <ul className="mb-3 space-y-2">
            {phase.resources.map((resource) => (
              <li
                key={resource.id}
                className="flex items-center justify-between gap-3 border border-line px-3 py-2 text-sm"
              >
                <span className="min-w-0 truncate">
                  {resource.title}
                  <span className="ml-2 text-xs text-muted">
                    {resource.kind === "songsterr"
                      ? "Songsterr"
                      : resource.kind === "pdf"
                        ? "PDF"
                        : "Guitar Pro"}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveResource(resource.id)}
                  aria-label={`Quitar ${resource.title}`}
                  className="shrink-0 text-xs text-muted hover:text-ink"
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={addSongsterrLink} className="grid gap-2 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_auto]">
          <TextField
            value={songsterrTitle}
            onChange={(event) => setSongsterrTitle(event.target.value)}
            placeholder="Nombre de la canción"
            aria-label="Nombre del material de Songsterr"
            className="min-w-0"
          />
          <TextField
            type="url"
            value={songsterrUrl}
            onChange={(event) => setSongsterrUrl(event.target.value)}
            placeholder="https://www.songsterr.com/…"
            aria-label="Enlace de Songsterr"
            className="min-w-0"
          />
          <Button type="submit">Añadir enlace</Button>
        </form>
        <label className="mt-2 inline-flex h-11 cursor-pointer items-center border border-line px-4 text-sm transition hover:bg-white/5">
          {isSavingFile ? "Guardando archivo…" : "Subir PDF o Guitar Pro"}
          <input
            type="file"
            accept=".pdf,.gp,.gpx,.gp3,.gp4,.gp5"
            className="sr-only"
            disabled={isSavingFile}
            onChange={(event) => {
              void addFile(event.target.files?.[0]);
              event.currentTarget.value = "";
            }}
          />
        </label>
        {resourceError && (
          <p className="mt-2 text-sm text-red-300" role="alert">
            {resourceError}
          </p>
        )}
      </div>
    </fieldset>
  );
}

function clonePhases(phases: PracticePhase[]) {
  return phases.map((phase) => ({
    ...phase,
    exercises: [...(phase.exercises ?? [])],
    resources: (phase.resources ?? []).map((resource) => ({ ...resource })),
  }));
}

export function PracticePlanBuilder({
  initialName = "Mi sesión",
  initialPhases,
  onStart,
}: PracticePlanBuilderProps) {
  const templates = usePracticeStore((state) => state.templates);
  const saveTemplate = usePracticeStore((state) => state.saveTemplate);
  const deleteTemplate = usePracticeStore((state) => state.deleteTemplate);
  const repertoireItems = usePracticeStore((state) => state.repertoireItems);
  const [name, setName] = useState(initialName);
  const [phases, setPhases] = useState(() => clonePhases(initialPhases));
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [error, setError] = useState<string | null>(null);

  function updatePhase(phaseId: PracticePhase["id"], changes: Partial<PracticePhase>) {
    setPhases((current) =>
      current.map((phase) =>
        phase.id === phaseId ? { ...phase, ...changes } : phase,
      ),
    );
  }

  function updatePhaseResources(
    phaseId: PracticePhase["id"],
    update: (resources: PracticeResource[]) => PracticeResource[],
  ) {
    setPhases((current) =>
      current.map((phase) =>
        phase.id === phaseId
          ? { ...phase, resources: update(phase.resources ?? []) }
          : phase,
      ),
    );
  }

  function selectTemplate(template: PracticeTemplate) {
    setSelectedTemplateId(template.id);
    setName(template.name);
    setPhases(clonePhases(template.phases));
    setError(null);
  }

  function createPhase() {
    setPhases((current) => [
      ...current,
      {
        id: createId(),
        name: "",
        durationMinutes: 5,
        skill: "technique",
        exercises: [],
        resources: [],
      },
    ]);
  }

  function validateCurrentPlan() {
    const validationError = validatePracticeTemplate(name, phases);
    if (validationError) {
      setError(
        validationError === "name"
          ? "Escribe un nombre de hasta 80 caracteres."
          : validationError === "phases"
            ? "Añade al menos un bloque."
            : "Revisa los nombres, minutos y categorías de los bloques.",
      );
      return false;
    }
    setError(null);
    return true;
  }

  function handleSaveTemplate() {
    if (!validateCurrentPlan()) return;
    const templateId = selectedTemplateId || createId();
    saveTemplate({
      id: templateId,
      name: name.trim(),
      phases: clonePhases(phases),
      updatedAt: new Date().toISOString(),
    });
    setSelectedTemplateId(templateId);
  }

  function handleStart() {
    if (!validateCurrentPlan()) return;
    onStart(name.trim(), clonePhases(phases));
  }

  function removeTemplate() {
    if (!selectedTemplateId) return;
    deleteTemplate(selectedTemplateId);
    setSelectedTemplateId("");
  }

  return (
    <Card className="enter">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.05em] text-muted">
            Preparar práctica
          </p>
          <h2 className="mt-2 font-serif text-3xl tracking-[-0.02em]">
            Diseña tus bloques
          </h2>
        </div>
        {templates.length > 0 && (
          <label className="min-w-52 flex-1 text-xs text-muted sm:max-w-64">
            Plantilla guardada
            <select
              value={selectedTemplateId}
              onChange={(event) => {
                const template = templates.find(
                  (item) => item.id === event.target.value,
                );
                if (template) selectTemplate(template);
                else setSelectedTemplateId("");
              }}
              className="mt-1 h-12 w-full rounded-md border border-line bg-canvas px-4 text-sm text-ink transition-colors hover:border-white/20 focus-visible:border-accent-green-fg/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green-bg"
            >
              <option value="">Plan nuevo</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <label className="mt-6 block text-xs text-muted">
        Nombre de la sesión
        <TextField
          value={name}
          maxLength={80}
          onChange={(event) => setName(event.target.value)}
          className="mt-1"
        />
      </label>

      <div className="mt-6 space-y-6">
        {phases.map((phase, index) => (
          <PhaseEditor
            key={phase.id}
            phase={phase}
            repertoireItems={repertoireItems}
            onChange={(changes) => updatePhase(phase.id, changes)}
            onRemove={() =>
              setPhases((current) =>
                current.filter((item) => item.id !== phase.id),
              )
            }
            onAddResource={(resource) =>
              updatePhaseResources(phase.id, (resources) => [
                ...resources,
                resource,
              ])
            }
            onRemoveResource={(resourceId) =>
              updatePhaseResources(phase.id, (resources) =>
                resources.filter((item) => item.id !== resourceId),
              )
            }
          />
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
        <Button type="button" onClick={createPhase}>
          Añadir bloque
        </Button>
        <div className="flex flex-wrap gap-2">
          {selectedTemplateId && (
            <Button type="button" onClick={removeTemplate}>
              Eliminar plantilla
            </Button>
          )}
          <Button type="button" onClick={handleSaveTemplate}>
            Guardar plantilla
          </Button>
          <Button type="button" variant="primary" onClick={handleStart}>
            Iniciar sesión
          </Button>
        </div>
      </div>
      <p className="mt-3 text-right font-mono text-xs text-muted">
        {phases.reduce((total, phase) => total + (phase.durationMinutes || 0), 0)}{" "}
        min en total
      </p>
      {error && (
        <p className="mt-3 text-sm text-red-300" role="alert">
          {error}
        </p>
      )}
      <p className="mt-5 text-xs leading-6 text-muted">
        Las plantillas y archivos se guardan en este navegador. Los enlaces de
        Songsterr requieren conexión a internet.
      </p>
    </Card>
  );
}
