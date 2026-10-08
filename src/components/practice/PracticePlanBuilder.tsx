"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/Field";
import { SelectField } from "@/components/ui/SelectField";
import { PracticePhaseEditor } from "@/components/practice/PracticePhaseEditor";
import {
  clonePracticePhases,
  createPracticePhase,
  getPracticePlanDuration,
} from "@/lib/practice-plan";
import {
  validatePracticeTemplate,
  type PracticeTemplateValidationError,
} from "@/lib/practice-templates";
import { usePracticeStore } from "@/stores/usePracticeStore";
import type { PracticePhase, PracticeTemplate } from "@/types/practice";

interface PracticePlanBuilderProps {
  initialName?: string;
  initialPhases: PracticePhase[];
  onStart: (name: string, phases: PracticePhase[]) => void;
}

const VALIDATION_MESSAGES: Record<PracticeTemplateValidationError, string> = {
  name: "Escribe un nombre de hasta 80 caracteres.",
  phases: "Añade al menos un bloque.",
  phase: "Revisa los nombres, minutos y categorías de los bloques.",
};

function createId() {
  return crypto.randomUUID();
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
  const [phases, setPhases] = useState(() =>
    clonePracticePhases(initialPhases),
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const updatePhase = useCallback(
    (phaseId: PracticePhase["id"], changes: Partial<PracticePhase>) => {
      setPhases((current) =>
        current.map((phase) =>
          phase.id === phaseId ? { ...phase, ...changes } : phase,
        ),
      );
    },
    [],
  );

  const removePhase = useCallback((phaseId: PracticePhase["id"]) => {
    setPhases((current) =>
      current.filter((phase) => phase.id !== phaseId),
    );
  }, []);

  function selectTemplate(template: PracticeTemplate) {
    setSelectedTemplateId(template.id);
    setName(template.name);
    setPhases(clonePracticePhases(template.phases));
    setError(null);
  }

  function createPhase() {
    setPhases((current) => [
      ...current,
      createPracticePhase(createId()),
    ]);
  }

  function validateCurrentPlan() {
    const validationError = validatePracticeTemplate(name, phases);
    if (!validationError) {
      setError(null);
      return true;
    }

    setError(VALIDATION_MESSAGES[validationError]);
    return false;
  }

  function handleSaveTemplate() {
    if (!validateCurrentPlan()) return;

    const templateId = selectedTemplateId || createId();
    saveTemplate({
      id: templateId,
      name: name.trim(),
      phases: clonePracticePhases(phases),
      updatedAt: new Date().toISOString(),
    });
    setSelectedTemplateId(templateId);
  }

  function handleStart() {
    if (!validateCurrentPlan()) return;
    onStart(name.trim(), clonePracticePhases(phases));
  }

  function removeTemplate() {
    if (!selectedTemplateId) return;
    deleteTemplate(selectedTemplateId);
    setSelectedTemplateId("");
  }

  return (
    <Card className="enter">
      <div data-tour-target="practice-plan">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.05em] text-muted">
              Preparar práctica
            </p>
            <h2 className="mt-2 font-sans text-lg leading-7 font-semibold tracking-tight sm:text-xl sm:leading-8">
              Diseña tus bloques
            </h2>
          </div>
          {templates.length > 0 && (
            <div className="min-w-52 flex-1 text-xs text-muted sm:max-w-64">
              Plantilla guardada
              <SelectField
                className="mt-1"
                value={selectedTemplateId}
                ariaLabel="Plantilla guardada"
                onChange={(templateId) => {
                  const template = templates.find(
                    (candidate) => candidate.id === templateId,
                  );
                  if (template) {
                    selectTemplate(template);
                    return;
                  }
                  setSelectedTemplateId("");
                }}
                options={[
                  { value: "", label: "Plan nuevo" },
                  ...templates.map((template) => ({
                    value: template.id,
                    label: template.name,
                  })),
                ]}
              />
            </div>
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
      </div>

      <div className="mt-6 space-y-4">
        {phases.map((phase, index) => (
          <PracticePhaseEditor
            key={phase.id}
            phase={phase}
            index={index}
            repertoireItems={repertoireItems}
            onChange={updatePhase}
            onRemove={removePhase}
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
        {getPracticePlanDuration(phases)} min en total
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
