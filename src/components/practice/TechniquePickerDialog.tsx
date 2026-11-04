"use client";

import { useMemo } from "react";
import { SearchPickerDialog } from "@/components/practice/SearchPickerDialog";
import { useDisplayPreferences } from "@/hooks/useDisplayPreferences";
import { useI18nSection } from "@/i18n/I18nProvider";
import {
  TECHNIQUE_CATALOG,
  resolveTechniqueEntry,
} from "@/utils/catalogs/techniques";
import type { SearchPickerItem } from "@/utils/search-picker";

interface TechniquePickerDialogProps {
  open: boolean;
  /** Nombre guardado, en español, original o personalizado. */
  selectedTechnique?: string;
  onSelect: (technique: string) => void;
  onClose: () => void;
}

/** Buscador del catálogo de técnicas para los bloques de técnica. */
export function TechniquePickerDialog({
  open,
  selectedTechnique,
  onSelect,
  onClose,
}: TechniquePickerDialogProps) {
  const text = useI18nSection("practice");
  const { techniqueNameLanguage } = useDisplayPreferences();
  const items = useMemo<SearchPickerItem[]>(() => {
    const catalog: SearchPickerItem[] = TECHNIQUE_CATALOG.map((technique) => ({
      id: technique.en,
      label:
        techniqueNameLanguage === "original" ? technique.en : technique.es,
      searchText: `${technique.es} ${technique.en}`,
    }));
    const current = selectedTechnique?.trim();
    if (current && !resolveTechniqueEntry(current)) {
      catalog.push({ id: current, label: current, searchText: current });
    }
    return catalog;
  }, [selectedTechnique, techniqueNameLanguage]);

  const selectedId = selectedTechnique
    ? resolveTechniqueEntry(selectedTechnique)?.en ?? selectedTechnique
    : undefined;

  return (
    <SearchPickerDialog
      open={open}
      title={text.techniquePickerTitle}
      description={text.techniquePickerDescription}
      searchLabel={text.techniquePickerSearch}
      searchPlaceholder={text.techniquePickerSearchPlaceholder}
      emptyMessage={text.techniquePickerEmpty}
      noResultsMessage={text.techniquePickerNoResults}
      closeLabel={text.techniquePickerClose}
      items={items}
      selectedId={selectedId}
      onSelect={onSelect}
      onClose={onClose}
    />
  );
}
