"use client";

import { useId } from "react";
import { Button } from "@/components/ui/Button";
import { CoverArt } from "@/components/repertoire/CoverArt";
import { DialogHeader } from "@/components/ui/DialogHeader";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { useDeferredClose } from "@/hooks/useDeferredClose";
import { useDialogModal } from "@/hooks/useDialogModal";
import { useI18nSection } from "@/i18n/I18nProvider";
import type { CatalogCandidate } from "@/types/catalog";
import type { RepertoireItem } from "@/types/practice";
import { buildCatalogApplyUpdates } from "@/utils/repertoire-catalog";

interface CatalogPreviewDialogProps {
  item: RepertoireItem;
  candidate: CatalogCandidate;
  onConfirm: (updates: Partial<RepertoireItem>) => void;
  onClose: () => void;
}

interface PreviewRow {
  key: string;
  label: string;
  current: string;
  next: string;
  changed: boolean;
}

/** Vista previa de los datos de catálogo antes de pisar la ficha guardada. */
export function CatalogPreviewDialog({
  item,
  candidate,
  onConfirm,
  onClose,
}: CatalogPreviewDialogProps) {
  const text = useI18nSection("repertoire");
  const titleId = useId();
  const closeDialog = useDeferredClose(onClose);
  const { dialogRef, handleCancel } = useDialogModal(true, () =>
    closeDialog.requestClose(),
  );
  const { updates, changed } = buildCatalogApplyUpdates(
    item,
    candidate,
    new Date().toISOString(),
  );

  const empty = text.catalogPreviewEmpty;
  const rows: PreviewRow[] = [
    {
      key: "title",
      label: text.catalogPreviewTitleField,
      current: item.title,
      next: candidate.title,
      changed: candidate.title !== item.title,
    },
    {
      key: "artist",
      label: text.catalogPreviewArtist,
      current: item.artist?.trim() || empty,
      next: candidate.artist?.trim() || empty,
      changed: (candidate.artist || "") !== (item.artist ?? ""),
    },
    {
      key: "album",
      label: text.catalogAlbum,
      current: item.album?.trim() || empty,
      next: updates.album?.trim() || empty,
      changed:
        updates.album !== undefined && updates.album !== (item.album ?? ""),
    },
    {
      key: "year",
      label: text.catalogYear,
      current: item.releaseYear ? String(item.releaseYear) : empty,
      next: updates.releaseYear ? String(updates.releaseYear) : empty,
      changed:
        updates.releaseYear !== undefined &&
        updates.releaseYear !== item.releaseYear,
    },
  ];

  const coverChanged =
    updates.coverUrl !== undefined &&
    updates.coverUrl !== (item.coverUrl ?? "");

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
          title={text.catalogPreviewTitle}
          description={text.catalogPreviewDescription}
          onClose={closeDialog.requestClose}
          closeLabel={text.close}
        />

        {!changed ? (
          <p className="mt-5 text-sm text-muted">
            {text.catalogPreviewNoChanges}
          </p>
        ) : null}

        <div className="mt-5 overflow-hidden rounded-lg border border-line">
          <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.1fr)_minmax(0,1.1fr)] border-b border-line bg-canvas/60 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-muted">
            <span />
            <span>{text.catalogPreviewCurrent}</span>
            <span>{text.catalogPreviewNew}</span>
          </div>
          {rows.map((row) => (
            <div
              key={row.key}
              className={`grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.1fr)_minmax(0,1.1fr)] gap-2 border-b border-line px-3 py-2.5 text-sm last:border-b-0 ${
                row.changed ? "bg-accent-green-bg/20" : ""
              }`}
            >
              <span className="text-xs text-muted">{row.label}</span>
              <span className="min-w-0 break-words text-muted">
                {row.current}
              </span>
              <span
                className={`min-w-0 break-words ${
                  row.changed ? "text-ink" : "text-muted"
                }`}
              >
                {row.next}
              </span>
            </div>
          ))}
          <div
            className={`grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.1fr)_minmax(0,1.1fr)] gap-2 px-3 py-3 text-sm ${
              coverChanged ? "bg-accent-green-bg/20" : ""
            }`}
          >
            <span className="text-xs text-muted">
              {text.catalogPreviewCover}
            </span>
            <span className="flex items-center gap-2 text-xs text-muted">
              <CoverArt coverUrl={item.coverUrl} size="sm" />
              <span className="min-w-0 break-words">
                {item.coverUrl?.trim() || empty}
              </span>
            </span>
            <span className="flex items-center gap-2 text-xs text-muted">
              <CoverArt coverUrl={updates.coverUrl} size="sm" />
              <span className="min-w-0 break-words">
                {updates.coverUrl?.trim() || empty}
              </span>
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button onClick={() => closeDialog.requestClose()}>
            {text.catalogPreviewCancel}
          </Button>
          <Button
            variant="primary"
            disabled={!changed}
            onClick={() => closeDialog.requestClose(() => onConfirm(updates))}
          >
            {text.catalogPreviewApply}
          </Button>
        </div>
      </div>
    </ModalDialog>
  );
}
