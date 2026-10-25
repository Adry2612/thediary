"use client";

import { useChangePasswordForm } from "@/hooks/useChangePasswordForm";
import { useI18nSection } from "@/i18n/I18nProvider";
import { PortalModal } from "@/components/ui/PortalModal";

interface ChangePasswordDialogProps {
  open: boolean;
  onClose: () => void;
}

export function ChangePasswordDialog({
  open,
  onClose,
}: ChangePasswordDialogProps) {
  const settings = useI18nSection("settings");
  const form = useChangePasswordForm({
    mismatch: settings.passwordsMismatch,
    updateFailed: settings.passwordUpdateFailed,
  });

  return (
    <PortalModal
      open={open}
      title={settings.changePasswordTitle}
      description={settings.changePasswordDescription}
      busy={form.isWorking}
      onClose={onClose}
    >
      {form.isComplete ? (
        <div className="mt-5">
          <p className="text-sm text-accent-green-fg" role="status">
            {settings.passwordUpdated}
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
        <form onSubmit={(event) => void form.submit(event)} className="mt-5">
          <label className="block text-sm text-ink" htmlFor="new-password">
            {settings.newPassword}
          </label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
            value={form.password}
            onChange={(event) => form.setPassword(event.target.value)}
            className="mt-2 h-11 w-full rounded-md border border-line bg-canvas px-3 text-base text-ink outline-none focus:border-ink/50 sm:text-sm"
          />
          <label
            className="mt-4 block text-sm text-ink"
            htmlFor="confirm-password"
          >
            {settings.confirmPassword}
          </label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            minLength={6}
            required
            value={form.confirmation}
            onChange={(event) => form.setConfirmation(event.target.value)}
            className="mt-2 h-11 w-full rounded-md border border-line bg-canvas px-3 text-base text-ink outline-none focus:border-ink/50 sm:text-sm"
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
              type="submit"
              disabled={form.isWorking}
              className="rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-canvas transition hover:bg-white disabled:opacity-50"
            >
              {form.isWorking ? settings.saving : settings.updatePassword}
            </button>
          </div>
        </form>
      )}
    </PortalModal>
  );
}
