import type { RefObject } from "react";
import { formatPracticeDuration } from "@/utils/dashboard-data";
import { formatDateLabel } from "@/utils/format";
import { useI18n, useI18nSection } from "@/i18n/I18nProvider";
import type { PracticeTooltipDay } from "@/types/dashboard";

function formatSessionTime(startedAt: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(startedAt));
}

type PracticeDayTooltipProps = {
  day: PracticeTooltipDay;
  cardRef?: RefObject<HTMLDivElement | null>;
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
};

export function PracticeDayTooltip({
  day,
  cardRef,
  onPointerEnter,
  onPointerLeave,
}: PracticeDayTooltipProps) {
  const { locale } = useI18n();
  const tooltip = useI18nSection("tooltip");
  return (
    <div
      ref={cardRef}
      id="practice-day-tooltip"
      role="tooltip"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      className={`pointer-events-auto fixed z-300 flex w-72 max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-lg border border-zinc-700 bg-zinc-950 p-4 text-left text-zinc-200 ${day.showBelow ? "" : "-translate-y-full"}`}
      style={{ left: day.left, top: day.top, maxHeight: day.maxHeight }}
    >
      <div className="min-w-0 shrink-0">
        <p className="text-[10px] uppercase tracking-[0.12em] text-muted">
           {tooltip.summary}
        </p>
        <h3 className="mt-1 font-sans text-lg font-semibold capitalize leading-tight text-zinc-100">
           {formatDateLabel(day.dateKey, locale, true)}
        </h3>
      </div>

      {day.sessionCount > 0 ? (
        <>
          <div className="mt-4 flex shrink-0 items-center justify-between border-y border-zinc-800 py-3">
            <span className="text-sm text-zinc-400">
              {day.sessionCount}{" "}
               {day.sessionCount === 1 ? tooltip.session : tooltip.sessions}
            </span>
            <span className="font-mono text-sm text-zinc-100">
              {formatPracticeDuration(day.totalMinutes)}
            </span>
          </div>
          <ul className="mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto">
            {day.sessions.map((session) => (
              <li
                key={session.id}
                className="border-l-2 border-[#6d8c72] pl-3"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <p className="min-w-0 truncate text-sm font-medium text-zinc-200">
                     {session.title || tooltip.defaultTitle}
                  </p>
                  <span className="shrink-0 font-mono text-[10px] text-muted">
                     {formatSessionTime(session.startedAt, locale)}
                  </span>
                </div>
                <p className="mt-1 font-mono text-xs text-muted">
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
                        <span className="ml-1 font-mono text-muted">
                          {formatPracticeDuration(phase.elapsedSeconds / 60)}
                        </span>
                        {phase.notes && (
                          <p className="mt-0.5 whitespace-pre-wrap text-muted">
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
        <p className="mt-4 border-t border-zinc-800 pt-3 text-sm text-muted">
           {tooltip.noSessions}
        </p>
      )}
    </div>
  );
}
