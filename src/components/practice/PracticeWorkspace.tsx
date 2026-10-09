'use client';

import { useEffect, useRef, useState } from 'react';
import { PracticePlanBuilder } from '@/components/practice/PracticePlanBuilder';
import { createPracticePlanFromSession } from '@/lib/practice-launch';
import { getPracticePlanDuration } from '@/lib/practice-plan';
import { useActivePracticeSessionStore } from '@/stores/useActivePracticeSessionStore';
import { usePracticeStore } from '@/stores/usePracticeStore';
import type { PracticePhase } from '@/types/practice';
import { useI18nSection } from '@/i18n/I18nProvider';
import { createId } from '@/lib/create-id';

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
  const text = useI18nSection('practice');
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
    name: text.yourPractice,
    phases: initialPhases,
  });
  const [templateLaunchError, setTemplateLaunchError] = useState<string | null>(
    null,
  );
  const activePlan = activeSession;
  const WorkspaceContainer = activePlan ? 'div' : 'main';
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
      setTemplateLaunchError(text.templateNotFound);
      return;
    }

    const plan = { name: template.name, phases: template.phases };
    setDraftPlan(plan);
    setActiveSession({ id: createId(), ...plan });
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
      setTemplateLaunchError(text.repeatNotFound);
      return;
    }

    setDraftPlan(plan);
    setActiveSession({ id: createId(), ...plan });
    setTemplateLaunchError(null);
  }, [
    activeSession,
    hasHydrated,
    history,
    requestedSessionId,
    setActiveSession,
  ]);

  return (
    <WorkspaceContainer
      className={`mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 pt-16 sm:pt-24 ${activePlan ? '' : 'min-h-screen pb-16 sm:pb-24'}`}
    >
      <header className='enter mb-4'>
        <p className='font-mono text-xs uppercasetext-muted'>{text.diary}</p>
        <h1 className='mt-3 font-sans text-3xl leading-tight font-semibold tracking-tight sm:text-4xl'>
          {activePlan?.name ?? text.yourPractice}
        </h1>
        {activePlan ?
          <div className='mt-3 flex flex-wrap items-center justify-between gap-3'>
            <p className='font-mono text-xs uppercase text-muted'>
              {getPracticePlanDuration(activePlan.phases)} min ·{' '}
              {text.personalSession}
            </p>
            <button
              type='button'
              onClick={() => {
                if (window.confirm(text.changeConfirm)) {
                  clearActiveSession();
                }
              }}
              className='text-sm text-muted underline underline-offset-4 hover:text-ink'
            >
              {text.changeSession}
            </button>
          </div>
        : <p className='mt-3 max-w-xl text-sm text-muted'>
            {text.setupDescription}
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
              setActiveSession({ id: createId(), ...nextPlan });
            }}
          />
        </>
      )}
    </WorkspaceContainer>
  );
}
