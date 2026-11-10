"use client";

import { useMemo } from "react";
import { SearchPickerDialog } from "@/components/practice/SearchPickerDialog";
import { useI18nSection } from "@/i18n/I18nProvider";
import type { GuitarLick } from "@/types/lick";
import type { SearchPickerItem } from "@/utils/search-picker";

interface LickPickerDialogProps {
  open: boolean;
  licks: readonly GuitarLick[];
  selectedLickId?: string;
  onSelect: (lick: GuitarLick) => void;
  onClose: () => void;
}

/** Buscador de la biblioteca de licks para los bloques de lick. */
export function LickPickerDialog({
  open,
  licks,
  selectedLickId,
  onSelect,
  onClose,
}: LickPickerDialogProps) {
  const text = useI18nSection("practice");
  const items = useMemo<SearchPickerItem[]>(
    () =>
      licks.map((lick) => ({
        id: lick.id,
        label: lick.title,
        description: lick.techniques.length > 0 ? lick.techniques.join(" · ") : undefined,
        searchText: [lick.title, ...lick.techniques].join(" "),
      })),
    [licks],
  );

  return (
    <SearchPickerDialog
      open={open}
      title={text.lickPickerTitle}
      description={text.lickPickerDescription}
      searchLabel={text.lickPickerSearch}
      searchPlaceholder={text.lickPickerSearchPlaceholder}
      emptyMessage={text.lickPickerEmpty}
      noResultsMessage={text.lickPickerNoResults}
      closeLabel={text.lickPickerClose}
      items={items}
      selectedId={selectedLickId}
      onSelect={(id) => {
        const lick = licks.find((candidate) => candidate.id === id);
        if (lick) onSelect(lick);
      }}
      onClose={onClose}
    />
  );
}
