"use client";

import { useDeletePracticeDataForm } from "@/hooks/useDeletePracticeDataForm";
import { useI18nSection } from "@/i18n/I18nProvider";
import { PortalModal } from "@/components/ui/PortalModal";

interface DeletePracticeDataDialogProps {
  open: boolean;
  onClose: () => void;
}

export function DeletePracticeDataDialog({
  open,
  onClose,
}: DeletePracticeDataDialogProps) {
  const settings = useI18nSection("settings");
  const form = useDeletePracticeDataForm({
    deleteFailed: settings.deleteDataFailed,
    confirmationWord: settings.deleteConfirmationWord,
  });

  return (
    <PortalModal
      open={open}
      title={settings.deleteDialogTitle}
      description={settings.deleteDialogDescription}
      busy={form.isWorking}
      onClose={onClose}
    >
      {form.isComplete ? (
        <div className="mt-5">
          <p className="text-sm text-accent-green-fg" role="status">
            {settings.deleteDataSuccess}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-5 rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-canvas transition hover:bg-white"
          >
            {settings.close}
          </button>
        </div>
      ) : (
        <div className="mt-5">
          <label
            className="block text-sm text-ink"
            htmlFor="delete-confirmation"
          >
            {settings.deleteConfirmationPrefix}
            <strong>{settings.deleteConfirmationWord}</strong>
            {settings.deleteConfirmationSuffix}
          </label>
          <input
            id="delete-confirmation"
            type="text"
            autoComplete="off"
            value={form.confirmation}
            onChange={(event) => form.setConfirmation(event.target.value)}
            className="mt-2 h-11 w-full rounded-md border border-line bg-canvas px-3 text-sm text-ink outline-none focus:border-ink/50"
          />
          {form.error && (
            <p className="mt-3 text-sm text-accent-red-fg" role="alert">
              {form.error}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              disabled={form.isWorking}
              onClick={onClose}
              className="rounded-md border border-line px-4 py-2.5 text-sm text-ink transition hover:bg-white/5 disabled:opacity-50"
            >
              {settings.cancel}
            </button>
            <button
              type="button"
              disabled={form.isWorking || !form.canDelete}
              onClick={() => void form.submit()}
              className="rounded-md bg-accent-red-fg px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {form.isWorking ? settings.deleting : settings.deleteData}
            </button>
          </div>
        </div>
      )}
    </PortalModal>
  );
}
