"use client";

import { useId } from "react";
import { DialogHeader } from "@/components/ui/DialogHeader";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { ResourcePreview } from "@/components/practice/ResourcePreview";
import { useAppData } from "@/components/providers/AppDataProvider";
import { useDeferredClose } from "@/hooks/useDeferredClose";
import { useDialogModal } from "@/hooks/useDialogModal";
import { useI18nSection } from "@/i18n/I18nProvider";
import { studyMaterialToResource } from "@/utils/study-materials";
import type { StudyMaterial } from "@/types/practice";

export function StudyMaterialPreviewDialog({
  material,
  onClose,
}: {
  material: StudyMaterial;
  onClose: () => void;
}) {
  const text = useI18nSection("materials");
  const { user } = useAppData();
  const titleId = useId();
  const closeDialog = useDeferredClose(onClose);
  const { dialogRef, handleCancel } = useDialogModal(true, () =>
    closeDialog.requestClose(),
  );

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
          title={material.title}
          description={text.previewTitle}
          onClose={() => closeDialog.requestClose()}
          closeLabel={text.close}
        />
        <div className="mt-5 max-h-[70vh] overflow-auto border border-line">
          <ResourcePreview
            resource={studyMaterialToResource(material, material.id)}
            userId={user?.id}
          />
        </div>
      </div>
    </ModalDialog>
  );
}
