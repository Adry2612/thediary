"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PracticeCompletionDialog } from "@/components/practice/PracticeCompletionDialog";
import { MetronomeCard } from "@/components/practice/MetronomeCard";
import { PracticeAudioRecorder } from "@/components/practice/PracticeAudioRecorder";
import { SplitViewIcon } from "@/components/ui/icons";
import { PracticeMaterials } from "@/components/practice/PracticeMaterials";
import { LickTab } from "@/components/licks/LickTab";
import { Card } from "@/components/ui/Card";
import { TimerCard } from "@/components/practice/TimerCard";
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
  const licksText = useI18nSection("licks");
  const { id: sessionId, name, phases } = session;
  const [isCompleted, setIsCompleted] = useState(false);
  const [pendingResult, setPendingResult] =
    useState<PracticeTimerResult | null>(null);
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
  const pathname = usePathname();
  const isPracticeRoute = pathname === "/practice";
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

  const nextPhase = phases[timer.currentPhaseIndex + 1];
  const currentPhase = phases[timer.currentPhaseIndex];
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
    <TimerCard
      timer={timer}
      isCompleted={isCompleted}
      isPracticeRoute={isPracticeRoute}
      onDiscard={discardSession}
      practiceStartSound={practiceStartSound}
      setPracticeStartSound={setPracticeStartSound}
      practiceEndSound={practiceEndSound}
      setPracticeEndSound={setPracticeEndSound}
      artist={currentRepertoireItem?.artist}
      title={currentRepertoireItem?.title ?? currentPhase?.name}
      repertoireSongs={repertoireSongs}
      onChangeRepertoireSong={changeCurrentSong}
    />
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
  const nextPhasePanel = !isCompleted && (
    <section
      aria-labelledby="next-practice-phase-title"
      className="enter rounded-xl border border-line bg-surface p-6 sm:p-8"
    >
      <p className="text-xs uppercase tracking-[0.05em] text-muted">Plan de la sesión</p>
      <h2
        id="next-practice-phase-title"
        className="mt-2 font-sans text-lg leading-7 font-semibold tracking-tight sm:text-xl sm:leading-8"
      >
        {text.nextPhase}
      </h2>
      {nextPhase ? (
        <div className="mt-4 border-t border-line pt-4">
          <p className="font-medium">
            {getPracticeBlockTitle(nextPhase, repertoireItems)}
          </p>
          <p className="mt-1 font-mono text-xs text-muted">
            {nextPhase.durationMinutes} min
          </p>
          {nextPhase.exercises && nextPhase.exercises.length > 0 && (
            <p className="mt-3 text-sm text-muted">{nextPhase.exercises.join(" · ")}</p>
          )}
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted">{text.noNextPhase}</p>
      )}
    </section>
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
              {nextPhasePanel}
              {recorder}
            </div>
            <aside className="min-h-0 min-w-0 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:min-h-0 lg:overflow-y-auto">
              {materials}
            </aside>
          </div>
        ) : (
          <>
            {timerAndMetronome}
            {nextPhasePanel}
            {materials}
            {recorder}
          </>
        )}
      </main>
      {!isPracticeRoute && (
        <nav aria-label="Práctica en curso">
          <Link
            href="/practice"
            aria-label={`Volver a la práctica en curso: ${name}`}
            className="fixed inset-x-3 bottom-3 z-40 mx-auto flex w-[calc(100%-1.5rem)] max-w-2xl items-center gap-3 rounded-xl border border-line bg-surface p-3 transition-colors hover:bg-white/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-green-fg sm:bottom-5 sm:gap-4 sm:p-4"
          >
            <span
              aria-hidden="true"
              className={`size-2.5 shrink-0 rounded-full ${
                timer.isRunning
                  ? "bg-accent-green-fg"
                  : "border border-muted bg-transparent"
              }`}
            />
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] uppercase tracking-[0.05em] text-muted sm:text-xs">
                {sessionStatusLabel}
              </span>
              <span className="block truncate text-sm font-medium text-ink sm:text-base">
                {name}
                {timer.currentPhase ? ` · ${timer.currentPhase.name}` : ""}
              </span>
            </span>
            {timer.currentPhase && !isCompleted && (
              <span className="shrink-0 font-mono text-sm tabular-nums text-ink sm:text-base">
                {formatClock(timer.remainingSeconds)}
              </span>
            )}
            <span className="shrink-0 border border-line bg-white/[0.06] px-3 py-2 text-xs font-medium text-ink sm:px-4 sm:text-sm">
              <span className="sm:hidden">Volver</span>
              <span className="hidden sm:inline">Volver a la práctica</span>
            </span>
          </Link>
        </nav>
      )}
    </>
  );
}
