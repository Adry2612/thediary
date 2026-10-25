import { useI18nSection } from "@/i18n/I18nProvider";
import {
  getKeyDistribution,
  getTechniqueDistribution,
} from "@/utils/licks/distribution";
import { LICK_CHART_COLORS } from "@/utils/licks/presentation";
import type { GuitarLick } from "@/types/lick";

function groupLabel(
  group: ReturnType<typeof getTechniqueDistribution>["groups"][number],
  text: Record<string, string>,
): string {
  if (group.unclassified) return text.unclassified;
  if (group.labelKey) return text[group.labelKey] ?? group.id;
  return group.name ?? group.id;
}

export function TechniquesHeatmap({ licks }: { licks: GuitarLick[] }) {
  const text = useI18nSection("licks");
  const techniques = getTechniqueDistribution(licks);
  const keys = getKeyDistribution(licks);
  const circumference = 2 * Math.PI * 42;
  let accumulated = 0;

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <section className="min-w-0 rounded-xl border border-line bg-surface p-5 sm:p-6">
        <h2 className="font-sans text-lg font-semibold tracking-tight text-ink">
          {text.techniquesTitle}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {text.techniquesDescription}
        </p>

        {techniques.groups.length === 0 ? (
          <p className="mt-5 rounded-lg border border-dashed border-line bg-canvas/60 px-4 py-8 text-center text-sm text-muted">
            {text.noTechniquesData}
          </p>
        ) : (
          <ul className="mt-5 space-y-3">
            {techniques.groups.map((group, index) => (
              <li key={group.id}>
                <div className="flex items-baseline justify-between gap-3 text-xs">
                  <span className="min-w-0 truncate text-ink">
                    {groupLabel(group, text)}
                  </span>
                  <span className="shrink-0 font-mono tabular-nums text-muted">
                    {group.percentage}% · {group.count} {text.licksCount}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${Math.max(group.percentage, 2)}%`,
                      backgroundColor:
                        LICK_CHART_COLORS[index % LICK_CHART_COLORS.length],
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="min-w-0 rounded-xl border border-line bg-surface p-5 sm:p-6">
        <h2 className="font-sans text-lg font-semibold tracking-tight text-ink">
          {text.keysTitle}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {text.keysDescription}
        </p>

        {keys.groups.length === 0 ? (
          <p className="mt-5 rounded-lg border border-dashed border-line bg-canvas/60 px-4 py-8 text-center text-sm text-muted">
            {text.noKeysData}
          </p>
        ) : (
          <div className="mt-5 flex items-center gap-5">
            <svg
              viewBox="0 0 120 120"
              role="img"
              aria-label={text.keysAria}
              className="size-32 shrink-0 -rotate-90"
            >
              <circle
                cx="60"
                cy="60"
                r="42"
                fill="none"
                stroke="#27272a"
                strokeWidth="13"
              />
              {keys.groups.map((group, index) => {
                const fraction = keys.total
                  ? group.count / keys.total
                  : 0;
                const length = circumference * fraction;
                const offset = accumulated;
                accumulated += length;
                return (
                  <circle
                    key={group.id}
                    cx="60"
                    cy="60"
                    r="42"
                    fill="none"
                    stroke={
                      group.unclassified
                        ? "#57534e"
                        : LICK_CHART_COLORS[index % LICK_CHART_COLORS.length]
                    }
                    strokeWidth="13"
                    strokeDasharray={`${length} ${circumference - length}`}
                    strokeDashoffset={-offset}
                  />
                );
              })}
            </svg>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-xl tabular-nums text-ink">
                {keys.total}
              </p>
              <p className="text-xs text-muted">{text.licksCount}</p>
              <ul className="mt-3 max-h-40 space-y-1.5 overflow-y-auto pr-1">
                {keys.groups.map((group, index) => (
                  <li
                    key={group.id}
                    className="flex items-center justify-between gap-2 text-[11px]"
                  >
                    <span className="flex min-w-0 items-center gap-1.5 text-muted">
                      <span
                        aria-hidden="true"
                        className="size-2 shrink-0 rounded-full"
                        style={{
                          backgroundColor: group.unclassified
                            ? "#57534e"
                            : LICK_CHART_COLORS[
                                index % LICK_CHART_COLORS.length
                              ],
                        }}
                      />
                      <span className="truncate">
                        {groupLabel(group, text)}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono tabular-nums text-muted">
                      {group.percentage}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
