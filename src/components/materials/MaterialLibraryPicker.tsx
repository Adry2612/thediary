"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { DialogHeader } from "@/components/ui/DialogHeader";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { SearchField } from "@/components/ui/SearchField";
import { SelectField } from "@/components/ui/SelectField";
import { useDeferredClose } from "@/hooks/useDeferredClose";
import { useDialogModal } from "@/hooks/useDialogModal";
import { useI18nSection } from "@/i18n/I18nProvider";
import { usePracticeStore } from "@/stores/usePracticeStore";
import {
  filterStudyMaterials,
  STUDY_MATERIAL_KINDS,
  studyMaterialToResource,
} from "@/utils/study-materials";
import { createId } from "@/utils/create-id";
import type { PracticeResource, PracticeResourceKind } from "@/types/practice";

interface Props {
  open: boolean;
  onSelect: (resource: PracticeResource) => void;
  onClose: () => void;
}

export function MaterialLibraryPicker({ open, onSelect, onClose }: Props) {
  const text = useI18nSection("materials");
  const titleId = useId();
  const materials = usePracticeStore((state) => state.studyMaterials);
  const hasHydrated = usePracticeStore((state) => state.hasHydrated);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<PracticeResourceKind | "all">("all");
  const closeDialog = useDeferredClose(onClose);
  const { dialogRef, handleCancel } = useDialogModal(open, () =>
    closeDialog.requestClose(),
  );

  const visible = useMemo(
    () => filterStudyMaterials(materials, { query, kind }),
    [kind, materials, query],
  );

  function choose(material: (typeof materials)[number]) {
    closeDialog.requestClose(() => {
      onSelect(studyMaterialToResource(material, createId()));
      onClose();
    });
  }

  return (
    <ModalDialog
      dialogRef={dialogRef}
      labelledBy={titleId}
      onCancel={handleCancel}
      isClosing={closeDialog.isClosing}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeDialog.requestClose();
      }}
      variant="lg"
    >
      <div className="p-5 sm:p-6">
        <DialogHeader
          titleId={titleId}
          title={text.pickerTitle}
          description={text.pickerDescription}
          onClose={() => closeDialog.requestClose()}
          closeLabel={text.close}
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
          <SearchField
            label={<span className="sr-only">{text.search}</span>}
            placeholder={text.searchPlaceholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          <label className="block text-xs text-muted">
            <span className="sr-only">{text.filterKind}</span>
            <SelectField
              value={kind}
              onChange={(value) =>
                setKind(value as PracticeResourceKind | "all")
              }
              ariaLabel={text.filterKind}
              options={[
                { value: "all", label: text.allKinds },
                ...STUDY_MATERIAL_KINDS.map((value) => ({
                  value,
                  label: text.kindLabels[value],
                })),
              ]}
            />
          </label>
        </div>

        {!hasHydrated ? null : materials.length === 0 ? (
          <div className="mt-5 rounded-lg border border-dashed border-line p-5 text-sm text-muted">
            <p>{text.pickerEmpty}</p>
            <Link
              href="/materials"
              className="mt-3 inline-block text-ink underline decoration-line underline-offset-4 hover:decoration-ink"
            >
              {text.pickerManage}
            </Link>
          </div>
        ) : visible.length === 0 ? (
          <div className="mt-5 rounded-lg border border-dashed border-line p-5 text-sm text-muted">
            <p>{text.noResults}</p>
            <p className="mt-1 text-xs">{text.noResultsDescription}</p>
          </div>
        ) : (
          <ul className="mt-4 grid max-h-80 grid-cols-1 gap-2 overflow-y-auto pr-1">
            {visible.map((material) => (
              <li key={material.id}>
                <button
                  type="button"
                  onClick={() => choose(material)}
                  className="flex w-full items-center justify-between gap-3 rounded-lg border border-line/70 bg-canvas/40 p-3 text-left transition hover:border-ink/30 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/60"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-ink">
                      {material.title}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-muted">
                      {text.kindLabels[material.kind]}
                      {material.fileName ? ` · ${material.fileName}` : ""}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-muted">
                    {text.pickerUse}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-4 text-xs leading-5 text-muted">{text.copyNote}</p>

        <div className="mt-4 flex justify-end border-t border-line pt-4">
          <Link
            href="/materials"
            className="text-sm text-muted underline decoration-line underline-offset-4 hover:text-ink"
          >
            {text.pickerManage}
          </Link>
        </div>
      </div>
    </ModalDialog>
  );
}
