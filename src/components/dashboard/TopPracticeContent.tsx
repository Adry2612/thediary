import type { CSSProperties } from "react";
import {
  formatPracticeDuration,
  getBarPercentage,
} from "@/utils/dashboard-data";
import type {
  PracticeContentRank,
  PracticeContentRankings,
} from "@/utils/practice-analytics";
import { useI18nSection } from "@/i18n/I18nProvider";

function ContentColumn({
  title,
  emptyLabel,
  ranking,
}: {
  title: string;
  emptyLabel: string;
  ranking: PracticeContentRank[];
}) {
  const dashboard = useI18nSection("dashboard");
  const maxSeconds = ranking[0]?.seconds ?? 0;

  return (
    <div className="min-w-0">
      <h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
        {title}
      </h3>
      {ranking.length === 0 ? (
        <p className="mt-3 text-sm text-muted">{emptyLabel}</p>
      ) : (
        <ol className="mt-3 space-y-3">
          {ranking.map((item, index) => (
            <li key={item.key} className="min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[10px] text-muted">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-zinc-200">
                  {item.label}
                </span>
              </div>
              <div className="mt-1 flex items-baseline justify-between gap-2 pl-5 text-xs text-muted">
                <span className="font-mono text-zinc-400">
                  {formatPracticeDuration(item.seconds / 60)}
                </span>
                <span>
                  {item.sessionCount}{" "}
                  {item.sessionCount === 1
                    ? dashboard.session
                    : dashboard.sessions}
                </span>
              </div>
              <div className="mt-1.5 ml-5 h-1 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-[#6d8c72]"
                  style={{
                    width: `${getBarPercentage(item.seconds, maxSeconds)}%`,
                  }}
                />
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function TopPracticeContent({
  rankings,
}: {
  rankings: PracticeContentRankings;
}) {
  const dashboard = useI18nSection("dashboard");

  return (
    <section
      className="enter rounded-xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8"
      style={{ "--index": 3 } as CSSProperties}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-muted">
            {dashboard.topContentDescription}
          </p>
          <h2 className="mt-2 font-sans text-lg leading-7 font-semibold tracking-tight text-zinc-100 sm:text-xl sm:leading-8">
            {dashboard.topContent}
          </h2>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <ContentColumn
          title={dashboard.topSong}
          emptyLabel={dashboard.topEmpty}
          ranking={rankings.songs}
        />
        <ContentColumn
          title={dashboard.topTechnique}
          emptyLabel={dashboard.topEmpty}
          ranking={rankings.techniques}
        />
        <ContentColumn
          title={dashboard.topTheory}
          emptyLabel={dashboard.topEmpty}
          ranking={rankings.theory}
        />
      </div>
    </section>
  );
}
