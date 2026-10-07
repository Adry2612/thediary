"use client";

import { useCallback, useState } from "react";
import { MetronomeCard } from "@/components/practice/MetronomeCard";
import { PracticeAudioRecorder } from "@/components/practice/PracticeAudioRecorder";
import { PracticeMaterials } from "@/components/practice/PracticeMaterials";
import { TimerCard } from "@/components/practice/TimerCard";
import { TextArea } from "@/components/ui/Field";
import { usePracticeStore } from "@/stores/usePracticeStore";
import type { PracticePhase, PracticeTimerResult } from "@/types/practice";

export function PracticeSession({
  name,
  phases,
}: {
  name: string;
  phases: PracticePhase[];
}) {
  const [bpm, setBpm] = useState(80);
  const [isCompleted, setIsCompleted] = useState(false);
  const [sessionNotes, setSessionNotes] = useState("");
  const [phaseNotes, setPhaseNotes] = useState<Record<number, string>>({});
  const addSession = usePracticeStore((state) => state.addSession);

  const completeSession = useCallback(
    (result: PracticeTimerResult) => {
      addSession({
        id: crypto.randomUUID(),
        title: name,
        startedAt: result.startedAt,
        durationSeconds: result.elapsedSeconds,
        averageBpm: bpm,
        skillSeconds: result.skillSeconds,
        notes: sessionNotes.trim() || undefined,
        phases: result.phases.map((phase, index) => ({
          ...phase,
          exercises: [...(phases[index]?.exercises ?? [])],
          notes: phaseNotes[index]?.trim() || undefined,
          repertoireItemId: phases[index]?.repertoireItemId,
          repertoirePartId: phases[index]?.repertoirePartId,
        })),
      });
      setIsCompleted(true);
    },
    [addSession, bpm, name, phaseNotes, phases, sessionNotes],
  );

  return (
    <>
      <div className="grid gap-6 md:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
        <TimerCard phases={phases} onComplete={completeSession} />
        <MetronomeCard initialBpm={bpm} onBpmChange={setBpm} />
      </div>
      <section className="enter space-y-5 rounded-xl border border-line bg-surface p-6 sm:p-8">
        <label className="block text-sm text-ink">
          Notas de la sesión
          <TextArea
            value={sessionNotes}
            onChange={(event) => setSessionNotes(event.target.value)}
            placeholder="Sensaciones, objetivos o ideas para la próxima práctica…"
            rows={3}
            disabled={isCompleted}
            className="mt-2"
          />
        </label>
        <details>
          <summary className="cursor-pointer text-sm text-ink underline decoration-line underline-offset-4">
            Notas de cada bloque
          </summary>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {phases.map((phase, index) => (
              <label
                key={`${phase.id}-${index}`}
                className="block text-sm text-ink"
              >
                {phase.name}
                <TextArea
                  value={phaseNotes[index] ?? ""}
                  onChange={(event) =>
                    setPhaseNotes((current) => ({
                      ...current,
                      [index]: event.target.value,
                    }))
                  }
                  placeholder={`Notas para ${phase.name.toLowerCase()}…`}
                  rows={3}
                  disabled={isCompleted}
                  className="mt-2"
                />
              </label>
            ))}
          </div>
        </details>
        {isCompleted && (
          <p className="text-sm text-muted" role="status">
            Las notas se guardaron con la sesión.
          </p>
        )}
      </section>
      <PracticeMaterials phases={phases} />
      <PracticeAudioRecorder sessionName={name} shouldStop={isCompleted} />
    </>
  );
}
