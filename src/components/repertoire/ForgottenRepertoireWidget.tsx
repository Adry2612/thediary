"use client";

import Link from "next/link";
import { useI18nSection } from "@/i18n/I18nProvider";
import type { ForgottenRepertoireItem } from "@/lib/repertoire-forgotten";

function formatDaysAgo(text: Record<string, string>, days: number) {
  return days === 1
    ? `${text.forgottenDayAgoPrefix}${days}${text.forgottenDayAgoSuffix}`
    : `${text.forgottenDaysAgoPrefix}${days}${text.forgottenDaysAgoSuffix}`;
}

export function ForgottenRepertoireWidget({
  forgotten,
}: {
  forgotten: ForgottenRepertoireItem | null;
}) {
  const text = useI18nSection("repertoire");
  if (!forgotten) return null;

  const { item } = forgotten;
  const learnedParts = item.parts.filter((part) => part.learned).length;

  return (
    <section className="flex flex-col gap-5 rounded-xl border border-accent-green-fg/30 bg-accent-green-bg/40 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent-green-fg">
          {text.forgottenEyebrow}
        </p>
        <h2 className="mt-2 font-sans text-lg font-semibold tracking-tight text-ink">
          {text.forgottenTitle}
        </h2>

        <p className="mt-3 font-sans text-xl font-semibold tracking-tight text-ink">
          {item.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          {item.artist ? <span>{item.artist}</span> : null}
          {item.parts.length > 0 ? (
            <span>
              {learnedParts}/{item.parts.length} {text.learnedParts}
            </span>
          ) : null}
        </div>

        <p className="mt-3 text-sm text-muted">
          {forgotten.daysSinceLastPractice === undefined
            ? text.forgottenNever
            : `${text.forgottenLastPracticed}: ${formatDaysAgo(text, forgotten.daysSinceLastPractice)}`}
        </p>
        {forgotten.reason === "low-frequency" &&
        forgotten.daysSinceLastPractice !== undefined ? (
          <p className="mt-1 text-xs text-muted">
            {text.forgottenLowFrequency}
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        <Link
          href={`/repertoire/${item.id}`}
          className="inline-flex h-10 items-center justify-center rounded-md border border-line px-3 text-sm text-ink transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/60"
        >
          {text.forgottenOpen}
        </Link>
        <Link
          href={`/practice?quickRepertoire=${encodeURIComponent(item.id)}`}
          className="inline-flex h-10 items-center justify-center rounded-md bg-ink px-3 text-sm text-canvas transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/60"
        >
          {text.forgottenPractice}
        </Link>
      </div>
    </section>
  );
}
