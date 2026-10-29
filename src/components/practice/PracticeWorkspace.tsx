'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FreePracticeStartDialog } from '@/components/practice/FreePracticeStartDialog';
import { PracticePlanBuilder } from '@/components/practice/PracticePlanBuilder';
import { PracticePlanTable } from '@/components/practice/PracticePlanTable';
import { SavedPracticeRoutines } from '@/components/practice/SavedPracticeRoutines';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageShell } from '@/components/ui/PageShell';
import { ArrowLeftIcon } from '@/components/ui/icons';
import {
  createQuickPracticePlan,
  createQuickRepertoirePlan,
  createTemplatePlan,
  type PracticeLaunchPlan,
  type PracticeLaunchSession,
} from '@/utils/practice-launch';
import { getPracticePlanDuration } from '@/utils/practice-plan';
import {
  INITIAL_PRACTICE_FLOW,
  backToPracticeChoice,
  closePracticeBuilder,
  finishPractice,
  openPracticeBuilder,
  reviewPracticePlan,
  startPracticeNow,
  startReviewedPractice,
} from '@/utils/practice-flow';
import {
  validatePracticeTemplate,
} from '@/utils/practice-templates';
import { useRequestedLaunch } from '@/hooks/useRequestedLaunch';
import { useGuitarPreference } from '@/hooks/useGuitarPreference';
import { useActivePracticeSessionStore } from '@/stores/useActivePracticeSessionStore';
import { usePracticeStore } from '@/stores/usePracticeStore';
import type { GuitarType, PracticePhase } from '@/types/practice';
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
  const guitars = usePracticeStore((state) => state.guitars);
  const hasHydrated = usePracticeStore((state) => state.hasHydrated);
  const activeSession = useActivePracticeSessionStore(
    (state) => state.activeSession,
  );
  const activeSessionHydrated = useActivePracticeSessionStore(
    (state) => state.hasHydrated,
  );
  const setActiveSession = useActivePracticeSessionStore(
    (state) => state.setActiveSession,
  );
  const [flow, setFlow] = useState(INITIAL_PRACTICE_FLOW);
  const router = useRouter();
  const { lastGuitarType, rememberGuitarType } = useGuitarPreference();
  const activePlan = activeSession;
  const isLaunching = Boolean(
    requestedSessionId || (autoStartTemplate && requestedTemplateId),
  );
  const launchRequestedPlan = useCallback(
    (plan: PracticeLaunchSession) => {
      setActiveSession({ id: createId(), ...plan });
      setFlow((current) =>
        startPracticeNow(current, {
          name: plan.name,
          phases: plan.phases,
          ...(plan.guitarType ? { guitarType: plan.guitarType } : {}),
          ...(plan.guitarId ? { guitarId: plan.guitarId } : {}),
          ...(plan.targetMinutes ? { targetMinutes: plan.targetMinutes } : {}),
        }),
      );
    },
    [setActiveSession],
  );
  const {
    templateLaunchError,
    setTemplateLaunchError,
    pendingQuickRepertoire,
    clearPendingQuickRepertoire,
  } = useRequestedLaunch({
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

  useEffect(() => {
    if (!activeSession) {
      setFlow((current) => finishPractice(current));
    }
  }, [activeSession]);

  if (!hasHydrated || (isLaunching && !activePlan)) {
    return <PracticeSkeleton />;
  }

  function reviewTemplate(templateId: string) {
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
    setTemplateLaunchError(null);
    setFlow((current) =>
      reviewPracticePlan(current, createTemplatePlan(template)),
    );
  }

  function startQuickPractice() {
    const plan = createQuickPracticePlan(
      text.quickPracticeTitle,
      text.quickBlockName,
      createId(),
    );
    setTemplateLaunchError(null);
    setFlow((current) => startPracticeNow(current, plan));
    setActiveSession({ id: createId(), ...plan });
  }

  function startReviewedPlan() {
    const plan = flow.plan;
    if (!plan) return;
    setTemplateLaunchError(null);
    setFlow((current) => startReviewedPractice(current));
    setActiveSession({ id: createId(), ...plan });
  }

  function startBuiltPlan(
    name: string,
    phases: PracticePhase[],
    guitarType?: PracticeLaunchPlan['guitarType'],
    guitarId?: string,
  ) {
    const plan = {
      name,
      phases,
      ...(guitarType ? { guitarType } : {}),
      ...(guitarId ? { guitarId } : {}),
    };
    setFlow((current) => reviewPracticePlan(current, plan));
  }

  function openBuilder(templateId: string | null) {
    setFlow((current) => openPracticeBuilder(current, templateId));
  }

  function closeBuilder() {
    setFlow((current) => closePracticeBuilder(current));
  }

  function startPendingQuickRepertoire(
    guitarType: GuitarType,
    guitarId?: string,
    targetMinutes?: number,
  ) {
    if (!pendingQuickRepertoire) return;
    rememberGuitarType(guitarType);
    const plan = createQuickRepertoirePlan(pendingQuickRepertoire, {
      guitarType,
      guitarId,
      targetMinutes,
    });
    clearPendingQuickRepertoire();
    launchRequestedPlan(plan);
    router.replace('/practice');
  }

  function cancelPendingQuickRepertoire() {
    clearPendingQuickRepertoire();
    router.replace('/practice');
  }

  const reviewedPlan = flow.plan;
  const builder = flow.builder;
  const isBuilding = Boolean(builder);
  const builderPhases =
    builder && !builder.templateId && reviewedPlan?.phases.length
      ? reviewedPlan.phases
      : initialPhases;
  const title = activePlan?.name ?? text.yourPractice;
  const activeGuitar = activePlan?.guitarId
    ? guitars.find((guitar) => guitar.id === activePlan.guitarId)
    : undefined;
  const reviewedGuitar = reviewedPlan?.guitarId
    ? guitars.find((guitar) => guitar.id === reviewedPlan.guitarId)
    : undefined;
  const activeGuitarLabel =
    activeGuitar?.name ??
    (activePlan?.guitarType
      ? activePlan.guitarType === 'electric'
        ? text.guitarElectric
        : text.guitarAcoustic
      : null);
  const reviewedGuitarLabel =
    reviewedGuitar?.name ??
    (reviewedPlan?.guitarType
      ? reviewedPlan.guitarType === 'electric'
        ? text.guitarElectric
        : text.guitarAcoustic
      : null);

  return (
    <PageShell
      as={activePlan ? 'div' : 'main'}
      bottom={activePlan ? 'flush' : 'default'}
      className='flex flex-col gap-6'
    >
      <PageHeader
        bottomSpacing='none'
        title={title}
        description={
          activePlan ?
            <p className='font-mono text-xs uppercase text-muted'>
              {activePlan.isCountUp ?
                text.freeSession
              : `${getPracticePlanDuration(activePlan.phases)} min · ${text.personalSession}`}
              {activeGuitarLabel ? ` · ${activeGuitarLabel}` : null}
            </p>
          : flow.step === 'review' && reviewedPlan ?
            <p className='font-mono text-xs uppercase text-muted'>
              {reviewedPlan.phases.length} {text.blocksCount} ·{' '}
              {getPracticePlanDuration(reviewedPlan.phases)} {text.total}
              {reviewedGuitarLabel ? ` · ${reviewedGuitarLabel}` : null}
            </p>
          : text.setupDescription
        }
        actions={
          !activePlan && flow.step === 'choose' && !isBuilding ?
            <Button type='button' size='field' onClick={startQuickPractice}>
              {text.quickPractice}
            </Button>
          : undefined
        }
      />

      {!activePlan && (
        <>
          {templateLaunchError && (
            <p className='text-sm text-red-300' role='alert'>
              {templateLaunchError}
            </p>
          )}

          {isBuilding ? (
            <>
              <button
                type='button'
                onClick={closeBuilder}
                className='inline-flex items-center gap-1.5 self-start text-sm text-muted underline underline-offset-4 hover:text-ink'
              >
                <ArrowLeftIcon className='size-4 shrink-0' />
                {flow.step === 'review' ? text.backToReview : text.backToRoutines}
              </button>
              <PracticePlanBuilder
                initialName={reviewedPlan?.name ?? text.yourPractice}
                initialPhases={builderPhases}
                initialGuitarType={reviewedPlan?.guitarType}
                initialGuitarId={reviewedPlan?.guitarId}
                initialTemplateId={builder?.templateId ?? undefined}
                onStart={startBuiltPlan}
              />
            </>
          ) : flow.step === 'review' && reviewedPlan ? (
            <>
              <button
                type='button'
                onClick={() => setFlow((current) => backToPracticeChoice(current))}
                className='inline-flex items-center gap-1.5 self-start text-sm text-muted underline underline-offset-4 hover:text-ink'
              >
                <ArrowLeftIcon className='size-4 shrink-0' />
                {text.backToRoutines}
              </button>

              <section className='flex flex-col gap-4'>
                <div className='flex flex-wrap items-baseline justify-between gap-3'>
                  <h2 className='font-sans text-lg leading-7 font-semibold tracking-tight sm:text-xl sm:leading-8'>
                    {text.reviewPlanTitle}
                  </h2>
                  <p className='text-xs text-muted'>{text.reviewPlanDescription}</p>
                </div>
                <PracticePlanTable
                  phases={reviewedPlan.phases}
                  repertoireItems={repertoireItems}
                />
              </section>

              <div className='flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5'>
                <Button
                  type='button'
                  onClick={() =>
                    openBuilder(reviewedPlan.templateId ?? null)
                  }
                >
                  {text.editRoutine}
                </Button>
                <Button
                  type='button'
                  variant='primary'
                  size='field'
                  onClick={startReviewedPlan}
                >
                  {text.startPractice}
                </Button>
              </div>
            </>
          ) : (
            <>
              <SavedPracticeRoutines
                routines={templates}
                onStart={reviewTemplate}
                onEdit={(templateId) => openBuilder(templateId)}
              />
              <div className='flex flex-wrap items-center gap-4 border-t border-line pt-5'>
                {templates.length === 0 ? (
                  <Button
                    type='button'
                    variant='primary'
                    size='field'
                    onClick={() => openBuilder(null)}
                  >
                    {text.createPractice}
                  </Button>
                ) : (
                  <button
                    type='button'
                    onClick={() => openBuilder(null)}
                    className='text-sm text-muted underline underline-offset-4 hover:text-ink'
                  >
                    {text.createPractice}
                  </button>
                )}
                <p className='max-w-xl text-xs leading-6 text-muted'>
                  {text.quickPracticeDescription}
                </p>
              </div>
            </>
          )}
        </>
      )}

      {pendingQuickRepertoire && (
        <FreePracticeStartDialog
          key={pendingQuickRepertoire.id}
          item={pendingQuickRepertoire}
          guitars={guitars}
          defaultGuitarType={lastGuitarType}
          onCancel={cancelPendingQuickRepertoire}
          onStart={startPendingQuickRepertoire}
        />
      )}
    </PageShell>
  );
}
