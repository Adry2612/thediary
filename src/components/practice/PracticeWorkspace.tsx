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
import { PracticeSkeleton } from '@/components/ui/Skeletons';

export function PracticeWorkspace({
  initialPhases,
  requestedTemplateId,
  requestedSessionId,
  requestedQuickRepertoireId,
  autoStartTemplate = false,
}: {
  initialPhases: PracticePhase[];
  requestedTemplateId?: string;
  requestedSessionId?: string;
  requestedQuickRepertoireId?: string;
  autoStartTemplate?: boolean;
}) {
  const text = useI18nSection('practice');
  const templates = usePracticeStore((state) => state.templates);
  const history = usePracticeStore((state) => state.history);
  const repertoireItems = usePracticeStore((state) => state.repertoireItems);
  const hasHydrated = usePracticeStore((state) => state.hasHydrated);
  const activeSession = useActivePracticeSessionStore(
    (state) => state.activeSession,
  );
  const activeSessionHydrated = useActivePracticeSessionStore(
    (state) => state.hasHydrated,
  );
  const isSplitView = useActivePracticeSessionStore(
    (state) => state.isSplitView,
  );
  const setActiveSession = useActivePracticeSessionStore(
    (state) => state.setActiveSession,
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
  const launchedQuickRepertoireId = useRef<string | null>(null);

  useEffect(() => {
    if (
      !requestedQuickRepertoireId ||
      !hasHydrated ||
      !activeSessionHydrated ||
      activeSession ||
      launchedQuickRepertoireId.current === requestedQuickRepertoireId
    ) {
      return;
    }

    launchedQuickRepertoireId.current = requestedQuickRepertoireId;
    const item = repertoireItems.find(
      (candidate) => candidate.id === requestedQuickRepertoireId,
    );
    if (!item) {
      setTemplateLaunchError(text.templateNotFound);
      return;
    }

    const phase: PracticePhase = {
      id: `quick-${item.id}`,
      name: item.title,
      durationMinutes: 1,
      skill: 'repertoire',
      resources: item.guitarPro ? [item.guitarPro] : undefined,
    };
    setDraftPlan({ name: item.title, phases: [phase] });
    setActiveSession({
      id: createId(),
      name: item.title,
      phases: [phase],
      attachedResources: item.resources,
      isCountUp: true,
    });
    setTemplateLaunchError(null);
  }, [
    activeSession,
    hasHydrated,
    activeSessionHydrated,
    repertoireItems,
    requestedQuickRepertoireId,
    setActiveSession,
    text.templateNotFound,
  ]);

  useEffect(() => {
    if (
      requestedSessionId ||
      requestedQuickRepertoireId ||
      !autoStartTemplate ||
      !requestedTemplateId ||
      !hasHydrated ||
      !activeSessionHydrated ||
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
    activeSessionHydrated,
    hasHydrated,
    activeSession,
    requestedSessionId,
    requestedQuickRepertoireId,
    requestedTemplateId,
    setActiveSession,
    templates,
  ]);

  useEffect(() => {
    if (!requestedSessionId || !hasHydrated || !activeSessionHydrated || activeSession) return;
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
    activeSessionHydrated,
    hasHydrated,
    history,
    requestedSessionId,
    setActiveSession,
  ]);

  if (!hasHydrated) {
    return <PracticeSkeleton />;
  }

  return (
    <WorkspaceContainer
      className={`mx-auto flex w-full ${isSplitView ? 'max-w-7xl' : 'max-w-5xl'} flex-col gap-6 px-5 sm:px-8 ${activePlan ? 'pb-0 pt-12 sm:pt-16' : 'py-12 sm:py-16'}`}
    >
      <header className='enter'>
        <p className='font-mono text-xs uppercasetext-muted'>{text.diary}</p>
        <h1 className='mt-3 font-sans text-3xl leading-tight font-semibold tracking-tight sm:text-4xl'>
          {activePlan?.name ?? text.yourPractice}
        </h1>
        {activePlan ?
          <div className='mt-3 flex flex-wrap items-center gap-3'>
            <p className='font-mono text-xs uppercase text-muted'>
              {getPracticePlanDuration(activePlan.phases)} min ·{' '}
              {text.personalSession}
            </p>
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
