"use client";

import { useMemo } from "react";
import { SearchPickerDialog } from "@/components/practice/SearchPickerDialog";
import { useDisplayPreferences } from "@/hooks/useDisplayPreferences";
import { useI18nSection } from "@/i18n/I18nProvider";
import {
  THEORY_CATALOG,
  getTheoryName,
  resolveTheoryEntry,
} from "@/utils/catalogs/theory";
import type { SearchPickerItem } from "@/utils/search-picker";

interface TheoryPickerDialogProps {
  open: boolean;
  /** Nombre guardado, en español, original o personalizado. */
  selectedTheory?: string;
  onSelect: (theory: string) => void;
  onClose: () => void;
}

/** Buscador del catálogo de temas de teoría para los bloques de teoría. */
export function TheoryPickerDialog({
  open,
  selectedTheory,
  onSelect,
  onClose,
}: TheoryPickerDialogProps) {
  const text = useI18nSection("practice");
  const { techniqueNameLanguage } = useDisplayPreferences();
  const items = useMemo<SearchPickerItem[]>(() => {
    const catalog: SearchPickerItem[] = THEORY_CATALOG.map((topic) => ({
      id: topic.en,
      label: getTheoryName(topic.id, techniqueNameLanguage),
      searchText: `${topic.es} ${topic.en}`,
    }));
    const current = selectedTheory?.trim();
    if (current && !resolveTheoryEntry(current)) {
      catalog.push({ id: current, label: current, searchText: current });
    }
    return catalog;
  }, [selectedTheory, techniqueNameLanguage]);

  const selectedId = selectedTheory
    ? resolveTheoryEntry(selectedTheory)?.en ?? selectedTheory
    : undefined;

  return (
    <SearchPickerDialog
      open={open}
      title={text.theoryPickerTitle}
      description={text.theoryPickerDescription}
      searchLabel={text.theoryPickerSearch}
      searchPlaceholder={text.theoryPickerSearchPlaceholder}
      emptyMessage={text.theoryPickerEmpty}
      noResultsMessage={text.theoryPickerNoResults}
      closeLabel={text.theoryPickerClose}
      items={items}
      selectedId={selectedId}
      onSelect={onSelect}
      onClose={onClose}
    />
  );
}
