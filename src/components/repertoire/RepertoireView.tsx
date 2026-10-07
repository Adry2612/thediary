"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { RepertoireItemCard } from "@/components/repertoire/RepertoireItemCard";
import { RepertoireItemForm } from "@/components/repertoire/RepertoireItemForm";
import { formatPracticeDuration } from "@/lib/dashboard-data";
import { getRepertoirePracticeStats } from "@/lib/repertoire-analytics";
import { usePracticeStore } from "@/stores/usePracticeStore";
import type { RepertoireItemKind } from "@/types/practice";

type RepertoireFilter = "all" | RepertoireItemKind;

const FILTERS: { value: RepertoireFilter; label: string }[] = [
  { value: "all", label: "Todo" },
  { value: "song", label: "Canciones" },
  { value: "lick", label: "Licks" },
];

export function RepertoireView() {
  const history = usePracticeStore((state) => state.history);
  const items = usePracticeStore((state) => state.repertoireItems);
  const saveRepertoireItem = usePracticeStore(
    (state) => state.saveRepertoireItem,
  );
  const deleteRepertoireItem = usePracticeStore(
    (state) => state.deleteRepertoireItem,
  );
  const hasHydrated = usePracticeStore((state) => state.hasHydrated);
  const persistenceError = usePracticeStore((state) => state.persistenceError);
  const [filter, setFilter] = useState<RepertoireFilter>("all");
  const practiceStats = useMemo(
    () => getRepertoirePracticeStats(history),
    [history],
  );
  const overview = useMemo(() => {
    const parts = items.flatMap((item) => item.parts);
    const totalSeconds = items.reduce(
      (itemTotal, item) =>
        itemTotal +
        item.parts.reduce(
          (partTotal, part) =>
            partTotal +
            (practiceStats.get(item.id)?.get(part.id)?.practiceSeconds ?? 0),
          0,
        ),
      0,
    );

    return {
      songCount: items.filter((item) => item.kind === "song").length,
      lickCount: items.filter((item) => item.kind === "lick").length,
      learnedCount: parts.filter((part) => part.learned).length,
      partCount: parts.length,
      totalSeconds,
    };
  }, [items, practiceStats]);
  const visibleItems = items.filter(
    (item) => filter === "all" || item.kind === filter,
  );

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
      <header className="enter mb-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
            Biblioteca musical
          </p>
          <h1 className="mt-3 font-serif text-5xl leading-[1.05] tracking-[-0.03em] sm:text-6xl">
            Mi repertorio
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-muted sm:text-base">
            Canciones, licks y partes con su progreso. El tiempo se suma al
            completar bloques vinculados durante una práctica.
          </p>
        </div>
        <Link
          href="/practice"
          className="inline-flex h-12 items-center justify-center rounded-md bg-ink px-5 text-sm font-medium text-canvas transition hover:opacity-90 active:scale-[0.98]"
        >
          Preparar práctica
        </Link>
      </header>

      <section
        aria-label="Resumen del repertorio"
        className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
      >
        {[
          { label: "Canciones", value: overview.songCount },
          { label: "Licks", value: overview.lickCount },
          {
            label: "Partes aprendidas",
            value: `${overview.learnedCount}/${overview.partCount}`,
          },
          {
            label: "Tiempo practicado",
            value: formatPracticeDuration(overview.totalSeconds / 60),
          },
        ].map((metric) => (
          <article
            key={metric.label}
            className="rounded-lg border border-line bg-surface p-4 sm:p-5"
          >
            <p className="text-xs uppercase tracking-[0.1em] text-muted">
              {metric.label}
            </p>
            <p className="mt-3 font-mono text-2xl tabular-nums sm:text-3xl">
              {metric.value}
            </p>
          </article>
        ))}
      </section>

      <RepertoireItemForm />

      <section className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-muted">
              Seguimiento
            </p>
            <h2 className="mt-2 font-serif text-3xl tracking-[-0.02em]">
              Elementos guardados
            </h2>
          </div>
          <div
            className="flex max-w-full gap-1 overflow-x-auto rounded-lg border border-line p-1"
            aria-label="Filtrar repertorio"
          >
            {FILTERS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={filter === option.value}
                onClick={() => setFilter(option.value)}
                className={`shrink-0 rounded-md px-3 py-2 text-xs transition ${filter === option.value ? "bg-ink text-canvas" : "text-muted hover:text-ink"}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {!hasHydrated ? (
          <p className="mt-5 text-sm text-muted">Cargando el repertorio…</p>
        ) : visibleItems.length > 0 ? (
          <ul className="mt-5 space-y-4">
            {visibleItems.map((item) => (
              <li key={item.id}>
                <RepertoireItemCard
                  item={item}
                  practiceStats={practiceStats.get(item.id)}
                  onSave={saveRepertoireItem}
                  onDelete={deleteRepertoireItem}
                />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-5 rounded-xl border border-dashed border-line bg-surface px-6 py-12 text-center">
            <p className="font-serif text-2xl">
              {items.length === 0
                ? "Tu repertorio empieza aquí."
                : "No hay elementos en este filtro."}
            </p>
            <p className="mx-auto mt-2 max-w-lg text-sm text-muted">
              {items.length === 0
                ? "Añade una canción o un lick, crea las partes que quieras estudiar y vincúlalas a tus bloques de práctica."
                : "Prueba otro filtro o añade un elemento de este tipo."}
            </p>
          </div>
        )}
      </section>

      {persistenceError && (
        <p className="mt-6 text-sm text-red-300" role="alert">
          No se pudo guardar el repertorio local: {persistenceError}
        </p>
      )}
      <p className="mt-8 text-center text-xs text-muted">
        {overview.learnedCount} de {overview.partCount} partes marcadas como
        aprendidas · {overview.totalSeconds
          ? "El tiempo se calcula a partir de tus sesiones completadas."
          : "Vincula partes a bloques para empezar a sumar tiempo."}
      </p>
    </main>
  );
}
