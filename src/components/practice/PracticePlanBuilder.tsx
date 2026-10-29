"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { TrashIcon } from "@/components/ui/icons";
import { TextField } from "@/components/ui/Field";
import { SelectField } from "@/components/ui/SelectField";
import { PracticePhaseEditor } from "@/components/practice/PracticePhaseEditor";
import {
  clonePracticePhases,
  createPracticePhase,
  getPracticePlanDuration,
  normalizeRepertoirePhaseNames,
} from "@/utils/practice-plan";
import {
  validatePracticeTemplate,
  type PracticeTemplateValidationError,
} from "@/utils/practice-templates";
import { usePracticeStore } from "@/stores/usePracticeStore";
import { useGuitarPreference } from "@/hooks/useGuitarPreference";
import { usePracticeGuitar } from "@/hooks/usePracticeGuitar";
import type { GuitarType, PracticePhase, PracticeTemplate } from "@/types/practice";
import { useI18nSection } from "@/i18n/I18nProvider";
import { createId } from "@/utils/create-id";

interface PracticePlanBuilderProps {
  initialName?: string;
  initialPhases: PracticePhase[];
  initialGuitarType?: GuitarType;
  initialGuitarId?: string;
  initialTemplateId?: string;
  onStart: (
    name: string,
    phases: PracticePhase[],
    guitarType?: GuitarType,
    guitarId?: string,
  ) => void;
}

