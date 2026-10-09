"use client";

import Link from "next/link";
import { use } from "react";
import { RepertoireItemCard } from "@/components/repertoire/RepertoireItemCard";
import { getRepertoirePracticeStats } from "@/lib/repertoire-analytics";
import { usePracticeStore } from "@/stores/usePracticeStore";

interface Props {
  params: Promise<{ id: string }>;
}

export default function RepertoireDetailPage({ params }: Props) {
  const items = usePracticeStore((state) => state.repertoireItems);
  const saveRepertoireItem = usePracticeStore(
    (state) => state.saveRepertoireItem,
  );
  const deleteRepertoireItem = usePracticeStore(
    (state) => state.deleteRepertoireItem,
  );
  const hasHydrated = usePracticeStore((state) => state.hasHydrated);
  const history = usePracticeStore((state) => state.history);
  const { id: itemId } = use(params);
  const item = items.find((candidate) => candidate.id === itemId);
  const practiceStats = getRepertoirePracticeStats(history).get(itemId);

  if (!hasHydrated) {
    return <main className="mx-auto max-w-5xl px-5 py-16 text-sm text-muted">Cargando…</main>;
  }

  if (!item) {
    return (
      <main className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
        <Link href="/repertoire" className="text-sm text-muted underline underline-offset-4">
          Volver al repertorio
        </Link>
        <h1 className="mt-8 font-sans text-3xl font-semibold">Elemento no encontrado</h1>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <Link href="/repertoire" className="text-sm text-muted underline underline-offset-4">
        ← Volver al repertorio
      </Link>
      <header className="mb-8 mt-8">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">Detalle del repertorio</p>
        <h1 className="mt-3 font-sans text-3xl font-semibold tracking-tight sm:text-4xl">{item.title}</h1>
      </header>
      <RepertoireItemCard
        item={item}
        practiceStats={practiceStats}
        onSave={saveRepertoireItem}
        onDelete={deleteRepertoireItem}
        detail
      />
    </main>
  );
}
