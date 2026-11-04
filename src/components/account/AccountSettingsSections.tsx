'use client';

import { ChangePasswordDialog } from '@/components/account/ChangePasswordDialog';
import { DeletePracticeDataDialog } from '@/components/account/DeletePracticeDataDialog';
import { CloudSyncProviderIcon } from '@/components/ui/icons';
import { useSettingsView } from '@/hooks/useSettingsView';
import { useI18nSection } from '@/i18n/I18nProvider';

/**
 * Acciones de cuenta y sincronización: proveedores de grabaciones, contraseña,
 * cierre de sesión y borrado de datos. Viven en la página de cuenta para que
 * Configuración quede como preferencias de la app.
 */
export function AccountSettingsSections() {
  const settings = useI18nSection('settings');
  const view = useSettingsView(settings);

  return (
    <div className='mt-4 space-y-4'>
      <section
        aria-labelledby='account-cloud-sync-title'
        className='rounded-xl border border-line bg-surface p-5 sm:p-6'
      >
        <p className='text-xs uppercase tracking-[0.08em] text-muted'>
          {settings.account}
        </p>
        <h2
          id='account-cloud-sync-title'
          className='mt-2 text-lg font-medium text-ink'
        >
          {settings.cloudSyncTitle}
        </h2>
        <p className='mt-2 text-sm leading-6 text-muted'>
          {settings.cloudSyncDescription}
        </p>
        <div className='mt-4 grid gap-3 sm:grid-cols-2'>
          {view.cloud.cards.map((card) => (
            <div
              key={card.provider}
              className='rounded-md border border-line p-4'
            >
              <p className='flex items-center gap-2 text-sm font-medium text-ink'>
                <CloudSyncProviderIcon
                  provider={card.provider}
                  className='size-5'
                />
                {card.label}
              </p>
              <p className='mt-1 text-xs text-muted'>{card.statusText}</p>
              <button
                type='button'
                disabled={card.isDisabled}
                onClick={() => void view.cloud.toggle(card)}
                className={`mt-3 inline-flex min-h-10 items-center gap-2 rounded-md border px-3 text-sm transition hover:bg-white/5 disabled:opacity-50 ${
                  card.isHighlighted ?
                    'border-accent-green-fg/50 bg-accent-green-bg/30 text-accent-green-fg'
                  : 'border-line text-ink'
                }`}
              >
                {card.actionLabel}
              </button>
            </div>
          ))}
        </div>
        <div className='mt-4 flex flex-col gap-3 rounded-md border border-line p-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <p className='text-sm font-medium text-ink'>
              {settings.cloudAutoSyncTitle}
            </p>
            <p className='mt-1 max-w-lg text-xs leading-5 text-muted'>
              {settings.cloudAutoSyncDescription}
            </p>
          </div>
          <button
            type='button'
            aria-pressed={view.autoSync.enabled}
            onClick={view.autoSync.toggle}
            className={`mt-3 min-h-10 shrink-0 rounded-md border px-3 text-sm transition hover:bg-white/5 sm:mt-0 ${
              view.autoSync.enabled ?
                'border-accent-green-fg/50 bg-accent-green-bg/30 text-accent-green-fg'
              : 'border-line text-ink'
            }`}
          >
            {view.autoSync.enabled ?
              settings.cloudAutoSyncToggleOn
            : settings.cloudAutoSyncToggleOff}
          </button>
        </div>
        <p className='mt-3 text-xs text-muted'>
          {settings.remoteFilesRemain}
        </p>
        {view.cloud.error && (
          <p className='mt-3 text-sm text-accent-red-fg' role='alert'>
            {view.cloud.error}
          </p>
        )}
      </section>

      {view.user && (
        <>
          <section
            aria-labelledby='account-security-title'
            className='rounded-xl border border-line bg-surface p-5 sm:p-6'
          >
            <p className='text-xs uppercase tracking-[0.08em] text-muted'>
              {settings.security}
            </p>
            <h2
              id='account-security-title'
              className='mt-2 text-lg font-medium text-ink'
            >
              {settings.password}
            </h2>
            <div className='mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <p className='text-sm leading-6 text-muted'>
                {settings.passwordDescription}
              </p>
              <button
                type='button'
                onClick={() => view.openDialog('password')}
                className='min-h-11 shrink-0 rounded-md border border-line px-4 text-sm text-ink transition hover:bg-white/5'
              >
                {settings.changePassword}
              </button>
            </div>
          </section>

          <section
            aria-labelledby='account-session-title'
            className='rounded-xl border border-line bg-surface p-5 sm:p-6'
          >
            <p className='text-xs uppercase tracking-[0.08em] text-muted'>
              {settings.session}
            </p>
            <h2
              id='account-session-title'
              className='mt-2 text-lg font-medium text-ink'
            >
              {settings.signOut}
            </h2>
            <div className='mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <p className='text-sm leading-6 text-muted'>
                {settings.signOutDescription}
              </p>
              <button
                type='button'
                disabled={view.signOut.isWorking}
                onClick={() => void view.signOut.submit()}
                className='min-h-11 shrink-0 rounded-md border border-line px-4 text-sm text-ink transition hover:bg-white/5 disabled:opacity-50'
              >
                {view.signOut.isWorking ?
                  `${settings.signOut}…`
                : settings.signOut}
              </button>
            </div>
            {view.signOut.error && (
              <p className='mt-3 text-sm text-accent-red-fg' role='alert'>
                {view.signOut.error}
              </p>
            )}
          </section>
        </>
      )}

      <section
        aria-labelledby='account-data-title'
        className='rounded-xl border border-accent-red-fg/50 bg-accent-red-bg p-5 sm:p-6'
      >
        <p className='text-xs uppercase tracking-[0.08em] text-accent-red-fg'>
          {settings.data}
        </p>
        <h2
          id='account-data-title'
          className='mt-2 text-lg font-medium text-accent-red-fg'
        >
          {settings.deleteAll}
        </h2>
        <div className='mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <p className='max-w-lg text-sm leading-6 text-muted'>
            {settings.deleteDescription}
          </p>
          <button
            type='button'
            onClick={() => view.openDialog('delete')}
            style={{ backgroundColor: 'var(--color-accent-red-button)' }}
            className='min-h-11 shrink-0 rounded-md px-4 text-sm font-medium text-white hover:opacity-90 focus-visible:outline-offset-2 focus-visible:outline-accent-red-fg'
          >
            {settings.deleteData}
          </button>
        </div>
      </section>

      <ChangePasswordDialog
        open={view.dialog === 'password'}
        onClose={view.closeDialog}
      />
      <DeletePracticeDataDialog
        open={view.dialog === 'delete'}
        onClose={view.closeDialog}
      />
    </div>
  );
}
