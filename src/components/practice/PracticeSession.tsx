"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PracticeCompletionDialog } from "@/components/practice/PracticeCompletionDialog";
import { FinishPracticeDialog } from "@/components/practice/FinishPracticeDialog";
import { MetronomeCard } from "@/components/practice/MetronomeCard";
import { PracticeAudioRecorder } from "@/components/practice/PracticeAudioRecorder";
import {
  PauseIcon,
  PlayIcon,
  SplitViewIcon,
  StopIcon,
} from "@/components/ui/icons";
import { PracticeMaterials } from "@/components/practice/PracticeMaterials";
import { LickTab } from "@/components/licks/LickTab";
import { Card } from "@/components/ui/Card";
import { TimerCard } from "@/components/practice/TimerCard";
import { UpcomingBlocks } from "@/components/practice/UpcomingBlocks";
import { useAnimatedPresence } from "@/hooks/useAnimatedPresence";
import { useElementVisibility } from "@/hooks/useElementVisibility";
import { useGuitarPreference } from "@/hooks/useGuitarPreference";
import { useMetronome } from "@/hooks/useMetronome";
import { usePracticeTimer } from "@/hooks/usePracticeTimer";
import { useSplitViewAvailability } from "@/hooks/useSplitViewAvailability";
import { getLocalDateKey } from "@/utils/local-date";
import { formatClock } from "@/utils/format";
import {
  addBpmSample,
  getTimeWeightedAverageBpm,
} from "@/utils/metronome-bpm";
import {
  getSessionStatus,
} from "@/utils/practice-session-status";
import { createPracticeSessionRecord } from "@/utils/practice-session-record";
import { getPhaseMaterials } from "@/utils/practice-materials";
import { normalizeRepertoirePhaseNames } from "@/utils/practice-plan";
import {
  getPracticeBlockTitle,
} from "@/utils/practice-session-details";
import { getRepertoireSongChanges } from "@/utils/practice-block-editor";
import {
  applyRoutineLinkChanges,
  hasPracticeLinkChanges,
} from "@/utils/practice-routine-update";
import { getPracticedLickIds } from "@/utils/practice-lick-progress";
import { getTechniqueLabels } from "@/utils/licks/presentation";
import {
  useActivePracticeSessionStore,
  type ActivePracticeSession,
} from "@/stores/useActivePracticeSessionStore";
import { usePracticeStore } from "@/stores/usePracticeStore";
import type { PracticeTimerResult } from "@/types/practice";
import { useI18nSection } from "@/i18n/I18nProvider";

