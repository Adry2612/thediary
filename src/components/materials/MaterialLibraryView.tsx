"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageShell } from "@/components/ui/PageShell";
import { SearchField } from "@/components/ui/SearchField";
import { SelectField } from "@/components/ui/SelectField";
import { Toast } from "@/components/ui/Toast";
import { DeleteIcon, EditIcon } from "@/components/ui/icons";
import { StudyMaterialDialog } from "@/components/materials/StudyMaterialDialog";
import { StudyMaterialPreviewDialog } from "@/components/materials/StudyMaterialPreviewDialog";
import { useI18nSection } from "@/i18n/I18nProvider";
import { usePracticeStore } from "@/stores/usePracticeStore";
import {
  filterStudyMaterials,
  STUDY_MATERIAL_KINDS,
} from "@/utils/study-materials";
import type { PracticeResourceKind, StudyMaterial } from "@/types/practice";

export function MaterialLibraryView() {
  const text = useI18nSection("materials");
  const materials = usePracticeStore((state) => state.studyMaterials);
  const hasHydrated = usePracticeStore((state) => state.hasHydrated);
  const saveStudyMaterial = usePracticeStore(
    (state) => state.saveStudyMaterial,
  );
  const deleteStudyMaterial = usePracticeStore(
    (state) => state.deleteStudyMaterial,
  );

  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<PracticeResourceKind | "all">("all");
  /** `undefined` cierra el formulario; `null` lo abre en blanco. */
  const [editing, setEditing] = useState<StudyMaterial | null | undefined>();
  const [preview, setPreview] = useState<StudyMaterial | null>(null);
  const [deleting, setDeleting] = useState<StudyMaterial | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const visible = useMemo(
    () => filterStudyMaterials(materials, { query, kind }),
    [kind, materials, query],
  );

  function openNew() {
    setEditing(null);
  }

  function handleSave(material: StudyMaterial, warning?: string) {
    const isNew = editing === null;
    saveStudyMaterial(material);
    setEditing(undefined);
    setToast(warning ?? (isNew ? text.saveSuccess : text.updateSuccess));
  }

  function handleDelete(material: StudyMaterial) {
    deleteStudyMaterial(material.id);
    setDeleting(null);
    setToast(text.deleteSuccess);
  }

  return (
    <PageShell>
      <PageHeader
        title={text.title}
        description={text.description}
        actions={
          <Button type="button" variant="primary" onClick={openNew}>
            {text.addMaterial}
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_14rem]">
        <SearchField
          label={text.search}
          placeholder={text.searchPlaceholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
        <label className="block text-xs text-muted">
          {text.filterKind}
          <SelectField
            value={kind}
            onChange={(value) => setKind(value as PracticeResourceKind | "all")}
            ariaLabel={text.filterKind}
            className="mt-1"
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

      {!hasHydrated ? (
        <p className="mt-6 text-sm text-muted">{text.loading}</p>
      ) : materials.length === 0 ? (
        <section className="mt-6 rounded-xl border border-dashed border-line p-6 sm:p-8">
          <h2 className="font-sans text-lg font-semibold text-ink">
            {text.emptyTitle}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            {text.emptyDescription}
          </p>
          <Button
            type="button"
            variant="primary"
            className="mt-4"
            onClick={openNew}
          >
            {text.addMaterial}
          </Button>
        </section>
      ) : visible.length === 0 ? (
        <section className="mt-6 rounded-xl border border-dashed border-line p-6">
          <h2 className="font-sans text-lg font-semibold text-ink">
            {text.noResults}
          </h2>
          <p className="mt-2 text-sm text-muted">
            {text.noResultsDescription}
          </p>
        </section>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((material) => (
            <li key={material.id}>
              <article className="flex h-full flex-col rounded-xl border border-line bg-surface p-4 sm:p-5">
                <p className="text-[10px] uppercase tracking-[0.08em] text-muted">
                  {text.kindLabels[material.kind]}
                </p>
                <h2 className="mt-1 break-words text-base font-semibold leading-6 text-ink">
                  {material.title}
                </h2>
                {material.notes && (
                  <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted">
                    {material.notes}
                  </p>
                )}
                {(material.fileName || material.url) && (
                  <p className="mt-2 truncate text-xs text-muted">
                    {material.fileName ?? material.url}
                  </p>
                )}
                <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-line pt-3">
                  <Button
                    type="button"
                    size="field"
                    onClick={() => setPreview(material)}
                  >
                    {text.previewOpen}
                  </Button>
                  <Button
                    type="button"
                    variant="icon"
                    size="field"
                    aria-label={`${text.editMaterial}: ${material.title}`}
                    onClick={() => setEditing(material)}
                  >
                    <EditIcon className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="icon"
                    aria-label={`${text.delete}: ${material.title}`}
                    onClick={() => setDeleting(material)}
                  >
                    <DeleteIcon />
                  </Button>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}

      {editing !== undefined && (
        <StudyMaterialDialog
          material={editing ?? undefined}
          onSave={handleSave}
          onClose={() => setEditing(undefined)}
        />
      )}

      {preview && (
        <StudyMaterialPreviewDialog
          material={preview}
          onClose={() => setPreview(null)}
        />
      )}

      {deleting && (
        <ConfirmDialog
          labelledBy="delete-material-title"
          title={text.deleteTitle}
          description={text.deleteDescription}
          confirmLabel={text.deleteConfirm}
          cancelLabel={text.deleteCancel}
          onCancel={() => setDeleting(null)}
          onConfirm={() => handleDelete(deleting)}
        />
      )}

      <Toast
        message={toast ?? ""}
        open={Boolean(toast)}
        onDismiss={() => setToast(null)}
      />
    </PageShell>
  );
}
