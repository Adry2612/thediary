'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { CoverArt } from '@/components/repertoire/CoverArt';
import { getRecentRepertoireItems } from '@/utils/repertoire-filtering';
import type { RepertoireItem } from '@/types/practice';
import { useI18n, useI18nSection } from '@/i18n/I18nProvider';

function formatUpdatedDate(updatedAt: string, locale: string) {
  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
  }).format(date);
}

function getItemMeta(item: RepertoireItem) {
  return [item.artist, item.album, item.releaseYear ? String(item.releaseYear) : null]
    .filter((value): value is string => Boolean(value))
    .join(' · ');
}

export function RecentRepertoire({
  items,
  hasHydrated,
}: {
  items: RepertoireItem[];
  hasHydrated: boolean;
}) {
  const home = useI18nSection('home');
  const { locale } = useI18n();
  const recentItems = useMemo(() => getRecentRepertoireItems(items), [items]);

  return (
    <section className="enter h-full rounded-xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-muted">
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
        <p className="mt-5 text-sm text-muted">{home.loadingSaved}</p>
      ) : recentItems.length > 0 ? (
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {recentItems.map((item) => {
            const learnedParts = item.parts.filter((part) => part.learned).length;
            const totalParts = item.parts.length;
            const progress =
              totalParts > 0 ? Math.round((learnedParts / totalParts) * 100) : 0;
            const updatedDate = formatUpdatedDate(item.updatedAt, locale);
            const meta = getItemMeta(item);

            return (
              <li key={item.id} className="min-w-0">
                <Link
                  href={`/repertoire/${item.id}`}
                  className="group flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/40 transition hover:border-zinc-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-200"
                >
                  <CoverArt
                    coverUrl={item.coverUrl}
                    size="card"
                    alt={item.album ?? item.title}
                  />
                  <div className="flex min-w-0 flex-1 flex-col p-3">
                    <p className="break-words hyphens-auto text-sm font-medium leading-tight text-zinc-100">
                      {item.title}
                    </p>
                    {meta && (
                      <p className="mt-1 break-words hyphens-auto text-xs leading-relaxed text-muted">
                        {meta}
                      </p>
                    )}

                    <div className="mt-auto pt-3">
                      {totalParts > 0 ? (
                        <>
                          <p className="font-mono text-[11px] text-muted">
                            {learnedParts}/{totalParts} {home.learnedParts}
                          </p>
                          <div
                            aria-hidden="true"
                            className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-zinc-800"
                          >
                            <span
                              className="block h-full rounded-full bg-accent-green-fg"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </>
                      ) : (
                        <p className="text-[11px] text-muted">{home.noParts}</p>
                      )}
                      {updatedDate && (
                        <p className="mt-2 font-mono text-[10px] text-muted">
                          {home.updated} {updatedDate}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-5 text-sm text-zinc-400">{home.noRepertoire}</p>
      )}
    </section>
  );
}
