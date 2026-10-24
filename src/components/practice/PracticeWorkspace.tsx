'use client';

import { useCallback, useEffect, useState } from 'react';
import { PracticePlanBuilder } from '@/components/practice/PracticePlanBuilder';
import { SavedPracticeRoutines } from '@/components/practice/SavedPracticeRoutines';
import { Button } from '@/components/ui/Button';
import { ArrowLeftIcon } from '@/components/ui/icons';
import {
  createPracticePlanFromSession,
  createQuickPracticePlan,
  createTemplatePlan,
  type PracticeLaunchPlan,
  type PracticeLaunchSession,
} from '@/utils/practice-launch';
import { getPracticePlanDuration } from '@/utils/practice-plan';
import {
  validatePracticeTemplate,
} from '@/utils/practice-templates';
import { useRequestedLaunch } from '@/hooks/useRequestedLaunch';
import { useActivePracticeSessionStore } from '@/stores/useActivePracticeSessionStore';
import { usePracticeStore } from '@/stores/usePracticeStore';
import type { PracticePhase } from '@/types/practice';
import { useI18nSection } from '@/i18n/I18nProvider';
import { createId } from '@/utils/create-id';
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
  const licks = usePracticeStore((state) => state.licks);
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
  const [draftPlan, setDraftPlan] = useState<PracticeLaunchPlan>({
    name: text.yourPractice,
    phases: initialPhases,
  });
  const [isBuilding, setIsBuilding] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(
    null,
  );
  const activePlan = activeSession;
  const WorkspaceContainer = activePlan ? 'div' : 'main';
  const isLaunching = Boolean(
    requestedSessionId ||
      requestedQuickRepertoireId ||
      (autoStartTemplate && requestedTemplateId),
  );
  const launchRequestedPlan = useCallback(
    (plan: PracticeLaunchSession) => {
      setDraftPlan({
        name: plan.name,
        phases: plan.phases,
        guitarType: plan.guitarType,
      });
      setActiveSession({ id: createId(), ...plan });
    },
    [setActiveSession],
  );
  const { templateLaunchError, setTemplateLaunchError } = useRequestedLaunch({
    requestedTemplateId,
    requestedSessionId,
    requestedQuickRepertoireId,
    autoStartTemplate,
    hasHydrated,
    activeSessionHydrated,
    activeSession,
    templates,
    history,
    repertoireItems,
    licks,
    templateNotFound: text.templateNotFound,
    repeatNotFound: text.repeatNotFound,
    invalidTemplate: text.invalidTemplate,
    invalidRepeat: text.invalidRepeat,
    launch: launchRequestedPlan,
  });
  if (!hasHydrated || (isLaunching && !activePlan)) {
    return <PracticeSkeleton />;
  }

  function startTemplate(templateId: string) {
    const template = templates.find((candidate) => candidate.id === templateId);
    if (!template) {
      setTemplateLaunchError(text.templateNotFound);
      return;
    }
    if (
      validatePracticeTemplate(template.name, template.phases, {
        repertoireItems,
        licks,
      })
    ) {
      setTemplateLaunchError(text.invalidTemplate);
      return;
    }
    const plan = createTemplatePlan(template);
    setDraftPlan(plan);
    setTemplateLaunchError(null);
    setActiveSession({ id: createId(), ...plan });
  }

  function startQuickPractice() {
    const plan = createQuickPracticePlan(
      text.quickPracticeTitle,
      text.quickBlockName,
      createId(),
    );
    setDraftPlan({ name: plan.name, phases: plan.phases });
    setTemplateLaunchError(null);
    setActiveSession({ id: createId(), ...plan });
  }

  function openBuilder(templateId: string | null) {
    setEditingTemplateId(templateId);
    if (templateId === null) {
      setDraftPlan({ name: text.yourPractice, phases: initialPhases });
    }
    setIsBuilding(true);
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
              {activePlan.isCountUp ?
                text.freeSession
              : `${getPracticePlanDuration(activePlan.phases)} min · ${text.personalSession}`}
              {activePlan.guitarType ?
                ` · ${activePlan.guitarType === 'electric' ? text.guitarElectric : text.guitarAcoustic}` : null}
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
          {isBuilding ? (
            <>
              <button
                type='button'
                onClick={() => {
                  setIsBuilding(false);
                  setEditingTemplateId(null);
                }}
                className='inline-flex items-center gap-1.5 self-start text-sm text-muted underline underline-offset-4 hover:text-ink'
              >
                <ArrowLeftIcon className='size-4 shrink-0' />
                {text.backToRoutines}
              </button>
              <PracticePlanBuilder
                initialName={draftPlan.name}
                initialPhases={draftPlan.phases}
                initialGuitarType={draftPlan.guitarType}
                initialTemplateId={editingTemplateId ?? undefined}
                onStart={(name, phases, guitarType) => {
                  const nextPlan = {
                    name,
                    phases,
                    ...(guitarType ? { guitarType } : {}),
                  };
                  setDraftPlan(nextPlan);
                  setActiveSession({ id: createId(), ...nextPlan });
                }}
              />
            </>
          ) : (
            <>
              <div className='flex flex-wrap gap-3'>
                <Button
                  type='button'
                  variant='primary'
                  size='field'
                  onClick={() => openBuilder(null)}
                >
                  {text.createPractice}
                </Button>
                <Button
                  type='button'
                  size='field'
                  onClick={startQuickPractice}
                >
                  {text.quickPractice}
                </Button>
              </div>
              <p className='max-w-xl text-xs leading-6 text-muted'>
                {text.quickPracticeDescription}
              </p>
              <SavedPracticeRoutines
                routines={templates}
                onStart={startTemplate}
                onEdit={(templateId) => openBuilder(templateId)}
              />
            </>
          )}
        </>
      )}
    </WorkspaceContainer>
  );
}