export function PracticePlanBuilder({
  initialName = "Mi sesión",
  initialPhases,
  initialGuitarType,
  initialGuitarId,
  initialTemplateId,
  onStart,
}: PracticePlanBuilderProps) {
  const text = useI18nSection("practice");
  const templates = usePracticeStore((state) => state.templates);
  const saveTemplate = usePracticeStore((state) => state.saveTemplate);
  const deleteTemplate = usePracticeStore((state) => state.deleteTemplate);
  const repertoireItems = usePracticeStore((state) => state.repertoireItems);
  const licks = usePracticeStore((state) => state.licks);
  const guitars = usePracticeStore((state) => state.guitars);
  const { lastGuitarType, rememberGuitarType } = useGuitarPreference();
  const [name, setName] = useState(initialName);
  const [phases, setPhases] = useState(() =>
    normalizeRepertoirePhaseNames(
      clonePracticePhases(initialPhases),
      repertoireItems,
    ),
  );
  const [guitarType, setGuitarType] = useState<GuitarType | undefined>(
    initialGuitarType,
  );
  const {
    guitarId,
    setGuitarId,
    rememberGuitar,
    showSelector: showGuitarSelector,
  } = usePracticeGuitar({ explicitId: initialGuitarId, guitars });
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const appliedTemplateRef = useRef<string | null>(null);
  const guitarTouchedRef = useRef(Boolean(initialGuitarType));
  const guitarOptions = [
    { value: "unspecified", label: text.guitarUnspecified },
    { value: "electric", label: text.guitarElectric },
    { value: "acoustic", label: text.guitarAcoustic },
  ];

  useEffect(() => {
    if (guitarTouchedRef.current || initialTemplateId || !lastGuitarType) {
      return;
    }
    setGuitarType(lastGuitarType);
  }, [initialTemplateId, lastGuitarType]);

  useEffect(() => {
    if (!initialTemplateId || appliedTemplateRef.current === initialTemplateId) {
      return;
    }
    const template = templates.find(
      (candidate) => candidate.id === initialTemplateId,
    );
    if (!template) return;

    appliedTemplateRef.current = initialTemplateId;
    setSelectedTemplateId(template.id);
    setName(template.name);
    setPhases(
      normalizeRepertoirePhaseNames(
        clonePracticePhases(template.phases),
        repertoireItems,
      ),
    );
    setGuitarType(template.guitarType ?? lastGuitarType ?? undefined);
    guitarTouchedRef.current = true;
    setError(null);
  }, [initialTemplateId, lastGuitarType, repertoireItems, templates]);

  useEffect(() => {
    setPhases((current) =>
      normalizeRepertoirePhaseNames(current, repertoireItems),
    );
  }, [repertoireItems]);

  useEffect(() => {
    if (saveFeedback?.type !== "success") return;
    const timeout = setTimeout(() => setSaveFeedback(null), 3000);
    return () => clearTimeout(timeout);
  }, [saveFeedback]);

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
    setPhases(
      normalizeRepertoirePhaseNames(
        clonePracticePhases(template.phases),
        repertoireItems,
      ),
    );
    setGuitarType(template.guitarType ?? lastGuitarType ?? undefined);
    guitarTouchedRef.current = true;
    setError(null);
  }

  function chooseGuitar(value: string) {
    if (value === "none") {
      setGuitarId(undefined);
      return;
    }
    const guitar = guitars.find((candidate) => candidate.id === value);
    if (!guitar) return;
    setGuitarId(guitar.id);
  }

  function createPhase() {
    setPhases((current) => [
      ...current,
      createPracticePhase(createId()),
    ]);
  }

  function validateCurrentPlan() {
    const validationError = validatePracticeTemplate(name, phases, {
      repertoireItems,
      licks,
    });
    if (!validationError) {
      setError(null);
      return true;
    }

    setError({ name: "Escribe un nombre de hasta 80 caracteres.", phases: "Añade al menos un bloque.", phase: "Revisa los nombres, minutos, categorías y vínculos de los bloques." }[validationError]);
    return false;
  }

  function handleSaveTemplate() {
    if (!validateCurrentPlan()) return;

    const templateId = selectedTemplateId || createId();
    const isUpdate = Boolean(selectedTemplateId);

    try {
      saveTemplate({
        id: templateId,
        name: name.trim(),
        phases: clonePracticePhases(
          normalizeRepertoirePhaseNames(phases, repertoireItems),
        ),
        ...(guitarType ? { guitarType } : {}),
        updatedAt: new Date().toISOString(),
      });
      const wasStored = usePracticeStore
        .getState()
        .templates.some((template) => template.id === templateId);
      if (!wasStored) throw new Error(text.templateSaveError);

      setSelectedTemplateId(templateId);
      setSaveFeedback({
        type: "success",
        message: `${isUpdate ? text.templateUpdated : text.templateSaved} «${name.trim()}»`,
      });
    } catch {
      setSaveFeedback({
        type: "error",
        message: text.templateSaveError,
      });
    }
  }

  function handleStart() {
    if (!validateCurrentPlan()) return;
    if (guitarType) rememberGuitarType(guitarType);
    rememberGuitar();
    onStart(
      name.trim(),
      clonePracticePhases(
        normalizeRepertoirePhaseNames(phases, repertoireItems),
      ),
      guitarType,
      guitarId,
    );
  }

  function removeTemplate() {
    if (!selectedTemplateId) return;
    deleteTemplate(selectedTemplateId);
    setSelectedTemplateId("");
  }

  return (
    <div className="enter">
      <div data-tour-target="practice-plan">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.05em] text-muted">
               {text.prepare}
            </p>
            <h2 className="mt-2 font-sans text-lg leading-7 font-semibold tracking-tight sm:text-xl sm:leading-8">
               {text.designBlocks}
            </h2>
          </div>
          {templates.length > 0 && (
            <div className="min-w-52 flex-1 text-xs text-muted sm:max-w-64">
               {text.savedTemplate}
              <SelectField
                className="mt-1"
                value={selectedTemplateId}
                 ariaLabel={text.savedTemplate}
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
                   { value: "", label: text.newPlan },
                  ...templates.map((template) => ({
                    value: template.id,
                    label: template.name,
                  })),
                ]}
              />
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block text-xs text-muted">
             {text.sessionName}
            <TextField
              value={name}
              maxLength={80}
              onChange={(event) => setName(event.target.value)}
              className="mt-1"
            />
          </label>
          <div className="block text-xs text-muted">
             {text.guitarType}
            <SelectField
              className="mt-1"
              value={guitarType ?? "unspecified"}
               ariaLabel={text.guitarTypeAria}
              options={guitarOptions}
              onChange={(value) => {
                guitarTouchedRef.current = true;
                const nextType =
                  value === "electric" || value === "acoustic"
                    ? value
                    : undefined;
                setGuitarType(nextType);
              }}
            />
          </div>
        </div>

        {showGuitarSelector && (
          <div className="mt-4 block text-xs text-muted">
            {text.guitar}
            <SelectField
              className="mt-1"
              value={guitarId ?? "none"}
              ariaLabel={text.guitarAria}
              options={[
                { value: "none", label: text.guitarNone },
                ...guitars.map((guitar) => ({
                  value: guitar.id,
                  label: guitar.name,
                })),
              ]}
              onChange={chooseGuitar}
            />
          </div>
        )}
      </div>

      <div className="mt-6 space-y-4">
        {phases.map((phase, index) => (
          <PracticePhaseEditor
            key={phase.id}
            phase={phase}
            index={index}
            repertoireItems={repertoireItems}
            licks={licks}
            onChange={updatePhase}
            onRemove={removePhase}
          />
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
         <Button type="button" onClick={createPhase} size="field">
           {text.addBlock}
        </Button>
        <div className="flex flex-wrap gap-2">
          {selectedTemplateId && (
            <Button type="button" onClick={removeTemplate}>
               <TrashIcon className="size-4" />
               {text.deleteTemplate}
            </Button>
          )}
          <Button type="button" onClick={handleSaveTemplate}>
             {text.saveTemplate}
          </Button>
          <Button type="button" variant="primary" onClick={handleStart}>
             {text.startSession}
          </Button>
        </div>
      </div>
      <p className="mt-3 text-right font-mono text-xs text-muted">
         {getPracticePlanDuration(phases)} {text.total}
      </p>
      <div className="mt-2 min-h-5 text-right text-sm" aria-live="polite">
        {saveFeedback && (
          <p
            role={saveFeedback.type === "error" ? "alert" : "status"}
            className={
              saveFeedback.type === "error" ? "text-red-300" : "text-accent-green-fg"
            }
          >
            {saveFeedback.message}
          </p>
        )}
      </div>
      {error && (
        <p className="mt-3 text-sm text-red-300" role="alert">
          {error}
        </p>
      )}
      <p className="mt-5 text-xs leading-6 text-muted">
         {text.storageNote}
      </p>
    </div>
  );
}
