"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { GuitarDialog } from "@/components/tools/GuitarDialog";
import { GuitarHistoryDialog } from "@/components/tools/GuitarHistoryDialog";
import { GuitarRow } from "@/components/tools/GuitarRow";
import { StringChangeDialog } from "@/components/tools/StringChangeDialog";
import { useI18nSection } from "@/i18n/I18nProvider";
import { usePracticeStore } from "@/stores/usePracticeStore";
import { sortGuitarsByMaintenance } from "@/utils/equipment";
import { parseDateKey } from "@/utils/practice-calendar";
import type {
  Guitar,
  GuitarEntry,
  GuitarStringKind,
} from "@/types/equipment";

/**
 * Bloque de cuerdas de Herramientas. Una fila por guitarra, sin resumen de
 * cifras: el estado de cada fila ya dice lo que hay que saber.
 */
export function StringsPanel({ todayKey }: { todayKey: string }) {
  const text = useI18nSection("equipment");
  const guitars = usePracticeStore((state) => state.guitars);
  const guitarEntries = usePracticeStore((state) => state.guitarEntries);
  const history = usePracticeStore((state) => state.history);
  const hasHydrated = usePracticeStore((state) => state.hasHydrated);
  const saveGuitar = usePracticeStore((state) => state.saveGuitar);
  const deleteGuitar = usePracticeStore((state) => state.deleteGuitar);
  const saveGuitarEntry = usePracticeStore((state) => state.saveGuitarEntry);
  const deleteGuitarEntry = usePracticeStore(
    (state) => state.deleteGuitarEntry,
  );
  const [editing, setEditing] = useState<Guitar | "new" | null>(null);
  const [historyGuitar, setHistoryGuitar] = useState<Guitar | null>(null);
  const [stringsGuitar, setStringsGuitar] = useState<Guitar | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const today = useMemo(() => parseDateKey(todayKey), [todayKey]);
  const sorted = useMemo(
    () =>
      sortGuitarsByMaintenance(guitars, guitarEntries, history, today),
    [guitars, guitarEntries, history, today],
  );

  function handleSaveGuitar(guitar: Guitar, photoFailed: boolean) {
    saveGuitar(guitar);
    setEditing(null);
    if (photoFailed) setNotice(text.photoError);
  }

  function handleDeleteGuitar(guitar: Guitar) {
    if (!window.confirm(text.deleteConfirm)) return;
    deleteGuitar(guitar.id);
    if (historyGuitar?.id === guitar.id) setHistoryGuitar(null);
  }

  function handleRememberKind(kind: GuitarStringKind) {
    if (!stringsGuitar) return;
    const updated: Guitar = {
      ...stringsGuitar,
      stringKind: kind,
      updatedAt: new Date().toISOString(),
    };
    saveGuitar(updated);
    setStringsGuitar(updated);
  }

  function handleSaveStringChange(entry: GuitarEntry) {
    saveGuitarEntry(entry);
    const name = guitars.find((guitar) => guitar.id === entry.guitarId)?.name;
    setNotice(
      name ? `${text.stringChangeLabel} · ${name}` : text.stringChangeLabel,
    );
  }

  if (!hasHydrated) {
    return <div className="h-24 animate-pulse rounded-lg bg-canvas/60" />;
  }

  return (
    <>
      {guitars.length === 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-4 border border-dashed border-line px-4 py-6">
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink">{text.emptyTitle}</p>
            <p className="mt-1 text-sm text-muted">{text.emptyDescription}</p>
          </div>
          <Button type="button" onClick={() => setEditing("new")}>
            {text.addGuitar}
          </Button>
        </div>
      ) : (
        <div>
          {sorted.map(({ guitar, maintenance }) => (
            <GuitarRow
              key={guitar.id}
              guitar={guitar}
              maintenance={maintenance}
              onChangeStrings={() => setStringsGuitar(guitar)}
              onEdit={() => setEditing(guitar)}
              onHistory={() => setHistoryGuitar(guitar)}
              onDelete={() => handleDeleteGuitar(guitar)}
            />
          ))}
          <div className="pt-4">
            <Button
              type="button"
              variant="ghost"
              size="field"
              onClick={() => setEditing("new")}
            >
              {text.addGuitar}
            </Button>
          </div>
        </div>
      )}

      <GuitarDialog
        guitar={editing === "new" ? null : editing}
        open={editing !== null}
        onClose={() => setEditing(null)}
        onSave={handleSaveGuitar}
      />

      {stringsGuitar && (
        <StringChangeDialog
          key={stringsGuitar.id}
          guitar={stringsGuitar}
          todayKey={todayKey}
          open
          onClose={() => setStringsGuitar(null)}
          onSave={handleSaveStringChange}
          onRememberKind={handleRememberKind}
        />
      )}

      {historyGuitar && (
        <GuitarHistoryDialog
          key={historyGuitar.id}
          guitar={historyGuitar}
          entries={guitarEntries.filter(
            (entry) => entry.guitarId === historyGuitar.id,
          )}
          todayKey={todayKey}
          open
          onClose={() => setHistoryGuitar(null)}
          onSaveEntry={(entry: GuitarEntry) => saveGuitarEntry(entry)}
          onDeleteEntry={deleteGuitarEntry}
        />
      )}

      <Toast
        message={notice ?? ""}
        open={Boolean(notice)}
        onDismiss={() => setNotice(null)}
      />
    </>
  );
}