export function PracticeSession({ session }: { session: ActivePracticeSession }) {
  const text = useI18nSection("practice");
  const timerText = useI18nSection("timer");
  const licksText = useI18nSection("licks");
  const pathname = usePathname();
  const isPracticeRoute = pathname === "/practice";
  const { id: sessionId, name, phases } = session;
  const [isCompleted, setIsCompleted] = useState(false);
  const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false);
  const [pendingResult, setPendingResult] =
    useState<PracticeTimerResult | null>(null);
  const {
    ref: timerCardRef,
    element: timerCardElement,
    isVisible: isTimerVisible,
    hasMeasured: isTimerMeasured,
  } = useElementVisibility<HTMLDivElement>("0px", pathname);
  const sessionSavedRef = useRef(false);
  const completionHandledRef = useRef(false);
  const addSession = usePracticeStore((state) => state.addSession);
  const repertoireItems = usePracticeStore((state) => state.repertoireItems);
  const licks = usePracticeStore((state) => state.licks);
  const templates = usePracticeStore((state) => state.templates);
  const saveTemplate = usePracticeStore((state) => state.saveTemplate);
  const markLickPracticed = usePracticeStore(
    (state) => state.markLickPracticed,
  );
  const sourceTemplate = session.templateId
    ? templates.find((template) => template.id === session.templateId)
    : undefined;
  const routineHasChanges = sourceTemplate
    ? hasPracticeLinkChanges(phases, sourceTemplate.phases)
    : false;
  const clearActiveSession = useActivePracticeSessionStore(
    (state) => state.clearActiveSession,
  );
  const setActiveSession = useActivePracticeSessionStore(
    (state) => state.setActiveSession,
  );
  const { canUseSplitView, isSplitView, toggleSplitView } =
    useSplitViewAvailability();
  const updatePhase = useActivePracticeSessionStore(
    (state) => state.updatePhase,
  );
  const setGuitarType = useActivePracticeSessionStore(
    (state) => state.setGuitarType,
  );
  const { lastGuitarType } = useGuitarPreference();
  const { isMounted: isBarMounted, isVisible: isBarVisible } =
    useAnimatedPresence(
      !isPracticeRoute || (isTimerMeasured && !isTimerVisible),
    );
  const router = useRouter();
  const {
    bpm: metronomeBpm,
    isRunning: isMetronomeRunning,
    stop: stopMetronome,
    practiceStartSound,
    setPracticeStartSound,
    practiceEndSound,
    setPracticeEndSound,
  } = useMetronome();
  const completeSession = useCallback(
    (result: PracticeTimerResult) => {
      if (completionHandledRef.current) return;

      completionHandledRef.current = true;
      setPendingResult(result);
      setIsCompleted(true);
    },
    [],
  );
  const timer = usePracticeTimer(
    phases,
    undefined,
    completeSession,
    session.isCountUp ?? false,
    practiceStartSound,
    practiceEndSound,
  );
  const timerElapsedSecondsRef = useRef(timer.elapsedSeconds);
  timerElapsedSecondsRef.current = timer.elapsedSeconds;
  const previousTimerStartedAtRef = useRef(timer.startedAt);
  const bpmSamplesRef = useRef([
    { elapsedSeconds: 0, bpm: metronomeBpm },
  ]);
  const metronomeBlocksRef = useRef<number[]>([]);
  useEffect(() => {
    if (previousTimerStartedAtRef.current && !timer.startedAt) {
      bpmSamplesRef.current = [{ elapsedSeconds: 0, bpm: metronomeBpm }];
      metronomeBlocksRef.current = [];
    }
    previousTimerStartedAtRef.current = timer.startedAt;
  }, [metronomeBpm, timer.startedAt]);
  useEffect(() => {
    if (!isMetronomeRunning) return;
    const blockIndex = timer.currentPhaseIndex;
    if (metronomeBlocksRef.current.includes(blockIndex)) return;
    metronomeBlocksRef.current = [...metronomeBlocksRef.current, blockIndex];
  }, [isMetronomeRunning, timer.currentPhaseIndex]);
  const seededGuitarSessionRef = useRef<string | null>(null);
  useEffect(() => {
    if (!lastGuitarType || session.guitarType) return;
    if (seededGuitarSessionRef.current === sessionId) return;
    seededGuitarSessionRef.current = sessionId;
    setGuitarType(lastGuitarType);
  }, [
    lastGuitarType,
    session.guitarType,
    sessionId,
    setGuitarType,
  ]);
  const recordBpmChange = useCallback(
    (bpm: number) => {
      bpmSamplesRef.current = addBpmSample(
        bpmSamplesRef.current,
        timerElapsedSecondsRef.current,
        bpm,
      );
    },
    [],
  );
  useEffect(() => () => stopMetronome(), [stopMetronome]);

  useEffect(() => {
    if (!isPracticeRoute) return;
    // Safari móvil puede conservar la posición de la página anterior al
    // navegar; se vuelve al principio ahora y tras el primer layout.
    window.scrollTo(0, 0);
    const frame = window.requestAnimationFrame(() => window.scrollTo(0, 0));
    return () => window.cancelAnimationFrame(frame);
  }, [isPracticeRoute, sessionId]);

  useEffect(() => {
    // Una sesión antigua pudo guardar un nombre distinto al de su canción. Se
    // corrige la sesión activa para que listas, diálogo final y actualización
    // de rutina usen siempre el título real; la clave estructural del
    // temporizador no cambia, así que el tiempo no se reinicia.
    const normalized = normalizeRepertoirePhaseNames(phases, repertoireItems);
    if (normalized === phases) return;
    setActiveSession({ ...session, phases: normalized });
  }, [phases, repertoireItems, session, setActiveSession]);

  function saveCompletedSession(
    sessionNotes: string,
    phaseNotes: Record<number, string>,
    updateRoutine = false,
  ) {
    if (!pendingResult || sessionSavedRef.current) return;

    sessionSavedRef.current = true;
    const phasesForRecord = phases.map((phase) => ({
      ...phase,
      name: getPracticeBlockTitle(phase, repertoireItems),
      resources: getPhaseMaterials(phase, repertoireItems),
    }));
    addSession(
      createPracticeSessionRecord({
        id: sessionId,
        title: name,
        averageBpm: getTimeWeightedAverageBpm(
          bpmSamplesRef.current,
          pendingResult.elapsedSeconds,
        ),
        result: pendingResult,
        phases: phasesForRecord,
        notes: sessionNotes,
        phaseNotes,
        guitarType: session.guitarType,
        bpmSamples: bpmSamplesRef.current,
        metronomeBlockIndexes: metronomeBlocksRef.current,
      }),
    );
    for (const lickId of getPracticedLickIds(pendingResult.phases)) {
      markLickPracticed(lickId, pendingResult.startedAt);
    }
    if (updateRoutine && session.templateId) {
      const routine = usePracticeStore
        .getState()
        .templates.find((template) => template.id === session.templateId);
      if (routine) {
        saveTemplate(
          applyRoutineLinkChanges(
            routine,
            phases,
            new Date().toISOString(),
          ),
        );
      }
    }
    clearActiveSession();
    router.push(
      `/dashboard/practice/${getLocalDateKey(new Date(pendingResult.startedAt))}`,
    );
  }

  function discardSession() {
    clearActiveSession();
    router.push('/practice');
  }

  function finishPractice() {
    timer.finish();
    if (!isPracticeRoute) router.push("/practice");
  }

  function discardFromDialog() {
    setIsFinishDialogOpen(false);
    discardSession();
  }

  function scrollToTimerCard() {
    const element = timerCardElement;
    if (!element) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    element.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  const currentPhase = phases[timer.currentPhaseIndex];
  const isPlayPauseDisabled =
    !currentPhase ||
    isCompleted ||
    (timer.awaitingPhaseAdvance && !timer.isRunning && !timer.continueAfterBlockTime);
  const isStopDisabled = !currentPhase || isCompleted;
  const isFinishDialogVisible = isFinishDialogOpen && !isCompleted;
  const sessionStatus = getSessionStatus(isCompleted, timer.isRunning);
  const sessionStatusLabel =
    sessionStatus === "completed" ? text.completedStatus
    : sessionStatus === "running" ? text.sessionStatus
    : text.pausedStatus;
  // Si el bloque que se está practicando pertenece al repertorio, su artista
  // se muestra bajo el nombre de la canción.
  const currentRepertoireItem = currentPhase?.repertoireItemId
    ? repertoireItems.find(
        (item) =>
          item.id === currentPhase.repertoireItemId && item.kind === "song",
      )
    : undefined;
  const currentLick = currentPhase?.lickId
    ? licks.find((lick) => lick.id === currentPhase.lickId)
    : undefined;
  const currentLickTechniques = currentLick
    ? getTechniqueLabels(licksText, currentLick.techniques)
    : [];
  const repertoireSongs = repertoireItems.filter(
    (item) => item.kind === "song",
  );

  function changeCurrentSong(songId: string) {
    if (!currentPhase) return;
    const nextSong = repertoireItems.find(
      (item) => item.id === songId && item.kind === "song",
    );
    if (!nextSong) return;
    updatePhase(currentPhase.id, getRepertoireSongChanges(nextSong));
  }

  const timerCard = (
    <div ref={timerCardRef} className="h-full min-w-0">
      <TimerCard
        timer={timer}
        isCompleted={isCompleted}
        onRequestFinish={() => setIsFinishDialogOpen(true)}
        practiceStartSound={practiceStartSound}
        setPracticeStartSound={setPracticeStartSound}
        practiceEndSound={practiceEndSound}
        setPracticeEndSound={setPracticeEndSound}
        artist={currentRepertoireItem?.artist}
        title={currentRepertoireItem?.title ?? currentPhase?.name}
        repertoireSongs={repertoireSongs}
        onChangeRepertoireSong={changeCurrentSong}
      />
    </div>
  );
  const metronomeCard = (
    <MetronomeCard onBpmChange={recordBpmChange} stopOnUnmount={false} />
  );
  const timerAndMetronome = (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
      {timerCard}
      {metronomeCard}
    </div>
  );
  const upcomingBlocks = !isCompleted && (
    <UpcomingBlocks
      phases={phases}
      currentPhaseIndex={timer.currentPhaseIndex}
      repertoireItems={repertoireItems}
    />
  );
  const lickMaterial = currentLick ? (
    <Card className='p-5 sm:p-8'>
      <p className='text-xs uppercase text-muted'>{text.lickMaterial}</p>
      <h2 className='mt-2 font-sans text-lg leading-7 font-semibold tracking-tight sm:text-xl sm:leading-8'>
        {currentLick.title}
      </h2>
      {currentLickTechniques.length > 0 && (
        <p className='mt-2 text-xs text-muted'>
          {text.lickTechniques}: {currentLickTechniques.join(' · ')}
        </p>
      )}
      <LickTab
        tab={currentLick.tab}
        content={currentLick.tabContent}
        emptyLabel={text.lickTabEmpty}
        ariaLabel={text.lickTabAria}
        className='mt-4'
      />
    </Card>
  ) : null;
  const materials = (
    <>
      {lickMaterial}
      <PracticeMaterials
        phases={
          currentPhase
            ? [
                {
                  ...currentPhase,
                  name: getPracticeBlockTitle(currentPhase, repertoireItems),
                  resources: getPhaseMaterials(currentPhase, repertoireItems),
                },
              ]
            : []
        }
        attachedResources={[]}
        onAttach={
          currentPhase
            ? (resource) =>
                updatePhase(currentPhase.id, {
                  resources: [...(currentPhase.resources ?? []), resource],
                })
            : undefined
        }
        splitView={isSplitView}
      />
    </>
  );
  const recorder = (
    <PracticeAudioRecorder
      sessionName={name}
      sessionId={sessionId}
      practiceDate={
        timer.startedAt ? getLocalDateKey(new Date(timer.startedAt)) : undefined
      }
      phase={
        currentPhase
          ? {
              id: currentPhase.id,
              name: currentPhase.name,
              order: timer.currentPhaseIndex + 1,
              skill: currentPhase.skill,
            }
          : undefined
      }
      shouldStop={isCompleted}
    />
  );

  return (
    <>
      <PracticeCompletionDialog
        result={pendingResult}
        isVisible={isPracticeRoute}
        routineName={sourceTemplate?.name}
        canUpdateRoutine={routineHasChanges}
        onSave={saveCompletedSession}
        onDiscard={discardSession}
      />
      <FinishPracticeDialog
        open={isFinishDialogVisible}
        onClose={() => setIsFinishDialogOpen(false)}
        onDiscard={discardFromDialog}
        onFinish={finishPractice}
      />
      <main
        className={
          isPracticeRoute
            ? `mx-auto w-full ${isSplitView ? "max-w-7xl" : "max-w-5xl"} space-y-6 px-5 pb-16 pt-6 sm:px-8 sm:pb-24 sm:pt-8`
            : "hidden"
        }
        aria-hidden={!isPracticeRoute}
      >
        {canUseSplitView && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={toggleSplitView}
              className="inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 text-xs text-muted transition hover:bg-white/5 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/60"
            >
              <SplitViewIcon className="size-4" />
              {isSplitView ? text.singleView : text.splitView}
            </button>
          </div>
        )}
        {isSplitView ? (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(24rem,1fr)]">
            <div className="space-y-6">
              {timerCard}
              {metronomeCard}
              {upcomingBlocks}
              {recorder}
            </div>
            <aside className="min-h-0 min-w-0 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:min-h-0 lg:overflow-y-auto">
              {materials}
            </aside>
          </div>
        ) : (
          <>
            {timerAndMetronome}
            {upcomingBlocks}
            {materials}
            {recorder}
          </>
        )}
      </main>
      {isBarMounted && (
        <nav
          aria-label={text.sessionStatus}
          inert={!isBarVisible}
          className={`fixed inset-x-3 z-40 mx-auto w-[calc(100%-1.5rem)] max-w-2xl transition-[opacity,transform] duration-[180ms] ease-out motion-reduce:transition-none motion-reduce:duration-0 ${
            isBarVisible
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-2 opacity-0"
          }`}
          style={{ bottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <div className="relative flex items-center gap-3 rounded-xl border border-line bg-surface p-3 transition-colors [@media(hover:hover)]:hover:border-white/25 focus-within:border-white/20 sm:gap-4 sm:p-4">
            {isPracticeRoute ? (
              <button
                type="button"
                onClick={scrollToTimerCard}
                aria-label={`${text.goToTimer}: ${name}`}
                className="absolute inset-0 z-0 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-green-fg"
              />
            ) : (
              <Link
                href="/practice"
                aria-label={`${text.openActivePractice}: ${name}`}
                className="absolute inset-0 z-0 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-green-fg"
              />
            )}
            <span
              aria-hidden="true"
              className={`pointer-events-none relative z-10 size-2.5 shrink-0 rounded-full ${
                timer.isRunning
                  ? "bg-accent-green-fg"
                  : "border border-muted bg-transparent"
              }`}
            />
            <span className="pointer-events-none relative z-10 min-w-0 flex-1">
              <span className="block text-[10px] uppercase tracking-[0.05em] text-muted sm:text-xs">
                {sessionStatusLabel}
              </span>
              <span className="block truncate text-sm font-medium text-ink sm:text-base">
                {name}
                {timer.currentPhase ? ` · ${timer.currentPhase.name}` : ""}
              </span>
            </span>
            {timer.currentPhase && !isCompleted && (
              <span className="pointer-events-none relative z-10 shrink-0 font-mono text-sm tabular-nums text-ink sm:text-base">
                {formatClock(timer.remainingSeconds)}
              </span>
            )}
            <div className="relative z-10 flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={timer.isRunning ? timer.pause : timer.resume}
                disabled={isPlayPauseDisabled}
                aria-label={
                  timer.isRunning ? text.pausePractice : text.resumePractice
                }
                title={timer.isRunning ? text.pausePractice : text.resumePractice}
                className="pointer-events-auto flex size-10 items-center justify-center rounded-lg border border-line text-ink transition-colors [@media(hover:hover)]:hover:border-white/25 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-green-fg"
              >
                {timer.isRunning ? <PauseIcon /> : <PlayIcon />}
              </button>
              <button
                type="button"
                onClick={() => setIsFinishDialogOpen(true)}
                disabled={isStopDisabled}
                aria-label={timerText.finishSession}
                title={timerText.finishSession}
                className="pointer-events-auto flex size-10 items-center justify-center rounded-lg border border-red-400/40 text-red-300 transition-colors [@media(hover:hover)]:hover:border-red-400/70 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
              >
                <StopIcon />
              </button>
            </div>
          </div>
        </nav>
      )}
    </>
  );
}
