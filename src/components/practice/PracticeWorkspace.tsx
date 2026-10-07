"use client";

import { useEffect, useRef, useState } from "react";
import { PracticePlanBuilder } from "@/components/practice/PracticePlanBuilder";
import { PracticeSession } from "@/components/practice/PracticeSession";
import { usePracticeStore } from "@/stores/usePracticeStore";
import type { PracticePhase } from "@/types/practice";

export function PracticeWorkspace({
  initialPhases,
  requestedTemplateId,
  autoStartTemplate = false,
}: {
  initialPhases: PracticePhase[];
  requestedTemplateId?: string;
  autoStartTemplate?: boolean;
}) {
  const templates = usePracticeStore((state) => state.templates);
  const hasHydrated = usePracticeStore((state) => state.hasHydrated);
  const [draftPlan, setDraftPlan] = useState({
    name: "Mi sesión",
    phases: initialPhases,
  });
  const [templateLaunchError, setTemplateLaunchError] = useState<string | null>(
    null,
  );
  const [activePlan, setActivePlan] = useState<{
    name: string;
    phases: PracticePhase[];
  } | null>(null);
  const launchedTemplateId = useRef<string | null>(null);

  useEffect(() => {
    if (!autoStartTemplate || !requestedTemplateId || !hasHydrated) return;
    if (launchedTemplateId.current === requestedTemplateId) return;

    launchedTemplateId.current = requestedTemplateId;
    const template = templates.find(
      (candidate) => candidate.id === requestedTemplateId,
    );
    if (!template) {
      setTemplateLaunchError(
        "No se encontró esa rutina guardada en este navegador.",
      );
      return;
    }

    const plan = { name: template.name, phases: template.phases };
    setDraftPlan(plan);
    setActivePlan(plan);
    setTemplateLaunchError(null);
  }, [autoStartTemplate, hasHydrated, requestedTemplateId, templates]);

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-16 sm:py-24">
      <header className="enter mb-4">
        <p className="font-mono text-xs uppercase tracking-[0.05em] text-muted">
          Diario de práctica
        </p>
        <h1 className="mt-3 font-serif text-5xl tracking-[-0.03em]">
          {activePlan?.name ?? "Tu práctica"}
        </h1>
        {activePlan ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-xs uppercase tracking-[0.05em] text-muted">
              {activePlan.phases.reduce(
                (total, phase) => total + phase.durationMinutes,
                0,
              )}{" "}
              min · sesión personal
            </p>
            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    "Al cambiar, el temporizador se reiniciará y la sesión incompleta no se registrará. ¿Continuar?",
                  )
                ) {
                  setActivePlan(null);
                }
              }}
              className="text-sm text-muted underline underline-offset-4 hover:text-ink"
            >
              Cambiar sesión
            </button>
          </div>
        ) : (
          <p className="mt-3 max-w-xl text-sm text-muted">
            Organiza tus bloques, ejercicios y material de estudio antes de
            empezar. Las sesiones completadas se guardan en tu historial.
          </p>
        )}
      </header>

      {activePlan ? (
        <PracticeSession name={activePlan.name} phases={activePlan.phases} />
      ) : (
        <>
          {templateLaunchError && (
            <p className="text-sm text-red-300" role="alert">
              {templateLaunchError}
            </p>
          )}
          <PracticePlanBuilder
            initialName={draftPlan.name}
            initialPhases={draftPlan.phases}
            onStart={(name, phases) => {
              const nextPlan = { name, phases };
              setDraftPlan(nextPlan);
              setActivePlan(nextPlan);
            }}
          />
        </>
      )}
    </main>
  );
}
