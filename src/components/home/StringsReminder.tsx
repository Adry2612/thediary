"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useI18nSection } from "@/i18n/I18nProvider";
import { usePracticeStore } from "@/stores/usePracticeStore";
import { sortGuitarsByMaintenance } from "@/utils/equipment";

/**
 * Una sola línea en Inicio, y solo cuando toca cambiar cuerdas. Si todo está al
 * día no ocupa espacio: es una tarea de seis veces al año, no un panel.
 */
export function StringsReminder({ today }: { today: Date }) {
  const home = useI18nSection("home");
  const equipment = useI18nSection("equipment");
  const guitars = usePracticeStore((state) => state.guitars);
  const guitarEntries = usePracticeStore((state) => state.guitarEntries);
  const history = usePracticeStore((state) => state.history);

  const next = useMemo(() => {
    const top = sortGuitarsByMaintenance(
      guitars,
      guitarEntries,
      history,
      today,
    )[0];
    if (!top) return null;
    if (
      top.maintenance.state !== "due" &&
      top.maintenance.state !== "soon"
    ) {
      return null;
    }
    return top;
  }, [guitars, guitarEntries, history, today]);

  if (!next) return null;

  const { guitar, maintenance } = next;
  const isDue = maintenance.state === "due";
  const detail = isDue
    ? null
    : maintenance.daysRemaining !== null
      ? `${maintenance.daysRemaining} ${equipment.daysShort}`
      : maintenance.hoursRemaining !== null
        ? `${maintenance.hoursRemaining} ${equipment.hoursShort}`
        : null;

  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-y border-line py-3 text-sm">
      <p className="min-w-0">
        <span className="font-medium text-ink">{guitar.name}</span>
        <span className="text-muted"> · </span>
        <span className={isDue ? "text-red-300" : "text-amber-300"}>
          {isDue ? equipment.stateDue : equipment.stateSoon}
        </span>
        {detail && <span className="text-muted"> · {detail}</span>}
      </p>
      <Link
        href="/tools#tools-strings"
        className="text-sm text-muted underline underline-offset-4 hover:text-ink"
      >
        {home.stringsLink}
      </Link>
    </div>
  );
}
