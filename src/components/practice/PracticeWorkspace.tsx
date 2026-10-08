'use client';

import { useEffect, useRef, useState } from 'react';
import { PracticePlanBuilder } from '@/components/practice/PracticePlanBuilder';
import { createPracticePlanFromSession } from '@/lib/practice-launch';
import { getPracticePlanDuration } from '@/lib/practice-plan';
import { useActivePracticeSessionStore } from '@/stores/useActivePracticeSessionStore';
import { usePracticeStore } from '@/stores/usePracticeStore';
import type { PracticePhase } from '@/types/practice';

export function PracticeWorkspace({
  initialPhases,
  requestedTemplateId,
  requestedSessionId,
  autoStartTemplate = false,
}: {
  initialPhases: PracticePhase[];
  requestedTemplateId?: string;
  requestedSessionId?: string;
  autoStartTemplate?: boolean;
}) {
  const templates = usePracticeStore((state) => state.templates);
  const history = usePracticeStore((state) => state.history);
  const hasHydrated = usePracticeStore((state) => state.hasHydrated);
  const activeSession = useActivePracticeSessionStore(
    (state) => state.activeSession,
  );
  const setActiveSession = useActivePracticeSessionStore(
    (state) => state.setActiveSession,
  );
  const clearActiveSession = useActivePracticeSessionStore(
    (state) => state.clearActiveSession,
  );
  const [draftPlan, setDraftPlan] = useState({
    name: 'Mi sesión',
    phases: initialPhases,
  });
  const [templateLaunchError, setTemplateLaunchError] = useState<string | null>(
    null,
  );
  const activePlan = activeSession;
  const launchedTemplateId = useRef<string | null>(null);
  const launchedSessionId = useRef<string | null>(null);

  useEffect(() => {
    if (
      requestedSessionId ||
      !autoStartTemplate ||
      !requestedTemplateId ||
      !hasHydrated ||
      activeSession
    ) {
      return;
    }
    if (launchedTemplateId.current === requestedTemplateId) return;

    launchedTemplateId.current = requestedTemplateId;
    const template = templates.find(
      (candidate) => candidate.id === requestedTemplateId,
    );
    if (!template) {
      setTemplateLaunchError(
        'No se encontró esa rutina guardada en este navegador.',
      );
      return;
    }

    const plan = { name: template.name, phases: template.phases };
    setDraftPlan(plan);
    setActiveSession({ id: crypto.randomUUID(), ...plan });
    setTemplateLaunchError(null);
  }, [
    autoStartTemplate,
    hasHydrated,
    activeSession,
    requestedSessionId,
    requestedTemplateId,
    setActiveSession,
    templates,
  ]);

  useEffect(() => {
    if (!requestedSessionId || !hasHydrated || activeSession) return;
    if (launchedSessionId.current === requestedSessionId) return;

    launchedSessionId.current = requestedSessionId;
    const session = history.find(
      (candidate) => candidate.id === requestedSessionId,
    );
    const plan = session ? createPracticePlanFromSession(session) : null;
    if (!plan) {
      setTemplateLaunchError(
        'No se encontró una sesión con bloques que se pueda repetir.',
      );
      return;
    }

    setDraftPlan(plan);
    setActiveSession({ id: crypto.randomUUID(), ...plan });
    setTemplateLaunchError(null);
  }, [activeSession, hasHydrated, history, requestedSessionId, setActiveSession]);

  return (
    <main
      className={`mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 pt-16 sm:pt-24 ${activePlan ? '' : 'min-h-screen pb-16 sm:pb-24'}`}
    >
      <header className='enter mb-4'>
        <p className='font-mono text-xs uppercase tracking-[0.05em] text-muted'>
          Diario de práctica
        </p>
        <h1 className='mt-3 font-sans text-3xl leading-tight font-semibold tracking-tight sm:text-4xl'>
          {activePlan?.name ?? 'Tu práctica'}
        </h1>
        {activePlan ?
          <div className='mt-3 flex flex-wrap items-center justify-between gap-3'>
            <p className='font-mono text-xs uppercase tracking-[0.05em] text-muted'>
              {getPracticePlanDuration(activePlan.phases)} min · sesión personal
            </p>
            <button
              type='button'
              onClick={() => {
                if (
                  window.confirm(
                    'Al cambiar, el temporizador se reiniciará y la sesión incompleta no se registrará. ¿Continuar?',
                  )
                ) {
                  clearActiveSession();
                }
              }}
              className='text-sm text-muted underline underline-offset-4 hover:text-ink'
            >
              Cambiar sesión
            </button>
          </div>
        : <p className='mt-3 max-w-xl text-sm text-muted'>
            Organiza tus bloques, ejercicios y material de estudio antes de
            empezar. Las sesiones completadas se guardan en tu historial.
          </p>
        }
      </header>

      {!activePlan && (
        <>
          {templateLaunchError && (
            <p
              className='text-sm text-red-300'
              role='alert'
            >
              {templateLaunchError}
            </p>
          )}
          <PracticePlanBuilder
            initialName={draftPlan.name}
            initialPhases={draftPlan.phases}
            onStart={(name, phases) => {
              const nextPlan = { name, phases };
              setDraftPlan(nextPlan);
              setActiveSession({ id: crypto.randomUUID(), ...nextPlan });
            }}
          />
        </>
      )}
    </main>
  );
}
