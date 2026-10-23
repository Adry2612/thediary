"use client";

import { useMemo } from "react";
import { SearchPickerDialog } from "@/components/practice/SearchPickerDialog";
import { useI18nSection } from "@/i18n/I18nProvider";
import type { SearchPickerItem } from "@/utils/search-picker";

interface TechniquePickerDialogProps {
  open: boolean;
  /** Catálogo actual más una técnica propia de una rutina antigua, si la hay. */
  techniques: readonly string[];
  selectedTechnique?: string;
  onSelect: (technique: string) => void;
  onClose: () => void;
}

/** Buscador del catálogo de técnicas para los bloques de técnica. */
export function TechniquePickerDialog({
  open,
  techniques,
  selectedTechnique,
  onSelect,
  onClose,
}: TechniquePickerDialogProps) {
  const text = useI18nSection("practice");
  const items = useMemo<SearchPickerItem[]>(
    () =>
      techniques.map((technique) => ({
        id: technique,
        label: technique,
      })),
    [techniques],
  );

  return (
    <SearchPickerDialog
      open={open}
      eyebrow={text.techniqueName}
      title={text.techniquePickerTitle}
      description={text.techniquePickerDescription}
      searchLabel={text.techniquePickerSearch}
      searchPlaceholder={text.techniquePickerSearchPlaceholder}
      emptyMessage={text.techniquePickerEmpty}
      noResultsMessage={text.techniquePickerNoResults}
      closeLabel={text.techniquePickerClose}
      items={items}
      selectedId={selectedTechnique}
      onSelect={onSelect}
      onClose={onClose}
    />
  );
}
