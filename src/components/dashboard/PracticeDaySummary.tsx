import { formatPracticeDuration } from "@/utils/dashboard-data";
import { formatDateLabel } from "@/utils/format";
import { useI18n, useI18nSection } from "@/i18n/I18nProvider";
import { getSessionPhaseLines } from "@/utils/practice-tooltip";
import type { PracticeDaySummaryData } from "@/types/dashboard";

function formatSessionTime(startedAt: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(startedAt));
}

type PracticeDaySummaryProps = {
  day: PracticeDaySummaryData;
  /** Id del título cuando el resumen se usa como región con nombre. */
  titleId?: string;
  className?: string;
  /**
   * Vista previa del calendario anual: no se puede desplazar, así que limita
   * la lista a tres sesiones y omite los bloques y las notas.
   */
  compact?: boolean;
};

/** Sesiones que caben en la vista previa no interactiva del calendario anual. */
export const COMPACT_SUMMARY_SESSION_LIMIT = 3;

/**
 * Contenido compartido del resumen de un día: lo usan la ficha flotante del
 * resumen semanal y la vista previa del calendario anual.
 */
export function PracticeDaySummary({
  day,
  titleId,
  className = "",
  compact = false,
}: PracticeDaySummaryProps) {
  const { locale } = useI18n();
  const tooltip = useI18nSection("tooltip");
  const visibleSessions = compact
    ? day.sessions.slice(0, COMPACT_SUMMARY_SESSION_LIMIT)
    : day.sessions;
  const hiddenSessionCount = day.sessions.length - visibleSessions.length;

  return (
    <div className={`flex min-h-0 flex-1 flex-col ${className}`}>
      <div className="min-w-0 shrink-0">
        <p className="text-[10px] uppercase tracking-[0.12em] text-muted">
          {tooltip.summary}
        </p>
        <h3
          id={titleId}
          className="mt-1 font-sans text-lg font-semibold capitalize leading-tight text-zinc-100"
        >
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
          <ul
            className={
              compact
                ? "mt-3 space-y-2"
                : "mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto"
            }
          >
            {visibleSessions.map((session) => {
              const phaseLines = compact ? [] : getSessionPhaseLines(session);
              return (
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
                  {phaseLines.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {phaseLines.map((phase, index) => (
                        <li
                          key={`${phase.id}-${index}`}
                          className="text-xs leading-relaxed text-zinc-400"
                        >
                          <span>{phase.name}</span>
                          <span className="ml-1 font-mono text-muted">
                            {formatPracticeDuration(
                              phase.elapsedSeconds / 60,
                            )}
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
                  {!compact && session.notes && (
                    <p className="mt-2 whitespace-pre-wrap border-t border-zinc-800 pt-2 text-xs leading-relaxed text-zinc-400">
                      {session.notes}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
          {compact && hiddenSessionCount > 0 && (
            <p className="mt-2 shrink-0 font-mono text-xs text-muted">
              +{hiddenSessionCount}{" "}
              {hiddenSessionCount === 1 ? tooltip.session : tooltip.sessions}
            </p>
          )}
        </>
      ) : (
        <p className="mt-4 border-t border-zinc-800 pt-3 text-sm text-muted">
          {tooltip.noSessions}
        </p>
      )}
    </div>
  );
}
