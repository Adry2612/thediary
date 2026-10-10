"use client";

import { useMemo } from "react";
import Link from "next/link";
import { getRecentRepertoireItems } from "@/lib/repertoire-filtering";
import type { RepertoireItem } from "@/types/practice";
import { useI18nSection } from "@/i18n/I18nProvider";

function formatUpdatedDate(updatedAt: string) {
  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export function RecentRepertoire({
  items,
  hasHydrated,
}: {
  items: RepertoireItem[];
  hasHydrated: boolean;
}) {
  const home = useI18nSection("home");
  const recentItems = useMemo(() => getRecentRepertoireItems(items), [items]);

  return (
    <section className="enter h-full rounded-xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">
             {home.savedLibrary}
          </p>
          <h2 className="mt-2 font-sans text-lg leading-7 font-semibold tracking-tight text-zinc-100 sm:text-xl sm:leading-8">
             {home.recentRepertoire}
          </h2>
        </div>
        <Link
          href="/repertoire"
          className="text-sm text-zinc-300 underline decoration-zinc-700 underline-offset-4 transition hover:text-zinc-100"
        >
           {home.viewRepertoire}
        </Link>
      </div>

      {!hasHydrated ? (
        <p className="mt-5 text-sm text-zinc-500">
           {home.loadingSaved}
        </p>
      ) : recentItems.length > 0 ? (
        <ul className="mt-5 divide-y divide-zinc-800">
          {recentItems.map((item) => {
            const learnedParts = item.parts.filter((part) => part.learned).length;
            const updatedDate = formatUpdatedDate(item.updatedAt);

            return (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="break-words font-medium leading-tight text-zinc-100">
                    {item.title}
                  </p>
                  <p className="mt-1 truncate text-sm text-zinc-500">
                     {item.kind === "song" ? home.song ?? home.savedLibrary : home.lick ?? home.recentRepertoire}
                    {item.artist ? ` · ${item.artist}` : ""}
                  </p>
                </div>
                <div className="shrink-0 text-right font-mono text-xs text-zinc-500">
                  <p>
                     {learnedParts}/{item.parts.length} {home.learnedParts}
                  </p>
                  {updatedDate && (
                     <p className="mt-1">{home.updated} {updatedDate}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-5 text-sm text-zinc-400">
           {home.noRepertoire}
        </p>
      )}
    </section>
  );
}
