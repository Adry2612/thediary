"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PracticeCompletionDialog } from "@/components/practice/PracticeCompletionDialog";
import { MetronomeCard } from "@/components/practice/MetronomeCard";
import { PracticeAudioRecorder } from "@/components/practice/PracticeAudioRecorder";
import { PracticeMaterials } from "@/components/practice/PracticeMaterials";
import { TimerCard } from "@/components/practice/TimerCard";
import { useMetronome } from "@/hooks/useMetronome";
import { usePracticeTimer } from "@/hooks/usePracticeTimer";
import { getLocalDateKey } from "@/lib/local-date";
import { formatClock } from "@/lib/format";
import { getTimeWeightedAverageBpm } from "@/lib/metronome-bpm";
import { createPracticeSessionRecord } from "@/lib/practice-session-record";
import {
  useActivePracticeSessionStore,
  type ActivePracticeSession,
} from "@/stores/useActivePracticeSessionStore";
import { usePracticeStore } from "@/stores/usePracticeStore";
import type { PracticePhase, PracticeTimerResult } from "@/types/practice";
import { useI18nSection } from "@/i18n/I18nProvider";

function getSessionStatus(isCompleted: boolean, isRunning: boolean): string {
  if (isCompleted) return "Práctica finalizada";
  if (isRunning) return "Práctica en curso";
  return "Práctica en pausa";
}

export function PracticeSession({ session }: { session: ActivePracticeSession }) {
  const text = useI18nSection("practice");
  const { id: sessionId, name, phases } = session;
  const [isCompleted, setIsCompleted] = useState(false);
  const [pendingResult, setPendingResult] =
    useState<PracticeTimerResult | null>(null);
  const sessionSavedRef = useRef(false);
  const completionHandledRef = useRef(false);
  const addSession = usePracticeStore((state) => state.addSession);
  const clearActiveSession = useActivePracticeSessionStore(
    (state) => state.clearActiveSession,
  );
  const addAttachedResource = useActivePracticeSessionStore(
    (state) => state.addAttachedResource,
  );
  const pathname = usePathname();
  const isPracticeRoute = pathname === "/practice";
  const router = useRouter();
  const { bpm: metronomeBpm, stop: stopMetronome } = useMetronome();
  const completeSession = useCallback(
    (result: PracticeTimerResult) => {
      if (completionHandledRef.current) return;

      completionHandledRef.current = true;
      setPendingResult(result);
      setIsCompleted(true);
    },
    [],
  );
  const timer = usePracticeTimer(phases, undefined, completeSession);
  const timerElapsedSecondsRef = useRef(timer.elapsedSeconds);
  timerElapsedSecondsRef.current = timer.elapsedSeconds;
  const previousTimerStartedAtRef = useRef(timer.startedAt);
  const bpmSamplesRef = useRef([
    { elapsedSeconds: 0, bpm: metronomeBpm },
  ]);
  useEffect(() => {
    if (previousTimerStartedAtRef.current && !timer.startedAt) {
      bpmSamplesRef.current = [{ elapsedSeconds: 0, bpm: metronomeBpm }];
    }
    previousTimerStartedAtRef.current = timer.startedAt;
  }, [metronomeBpm, timer.startedAt]);
  const recordBpmChange = useCallback(
    (bpm: number) => {
      const elapsedSeconds = timerElapsedSecondsRef.current;
      const previousSample = bpmSamplesRef.current.at(-1);
      if (previousSample?.elapsedSeconds === elapsedSeconds) {
        bpmSamplesRef.current[bpmSamplesRef.current.length - 1] = {
          elapsedSeconds,
          bpm,
        };
        return;
      }

      bpmSamplesRef.current.push({ elapsedSeconds, bpm });
    },
    [],
  );
  useEffect(() => () => stopMetronome(), [stopMetronome]);

  function saveCompletedSession(
    sessionNotes: string,
    phaseNotes: Record<number, string>,
  ) {
    if (!pendingResult || sessionSavedRef.current) return;

    sessionSavedRef.current = true;
    addSession(
      createPracticeSessionRecord({
        id: sessionId,
        title: name,
        averageBpm: getTimeWeightedAverageBpm(
          bpmSamplesRef.current,
          pendingResult.elapsedSeconds,
        ),
        result: pendingResult,
        phases,
        notes: sessionNotes,
        phaseNotes,
      }),
    );
    clearActiveSession();
    router.push(
      `/dashboard/practice/${getLocalDateKey(new Date(pendingResult.startedAt))}`,
    );
  }

  const nextPhase = phases[timer.currentPhaseIndex + 1];
  const currentPhase = phases[timer.currentPhaseIndex];

  return (
    <>
      <PracticeCompletionDialog
        result={pendingResult}
        isVisible={isPracticeRoute}
        onSave={saveCompletedSession}
      />
      <main
        className={
          isPracticeRoute
            ? "mx-auto w-full max-w-5xl space-y-6 px-6 pb-16 pt-6 sm:pb-24"
            : "hidden"
        }
        aria-hidden={!isPracticeRoute}
      >
        <div className="grid gap-6 md:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
          <TimerCard
            timer={timer}
            isCompleted={isCompleted}
            isPracticeRoute={isPracticeRoute}
          />
          <MetronomeCard
            onBpmChange={recordBpmChange}
            stopOnUnmount={false}
          />
        </div>
        {!isCompleted && (
          <section
            aria-labelledby="next-practice-phase-title"
            className="enter rounded-xl border border-line bg-surface p-6 sm:p-8"
          >
            <p className="text-xs uppercase tracking-[0.05em] text-muted">
              Plan de la sesión
            </p>
            <h2
              id="next-practice-phase-title"
              className="mt-2 font-sans text-lg leading-7 font-semibold tracking-tight sm:text-xl sm:leading-8"
            >
               {text.nextPhase}
            </h2>
            {nextPhase ? (
              <div className="mt-4 border-t border-line pt-4">
                <p className="font-medium">{nextPhase.name}</p>
                <p className="mt-1 font-mono text-xs text-muted">
                  {nextPhase.durationMinutes} min
                </p>
                {nextPhase.exercises && nextPhase.exercises.length > 0 && (
                  <p className="mt-3 text-sm text-muted">
                    {nextPhase.exercises.join(" · ")}
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted">
                 {text.noNextPhase}
              </p>
            )}
          </section>
        )}
        <PracticeMaterials
          phases={phases}
          attachedResources={session.attachedResources}
          onAttach={addAttachedResource}
        />
        <PracticeAudioRecorder
          sessionName={name}
          sessionId={sessionId}
          practiceDate={
            timer.startedAt
              ? getLocalDateKey(new Date(timer.startedAt))
              : undefined
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
                {getSessionStatus(isCompleted, timer.isRunning)}
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
