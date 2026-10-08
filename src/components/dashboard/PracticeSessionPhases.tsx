import Link from "next/link";
import {
  formatPracticeDuration,
  PRACTICE_SKILL_LABELS,
} from "@/lib/dashboard-data";
import { formatClock } from "@/lib/format";
import { getLinkedPartLabel } from "@/lib/practice-session-details";
import type { RepertoireItem, SessionPhaseRecord } from "@/types/practice";

interface PracticeSessionPhasesProps {
  sessionId: string;
  phases: SessionPhaseRecord[] | undefined;
  repertoireItems: RepertoireItem[];
}

export function PracticeSessionPhases({
  sessionId,
  phases,
  repertoireItems,
}: PracticeSessionPhasesProps) {
  return (
    <section
      aria-labelledby={`session-phases-${sessionId}`}
      className="mt-6"
    >
      <h3
        id={`session-phases-${sessionId}`}
        className="text-base font-semibold text-ink"
      >
        Bloques de práctica
      </h3>
      {phases?.length ? (
        <div className="mt-3 overflow-x-auto border-y border-line">
          <table className="w-full min-w-[38rem] table-fixed text-left">
            <colgroup>
              <col className="w-[22%]" />
              <col className="w-[56%]" />
              <col className="w-[22%]" />
            </colgroup>
            <thead className="bg-canvas/70">
              <tr className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted sm:text-xs">
                <th scope="col" className="px-3 py-3 font-normal sm:px-5">
                  Bloque
                </th>
                <th scope="col" className="px-3 py-3 font-normal sm:px-5">
                  Qué se practicó
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-right font-normal sm:px-5"
                >
                  Tiempo
                </th>
              </tr>
            </thead>
            <tbody>
              {phases.map((phase, index) => {
                const linkedPart = getLinkedPartLabel(phase, repertoireItems);
                const hasDetails =
                  Boolean(phase.exercises?.length) ||
                  Boolean(phase.resources?.length) ||
                  Boolean(phase.notes) ||
                  linkedPart !== null;

                return (
                  <tr
                    key={`${phase.id}-${index}`}
                    className="border-t border-line align-top"
                  >
                    <th
                      scope="row"
                      className="px-3 py-4 text-sm font-medium text-ink sm:px-5"
                    >
                      <span className="block break-words">{phase.name}</span>
                      <span className="mt-1 block text-xs font-normal text-muted">
                        {PRACTICE_SKILL_LABELS[phase.skill]}
                      </span>
                    </th>
                    <td className="px-3 py-4 text-xs leading-relaxed text-muted sm:px-5 sm:text-sm">
                      {hasDetails ? (
                        <div className="space-y-1.5">
                          {phase.exercises && phase.exercises.length > 0 && (
                            <p>{phase.exercises.join(", ")}</p>
                          )}
                          {linkedPart && (
                            <p>
                              <span className="text-ink">Repertorio:</span>{" "}
                              {linkedPart}
                            </p>
                          )}
                          {phase.resources && phase.resources.length > 0 && (
                            <p>
                              Material:{" "}
                              {phase.resources
                                .map((resource) => resource.title)
                                .join(", ")}
                            </p>
                          )}
                          {phase.notes && (
                            <p className="whitespace-pre-wrap">
                              {phase.notes}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="italic text-muted/70">
                          Sin detalles registrados
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-4 text-right text-xs text-muted sm:px-5">
                      {phase.durationMinutes !== undefined && (
                        <span className="block">
                          Plan ·{" "}
                          {formatPracticeDuration(phase.durationMinutes)}
                        </span>
                      )}
                      <span className="mt-1 block whitespace-nowrap font-mono text-sm tabular-nums text-ink">
                        Real · {formatClock(phase.elapsedSeconds)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted">
          Esta sesión no contiene el detalle de sus bloques.
        </p>
      )}
      {phases?.length ? (
        <Link
          href={`/practice?repeatSessionId=${encodeURIComponent(sessionId)}`}
          className="mt-4 inline-flex h-11 items-center justify-center border border-line px-4 text-sm font-medium text-ink transition hover:bg-white/5 focus-visible:outline-offset-2 focus-visible:outline-accent-green-fg"
        >
          Repetir práctica
        </Link>
      ) : (
        <p className="mt-4 text-xs text-muted">
          No se guardaron bloques para poder repetir esta sesión.
        </p>
      )}
    </section>
  );
}
