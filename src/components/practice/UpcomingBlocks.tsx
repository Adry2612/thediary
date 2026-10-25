import { getPracticeBlockTitle } from "@/utils/practice-session-details";
import type { PracticePhase, RepertoireItem } from "@/types/practice";
import { useI18nSection } from "@/i18n/I18nProvider";

type UpcomingBlocksProps = {
  phases: PracticePhase[];
  currentPhaseIndex: number;
  repertoireItems: RepertoireItem[];
};

/**
 * Bloques que quedan por delante del actual. Es informativo: no avanza el
 * temporizador ni cambia el bloque en curso.
 */
export function UpcomingBlocks({
  phases,
  currentPhaseIndex,
  repertoireItems,
}: UpcomingBlocksProps) {
  const text = useI18nSection("practice");
  const skills = useI18nSection("skills");
  const upcoming = phases.slice(currentPhaseIndex + 1);

  return (
    <section
      aria-labelledby="upcoming-blocks-title"
      className="enter rounded-xl border border-line bg-surface p-6 sm:p-8"
    >
      <p className="text-xs uppercase tracking-[0.05em] text-muted">
        {text.sessionPlan}
      </p>
      <h2
        id="upcoming-blocks-title"
        className="mt-2 font-sans text-lg leading-7 font-semibold tracking-tight sm:text-xl sm:leading-8"
      >
        {text.upcomingBlocks}
      </h2>

      {upcoming.length > 0 ? (
        <ol className="mt-5 space-y-3">
          {upcoming.map((phase, index) => {
            const details = phase.exercises ?? [];
            const isNext = index === 0;

            return (
              <li
                key={`${phase.id}-${index}`}
                className="relative flex gap-3"
              >
                <span
                  aria-hidden="true"
                  className="relative flex w-3 shrink-0 justify-center"
                >
                  {index < upcoming.length - 1 && (
                    <span className="absolute bottom-[-12px] top-4 w-px bg-line" />
                  )}
                  <span
                    className={`relative mt-3 size-2.5 rounded-full ${
                      isNext
                        ? "bg-accent-green-fg"
                        : "border border-muted/60 bg-surface"
                    }`}
                  />
                </span>
                <div
                  className={`min-w-0 flex-1 rounded-lg border p-4 ${
                    isNext
                      ? "border-accent-green-fg/30 bg-accent-green-bg/25"
                      : "border-line bg-canvas/40"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="min-w-0 hyphens-auto break-words font-medium text-ink">
                      {getPracticeBlockTitle(phase, repertoireItems) ||
                        `${text.currentBlock} ${currentPhaseIndex + index + 2}`}
                    </p>
                    {isNext && (
                      <span className="shrink-0 rounded-full border border-accent-green-fg/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-accent-green-fg">
                        {text.nextBlock}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 font-mono text-xs text-muted">
                    {skills[phase.skill]}
                    {phase.durationMinutes !== undefined &&
                      ` · ${phase.durationMinutes} min`}
                  </p>
                  {details.length > 0 && (
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-sm leading-relaxed text-muted marker:text-muted/60">
                      {details.map((detail, detailIndex) => (
                        <li
                          key={`${detail}-${detailIndex}`}
                          className="hyphens-auto break-words"
                        >
                          {detail}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="mt-4 text-sm text-muted">{text.noUpcomingBlocks}</p>
      )}
    </section>
  );
}
