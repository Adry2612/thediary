"use client";

import { useRouter } from "next/navigation";
import { LickEditor } from "@/components/licks/LickEditor";
import { BackLink } from "@/components/ui/BackLink";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageShell } from "@/components/ui/PageShell";
import { useI18nSection } from "@/i18n/I18nProvider";
import { usePracticeStore } from "@/stores/usePracticeStore";

/**
 * Carga el lick y sus canciones del almacén y monta el editor a pantalla
 * completa. Se usa tanto para crear como para editar.
 */
export function LickEditorPage({ id }: { id?: string }) {
  const text = useI18nSection("licks");
  const router = useRouter();
  const licks = usePracticeStore((state) => state.licks);
  const items = usePracticeStore((state) => state.repertoireItems);
  const hasHydrated = usePracticeStore((state) => state.hasHydrated);
  const saveLick = usePracticeStore((state) => state.saveLick);
  const lick = id ? licks.find((candidate) => candidate.id === id) : undefined;
  const songs = items.filter((item) => item.kind === "song");

  if (!hasHydrated) {
    return (
      <PageShell>
        <p className="text-sm text-muted">{text.loading}</p>
      </PageShell>
    );
  }

  if (id && !lick) {
    return (
      <PageShell>
        <BackLink href="/licks">{text.back}</BackLink>
        <PageHeader
          className="mt-8"
          title={text.notFound}
          description={text.notFoundDescription}
        />
      </PageShell>
    );
  }

  return (
    <LickEditor
      key={lick?.id ?? "new"}
      lick={lick ?? null}
      songs={songs}
      onSave={(next) => {
        saveLick(next);
        router.push(`/licks/${next.id}`);
      }}
      onSaveDraft={(next) => saveLick(next)}
      onCancel={() => router.push(lick ? `/licks/${lick.id}` : "/licks")}
    />
  );
}
