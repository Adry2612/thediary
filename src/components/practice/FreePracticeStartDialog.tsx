"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { CheckboxField } from "@/components/ui/CheckboxField";
import { DialogHeader } from "@/components/ui/DialogHeader";
import { Field, TextField } from "@/components/ui/Field";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { SelectField } from "@/components/ui/SelectField";
import { ToggleChip } from "@/components/ui/ToggleChip";
import { ToggleGroup } from "@/components/ui/ToggleGroup";
import { useDialogModal } from "@/hooks/useDialogModal";
import { useI18nSection } from "@/i18n/I18nProvider";
import { usePracticeGuitar } from "@/hooks/usePracticeGuitar";
import { normalizeTargetMinutes } from "@/utils/practice-target";
import type { Guitar } from "@/types/equipment";
import type { GuitarType, RepertoireItem } from "@/types/practice";

interface FreePracticeStartDialogProps {
  item: RepertoireItem;
  guitars: Guitar[];
  /** Último tipo usado en este dispositivo, si el elemento no declara uno. */
  defaultGuitarType: GuitarType | null;
  onCancel: () => void;
  onStart: (
    guitarType: GuitarType,
    guitarId?: string,
    targetMinutes?: number,
  ) => void;
}

/**
 * Confirmación breve antes de una práctica libre desde el repertorio. El tipo
 * de guitarra es obligatorio; el tiempo objetivo es opcional.
 */
export function FreePracticeStartDialog({
  item,
  guitars,
  defaultGuitarType,
  onCancel,
  onStart,
}: FreePracticeStartDialogProps) {
  const text = useI18nSection("practice");
  const titleId = useId();
  const targetId = useId();
  const { dialogRef, handleCancel, isClosing } = useDialogModal(true, onCancel);
  const [guitarType, setGuitarType] = useState<GuitarType | null>(
    item.guitarType ?? defaultGuitarType ?? null,
  );
  const {
    guitarId,
    setGuitarId,
    rememberGuitar,
    showSelector: showGuitarSelector,
  } = usePracticeGuitar({ guitars });
  const [targetEnabled, setTargetEnabled] = useState(false);
  const [targetMinutes, setTargetMinutes] = useState("30");
  const parsedTarget = normalizeTargetMinutes(
    targetEnabled ? targetMinutes : undefined,
  );
  const targetInvalid = targetEnabled && parsedTarget === undefined;
  const canStart = Boolean(guitarType) && !targetInvalid;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!guitarType || targetInvalid) return;
    rememberGuitar();
    onStart(guitarType, guitarId, targetEnabled ? parsedTarget : undefined);
  }

  return (
    <ModalDialog
      dialogRef={dialogRef}
      labelledBy={titleId}
      isClosing={isClosing}
      onCancel={handleCancel}
      onClose={onCancel}
    >
      <form onSubmit={handleSubmit}>
        <div className="p-5 sm:p-6">
          <DialogHeader
            titleId={titleId}
            title={text.freeStartTitle}
            description={text.freeStartDescription}
            onClose={onCancel}
            closeLabel={text.cancel}
          />

          <div className="mt-5 rounded-lg border border-line bg-canvas/50 p-4">
            <p className="font-sans text-base font-semibold text-ink">
              {item.title}
            </p>
            {item.artist?.trim() && (
              <p className="mt-1 text-sm text-muted">{item.artist.trim()}</p>
            )}
          </div>

          {showGuitarSelector && (
            <div className="mt-5">
              <p className="text-xs text-muted">{text.guitar}</p>
              <SelectField
                className="mt-1"
                value={guitarId ?? "none"}
                ariaLabel={text.guitarAria}
                options={[
                  { value: "none", label: text.guitarNone },
                  ...guitars.map((guitar) => ({
                    value: guitar.id,
                    label: guitar.name,
                  })),
                ]}
                onChange={(value) => {
                  if (value === "none") {
                    setGuitarId(undefined);
                    return;
                  }
                  const guitar = guitars.find(
                    (candidate) => candidate.id === value,
                  );
                  if (!guitar) return;
                  setGuitarId(guitar.id);
                }}
              />
            </div>
          )}

          <div className="mt-5">
            <p className="text-xs text-muted">{text.guitarType}</p>
            <ToggleGroup
              aria-label={text.freeStartGuitar}
              className="mt-2 gap-2"
            >
              <ToggleChip
                selected={guitarType === "electric"}
                size="sm"
                onClick={() => setGuitarType("electric")}
              >
                {text.guitarElectric}
              </ToggleChip>
              <ToggleChip
                selected={guitarType === "acoustic"}
                size="sm"
                onClick={() => setGuitarType("acoustic")}
              >
                {text.guitarAcoustic}
              </ToggleChip>
            </ToggleGroup>
            {guitarType === null && (
              <p className="mt-2 text-xs text-red-300" role="alert">
                {text.freeStartGuitarRequired}
              </p>
            )}
          </div>

          <div className="mt-5 border-t border-line pt-5">
            <CheckboxField
              checked={targetEnabled}
              onChange={(event) => setTargetEnabled(event.target.checked)}
              label={text.freeStartTargetToggle}
              className="text-sm text-ink"
            />
            <p className="mt-1.5 pl-6 text-xs leading-5 text-muted">
              {text.freeStartTargetDescription}
            </p>
            {targetEnabled && (
              <Field
                label={text.freeStartTargetMinutes}
                htmlFor={targetId}
                error={targetInvalid ? text.freeStartTargetInvalid : null}
                className="mt-3 max-w-40"
              >
                <TextField
                  id={targetId}
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  value={targetMinutes}
                  onChange={(event) => setTargetMinutes(event.target.value)}
                />
              </Field>
            )}
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" onClick={onCancel}>
              {text.cancel}
            </Button>
            <Button type="submit" variant="primary" disabled={!canStart}>
              {text.startPractice}
            </Button>
          </div>
        </div>
      </form>
    </ModalDialog>
  );
}
