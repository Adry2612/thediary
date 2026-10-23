'use client';

import Link from 'next/link';
import { ChangePasswordDialog } from '@/components/account/ChangePasswordDialog';
import { DeletePracticeDataDialog } from '@/components/account/DeletePracticeDataDialog';
import { SelectField } from '@/components/ui/SelectField';
import { CloudSyncProviderIcon } from '@/components/ui/icons';
import { useSettingsView } from '@/hooks/useSettingsView';
import { useI18n, useI18nSection } from '@/i18n/I18nProvider';
import { type Locale } from '@/i18n/translations';
import { useTutorial } from '@/components/tutorial/TutorialProvider';

export function SettingsView() {
  const { locale, setLocale } = useI18n();
  const settings = useI18nSection('settings');
  const { openTutorial } = useTutorial();
  const view = useSettingsView(settings);

  return (
    <main className='mx-auto max-w-3xl px-5 py-12 sm:px-8'>
      <p className='text-xs uppercase tracking-[0.12em] text-muted'>
        {settings.eyebrow}
      </p>
      <h1 className='mt-2 text-3xl font-semibold tracking-tight text-ink'>
        {settings.title}
      </h1>
      <p className='mt-3 max-w-xl text-sm leading-6 text-muted'>
        {settings.description}
      </p>

      <div className='mt-8 space-y-4'>
        <section
          data-tour-target='settings-account'
          aria-labelledby='settings-account-title'
          className='rounded-xl border border-line bg-surface p-5 sm:p-6'
        >
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <p className='text-xs uppercase tracking-[0.08em] text-muted'>
                {settings.account}
              </p>
              <h2
                id='settings-account-title'
                className='mt-2 text-lg font-medium text-ink'
              >
                {view.user?.email ?? settings.guest}
              </h2>
              <p className='mt-2 max-w-lg text-sm leading-6 text-muted'>
                {view.user ? settings.accountSaved : settings.accountPrompt}
              </p>
            </div>
            <Link
              href='/account'
              className='inline-flex min-h-11 shrink-0 items-center justify-center rounded-md border border-line px-4 text-sm text-ink transition hover:bg-white/5'
            >
              {view.user ? settings.accountSync : settings.signIn}
            </Link>
          </div>
        </section>

        <section
          aria-labelledby='settings-language-title'
          className='rounded-xl border border-line bg-surface p-5 sm:p-6'
        >
          <p className='text-xs uppercase tracking-[0.08em] text-muted'>
            {settings.preferences}
          </p>
          <h2
            id='settings-language-title'
            className='mt-2 text-lg font-medium text-ink'
          >
            {settings.language}
          </h2>
          <div className='mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <p className='text-sm leading-6 text-muted'>
              {settings.languageDescription}
            </p>
            <SelectField
              value={locale}
              onChange={(value) => setLocale(value as Locale)}
              ariaLabel={settings.language}
              className='w-full sm:w-44'
              options={[
                { value: 'es', label: settings.spanish },
                { value: 'en', label: settings.english },
              ]}
            />
          </div>
        </section>

        <section
          aria-labelledby='settings-cloud-sync-title'
          className='rounded-xl border border-line bg-surface p-5 sm:p-6'
        >
          <p className='text-xs uppercase tracking-[0.08em] text-muted'>
            {settings.preferences}
          </p>
          <h2
            id='settings-cloud-sync-title'
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

        <section
          aria-labelledby='settings-tutorial-title'
          className='rounded-xl border border-line bg-surface p-5 sm:p-6'
        >
          <p className='text-xs uppercase tracking-[0.08em] text-muted'>
            {settings.help}
          </p>
          <h2
            id='settings-tutorial-title'
            className='mt-2 text-lg font-medium text-ink'
          >
            {settings.tutorialTitle}
          </h2>
          <div className='mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <p className='text-sm leading-6 text-muted'>
              {settings.tutorialDescription}
            </p>
            <button
              type='button'
              onClick={openTutorial}
              className='min-h-11 shrink-0 rounded-md border border-line px-4 text-sm text-ink transition hover:bg-white/5'
            >
              {settings.viewTutorial}
            </button>
          </div>
        </section>

        {view.user && (
          <>
            <section
              aria-labelledby='settings-security-title'
              className='rounded-xl border border-line bg-surface p-5 sm:p-6'
            >
              <p className='text-xs uppercase tracking-[0.08em] text-muted'>
                {settings.security}
              </p>
              <h2
                id='settings-security-title'
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
              aria-labelledby='settings-session-title'
              className='rounded-xl border border-line bg-surface p-5 sm:p-6'
            >
              <p className='text-xs uppercase tracking-[0.08em] text-muted'>
                {settings.session}
              </p>
              <h2
                id='settings-session-title'
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
          aria-labelledby='settings-data-title'
          className='rounded-xl border border-accent-red-fg/50 bg-accent-red-bg p-5 sm:p-6'
        >
          <p className='text-xs uppercase tracking-[0.08em] text-accent-red-fg'>
            {settings.data}
          </p>
          <h2
            id='settings-data-title'
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

        <section
          aria-labelledby='settings-support-title'
          className='rounded-xl border border-[#FFDD00]/35 bg-surface p-5 sm:p-6'
        >
          <p className='text-xs uppercase tracking-[0.08em] text-muted'>
            {settings.support}
          </p>
          <h2
            id='settings-support-title'
            className='mt-2 text-lg font-medium text-ink'
          >
            {settings.supportTitle}
          </h2>
          <div className='mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <p className='max-w-xl text-sm leading-6 text-muted'>
              {settings.supportDescription}
            </p>
            <button
              type='button'
              disabled
              aria-describedby='settings-support-status'
              className='inline-flex min-h-11 shrink-0 cursor-not-allowed items-center gap-2 rounded-md bg-[#FFDD00] px-4 text-sm font-semibold text-[#111111]'
            >
              <svg
                aria-hidden='true'
                viewBox='0 0 24 24'
                className='size-5'
                fill='none'
              >
                <path
                  d='M7 8h10v6a5 5 0 0 1-5 5 5 5 0 0 1-5-5V8Z'
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='1.8'
                />
                <path
                  d='M17 10h1.5a2.5 2.5 0 0 1 0 5H17M9 5c0-1 .8-1.2.8-2.2M13 5c0-1 .8-1.2.8-2.2M9 21h6'
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='1.8'
                />
              </svg>
              {settings.supportButton}
            </button>
          </div>
          <p
            id='settings-support-status'
            className='mt-3 text-xs text-muted'
          >
            {settings.supportStatus}
          </p>
        </section>
      </div>

      <ChangePasswordDialog
        open={view.dialog === 'password'}
        onClose={view.closeDialog}
      />
      <DeletePracticeDataDialog
        open={view.dialog === 'delete'}
        onClose={view.closeDialog}
      />
    </main>
  );
}
