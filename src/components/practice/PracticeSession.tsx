"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PracticeCompletionDialog } from "@/components/practice/PracticeCompletionDialog";
import { MetronomeCard } from "@/components/practice/MetronomeCard";
import { PracticeAudioRecorder } from "@/components/practice/PracticeAudioRecorder";
import { PracticeMaterials } from "@/components/practice/PracticeMaterials";
import { TimerCard } from "@/components/practice/TimerCard";
import { usePracticeTimer } from "@/hooks/usePracticeTimer";
import { getLocalDateKey } from "@/lib/local-date";
import { createPracticeSessionRecord } from "@/lib/practice-session-record";
import { usePracticeStore } from "@/stores/usePracticeStore";
import type { PracticePhase, PracticeTimerResult } from "@/types/practice";

export function PracticeSession({
  name,
  phases,
}: {
  name: string;
  phases: PracticePhase[];
}) {
  const [sessionId] = useState(() => crypto.randomUUID());
  const [bpm, setBpm] = useState(80);
  const [isCompleted, setIsCompleted] = useState(false);
  const [pendingResult, setPendingResult] =
    useState<PracticeTimerResult | null>(null);
  const sessionSavedRef = useRef(false);
  const completionHandledRef = useRef(false);
  const addSession = usePracticeStore((state) => state.addSession);
  const router = useRouter();

  const completeSession = useCallback(
    (result: PracticeTimerResult) => {
      if (completionHandledRef.current) return;

      completionHandledRef.current = true;
      setPendingResult(result);
      setIsCompleted(true);
    },
    [],
  );

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
        averageBpm: bpm,
        result: pendingResult,
        phases,
        notes: sessionNotes,
        phaseNotes,
      }),
    );
    router.push(
      `/dashboard/practice/${getLocalDateKey(new Date(pendingResult.startedAt))}`,
    );
  }

  const timer = usePracticeTimer(phases, undefined, completeSession);
  const nextPhase = phases[timer.currentPhaseIndex + 1];
  const currentPhase = phases[timer.currentPhaseIndex];

  return (
    <>
      <PracticeCompletionDialog
        result={pendingResult}
        onSave={saveCompletedSession}
      />
      <div className="grid gap-6 md:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
        <TimerCard
          timer={timer}
          isCompleted={isCompleted}
        />
        <MetronomeCard initialBpm={bpm} onBpmChange={setBpm} />
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
            Siguiente bloque
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
              Este es el último bloque de la sesión.
            </p>
          )}
        </section>
      )}
      <PracticeMaterials phases={phases} />
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
    </>
  );
}
