"use client";

import { useId } from "react";
import { TextArea } from "@/components/ui/Field";
import { useI18nSection } from "@/i18n/I18nProvider";

interface PracticeBlockNotesFieldProps {
  value: string;
  ariaLabelSuffix?: string;
  onChange: (value: string) => void;
}

/** Notas libres de un bloque, compartidas por los editores de práctica. */
export function PracticeBlockNotesField({
  value,
  ariaLabelSuffix,
  onChange,
}: PracticeBlockNotesFieldProps) {
  const text = useI18nSection("practice");
  const inputId = useId();

  return (
    <label htmlFor={inputId} className="mt-3 block text-xs text-muted">
      {text.blockNotes}
      {ariaLabelSuffix ? ` · ${ariaLabelSuffix}` : ""}
      <TextArea
        id={inputId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={text.blockNotesPlaceholder}
        className="mt-1 min-h-20 text-sm"
      />
    </label>
  );
}
