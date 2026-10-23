"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { TechniqueBadges } from "@/components/licks/TechniqueBadges";
import { useI18nSection } from "@/i18n/I18nProvider";
import type { ForgottenLick } from "@/utils/licks/forgotten";
import {
  getLastPracticedLabel,
  getLickTitle,
} from "@/utils/licks/presentation";

export function ForgottenLickWidget({
  forgotten,
  today,
  onMarkPracticed,
}: {
  forgotten: ForgottenLick | null;
  today: Date;
  onMarkPracticed: (lickId: string) => void;
}) {
  const text = useI18nSection("licks");
  if (!forgotten) return null;

  const { lick } = forgotten;
  const title = getLickTitle(text, lick);

  return (
    <section className="flex h-full flex-col rounded-xl border border-accent-green-fg/30 bg-accent-green-bg/40 p-5 sm:p-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent-green-fg">
        {text.forgottenEyebrow}
      </p>
      <h2 className="mt-2 font-sans text-lg font-semibold tracking-tight text-ink">
        {text.forgottenTitle}
      </h2>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded-md border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
          {lick.key ?? text.noKey}
        </span>
        <TechniqueBadges techniques={lick.techniques} showEmpty />
      </div>

      <p className="mt-4 font-sans text-xl font-semibold tracking-tight text-ink">
        {title}
      </p>
      <p className="mt-2 text-sm text-muted">
        {forgotten.daysSinceLastPractice === undefined
          ? text.forgottenNever
          : `${text.lastPracticed}: ${getLastPracticedLabel(text, lick.lastPracticedAt, today)}`}
      </p>
      {forgotten.reason === "low-frequency" ? (
        <p className="mt-2 text-xs text-muted">
          {text.forgottenLowFrequency}
        </p>
      ) : null}

      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        <Link
          href={`/licks/${lick.id}`}
          className="inline-flex h-10 items-center justify-center rounded-md border border-line px-3 text-sm text-ink transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/60"
        >
          {text.open}
        </Link>
        <Button
          type="button"
          variant="primary"
          size="field"
          onClick={() => onMarkPracticed(lick.id)}
        >
          {text.markPracticed}
        </Button>
      </div>
    </section>
  );
}
