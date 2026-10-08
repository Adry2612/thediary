import type { SessionRecord } from "@/types/practice";
import { formatPracticeDuration } from "@/lib/dashboard-data";

export type PracticeTooltipDay = {
  dateKey: string;
  totalMinutes: number;
  sessionCount: number;
  sessions: SessionRecord[];
  left: number;
  top: number;
  showBelow: boolean;
};

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(dateKey: string) {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parseDateKey(dateKey));
}

function formatSessionTime(startedAt: string) {
  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(startedAt));
}

export function getPracticeTooltipPosition(
  element: HTMLElement,
): Pick<PracticeTooltipDay, "left" | "top" | "showBelow"> {
  const bounds = element.getBoundingClientRect();
  const tooltipWidth = 288;
  const left = Math.max(
    12,
    Math.min(
      bounds.left + bounds.width / 2 - tooltipWidth / 2,
      window.innerWidth - tooltipWidth - 12,
    ),
  );
  const tooltipHeight = Math.min(window.innerHeight * 0.65, 440);
  const showBelow = bounds.top < tooltipHeight + 12;
  const belowTop = Math.min(
    bounds.bottom + 10,
    window.innerHeight - tooltipHeight - 12,
  );

  return {
    left,
    top: showBelow ? Math.max(12, belowTop) : bounds.top - 10,
    showBelow,
  };
}

export function PracticeDayTooltip({ day }: { day: PracticeTooltipDay }) {
  return (
    <div
      id="practice-day-tooltip"
      role="tooltip"
      className={`pointer-events-none fixed z-300 max-h-[70vh] w-72 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950 p-4 text-left text-zinc-200 ${day.showBelow ? "" : "-translate-y-full"}`}
      style={{ left: day.left, top: day.top }}
    >
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-500">
          Resumen de práctica
        </p>
        <h3 className="mt-1 font-sans text-lg font-semibold capitalize leading-tight text-zinc-100">
          {formatDate(day.dateKey)}
        </h3>
      </div>

      {day.sessionCount > 0 ? (
        <>
          <div className="mt-4 flex items-center justify-between border-y border-zinc-800 py-3">
            <span className="text-sm text-zinc-400">
              {day.sessionCount}{" "}
              {day.sessionCount === 1 ? "sesión" : "sesiones"}
            </span>
            <span className="font-mono text-sm text-zinc-100">
              {formatPracticeDuration(day.totalMinutes)}
            </span>
          </div>
          <ul className="mt-3 max-h-[40vh] space-y-3 overflow-y-auto">
            {day.sessions.map((session) => (
              <li
                key={session.id}
                className="border-l-2 border-[#6d8c72] pl-3"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <p className="min-w-0 truncate text-sm font-medium text-zinc-200">
                    {session.title || "Sesión de práctica"}
                  </p>
                  <span className="shrink-0 font-mono text-[10px] text-zinc-500">
                    {formatSessionTime(session.startedAt)}
                  </span>
                </div>
                <p className="mt-1 font-mono text-xs text-zinc-500">
                  {formatPracticeDuration(session.durationSeconds / 60)}
                  {session.averageBpm > 0 && ` · ${session.averageBpm} BPM`}
                </p>
                {session.phases && session.phases.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {session.phases.map((phase, index) => (
                      <li
                        key={`${phase.id}-${index}`}
                        className="text-xs leading-relaxed text-zinc-400"
                      >
                        <span>{phase.name}</span>
                        <span className="ml-1 font-mono text-zinc-500">
                          {formatPracticeDuration(phase.elapsedSeconds / 60)}
                        </span>
                        {phase.notes && (
                          <p className="mt-0.5 whitespace-pre-wrap text-zinc-500">
                            {phase.notes}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                {session.notes && (
                  <p className="mt-2 whitespace-pre-wrap border-t border-zinc-800 pt-2 text-xs leading-relaxed text-zinc-400">
                    {session.notes}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-4 border-t border-zinc-800 pt-3 text-sm text-zinc-500">
          No hay sesiones registradas este día.
        </p>
      )}
    </div>
  );
}
