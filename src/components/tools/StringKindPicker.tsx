"use client";

import { useI18nSection } from "@/i18n/I18nProvider";
import {
  GUITAR_STRING_KINDS,
  type GuitarStringKind,
} from "@/types/equipment";

const LABEL_KEYS: Record<
  GuitarStringKind,
  "stringKindElectric" | "stringKindAcoustic" | "stringKindClassical"
> = {
  electric: "stringKindElectric",
  acoustic: "stringKindAcoustic",
  classical: "stringKindClassical",
};

interface StringKindPickerProps {
  value: GuitarStringKind;
  onChange: (kind: GuitarStringKind) => void;
  /** Sustituye al rótulo por defecto cuando el contexto pide otro. */
  label?: string;
}

/** Los tres tipos de cuerdas, como botones excluyentes. */
export function StringKindPicker({
  value,
  onChange,
  label,
}: StringKindPickerProps) {
  const text = useI18nSection("equipment");
  const title = label ?? text.stringKind;

  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
        {title}
      </p>
      <div
        role="group"
        aria-label={title}
        className="mt-2 flex flex-wrap gap-1.5"
      >
        {GUITAR_STRING_KINDS.map((kind) => (
          <button
            key={kind}
            type="button"
            aria-pressed={value === kind}
            onClick={() => onChange(kind)}
            className={`min-h-9 rounded-md border px-3 text-sm transition ${
              value === kind
                ? "border-ink bg-ink text-canvas"
                : "border-line text-muted hover:border-white/25 hover:text-ink"
            }`}
          >
            {text[LABEL_KEYS[kind]]}
          </button>
        ))}
      </div>
    </div>
  );
}
