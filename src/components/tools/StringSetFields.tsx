"use client";

import { useId } from "react";
import { Field, TextField } from "@/components/ui/Field";
import { SelectField } from "@/components/ui/SelectField";
import { useI18nSection } from "@/i18n/I18nProvider";
import { StringSetThumb } from "@/components/tools/StringSetThumb";
import { StringKindPicker } from "@/components/tools/StringKindPicker";
import type { GuitarStringKind } from "@/types/equipment";
import {
  formatGaugeRange,
  getStringSetById,
  getStringSetsByKind,
  type StringSetDraft,
} from "@/utils/guitar-strings";

interface StringSetFieldsProps {
  value: StringSetDraft;
  onChange: (value: StringSetDraft) => void;
  /** Cuando la guitarra ya tiene tipo, el selector sobra. */
  fixedKind?: GuitarStringKind;
}

export function StringSetFields({
  value,
  onChange,
  fixedKind,
}: StringSetFieldsProps) {
  const text = useI18nSection("equipment");
  const brandId = useId();
  const modelId = useId();
  const gaugeId = useId();
  const kind = fixedKind ?? value.kind;
  const sets = getStringSetsByKind(kind);
  const selected = getStringSetById(value.setId);

  return (
    <div className="grid gap-4">
      {!fixedKind && (
        <StringKindPicker
          value={value.kind}
          onChange={(nextKind) =>
            onChange({ ...value, kind: nextKind, setId: "" })
          }
        />
      )}

      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
          {text.stringModel}
        </p>
        <SelectField
          className="mt-2"
          ariaLabel={text.stringModel}
          value={value.setId}
          onChange={(setId) => onChange({ ...value, setId })}
          options={[
            { value: "", label: text.stringSetNone },
            ...sets.map((set) => ({
              value: set.id,
              label: `${set.brand} ${set.model} · ${formatGaugeRange(
                set.gauges,
                set.unit,
              )}`,
              ...(set.image ? { image: set.image } : {}),
            })),
            { value: "custom", label: text.stringSetCustom },
          ]}
        />
      </div>

      {selected && (
        <div className="flex items-center gap-3">
          <StringSetThumb image={selected.image} size="lg" />
          <p className="flex flex-wrap gap-1.5 text-xs text-muted">
            {selected.gauges.map((gauge, index) => (
              <span
                key={`${selected.id}-${index}`}
                className="border border-line px-1.5 py-0.5 font-mono"
              >
                {gauge}
              </span>
            ))}
          </p>
        </div>
      )}

      {value.setId === "custom" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={text.stringBrand} htmlFor={brandId}>
            <TextField
              id={brandId}
              value={value.brand}
              onChange={(event) =>
                onChange({ ...value, brand: event.target.value })
              }
            />
          </Field>
          <Field label={text.stringModelName} htmlFor={modelId}>
            <TextField
              id={modelId}
              value={value.model}
              onChange={(event) =>
                onChange({ ...value, model: event.target.value })
              }
            />
          </Field>
          <Field
            label={text.stringGauges}
            htmlFor={gaugeId}
            className="sm:col-span-2"
          >
            <TextField
              id={gaugeId}
              value={value.gaugeText}
              placeholder={text.stringGaugesPlaceholder}
              onChange={(event) =>
                onChange({ ...value, gaugeText: event.target.value })
              }
            />
          </Field>
        </div>
      )}
    </div>
  );
}
