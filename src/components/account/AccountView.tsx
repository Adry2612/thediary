'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Field';
import { AccountSkeleton } from '@/components/ui/Skeletons';
import { useAccountView } from '@/hooks/useAccountView';
import { useI18nSection } from '@/i18n/I18nProvider';

export function AccountView() {
  const account = useI18nSection('account');
  const view = useAccountView(account);

  if (!view.isReady) {
    return <AccountSkeleton />;
  }

  return (
    <main className='mx-auto max-w-3xl px-5 py-12 sm:px-8'>
      <p className='text-xs uppercase tracking-[0.12em] text-muted'>
        {account.eyebrow}
      </p>
      <h1 className='mt-2 font-sans text-3xl font-semibold tracking-tight'>
        {account.title}
      </h1>

      {view.configurationError && (
        <p
          className='mt-6 rounded-lg border border-red-400/30 bg-red-400/5 p-4 text-sm text-red-200'
          role='alert'
        >
          {view.configurationError}
        </p>
      )}

      {!view.isConfigured && !view.configurationError && (
        <section className='mt-6 rounded-xl border border-line bg-surface p-6'>
          <h2 className='text-lg font-medium'>{account.notConfiguredTitle}</h2>
          <p className='mt-2 text-sm text-muted'>
            {account.notConfiguredDescription}
          </p>
          <Link
            href='/account#configuracion'
            className='mt-4 inline-block text-sm underline underline-offset-4'
          >
            {account.configLink}
          </Link>
        </section>
      )}

      {view.isConfigured && view.user && (
        <section className='mt-6 rounded-xl border border-line bg-surface p-6'>
          <p className='text-xs uppercase tracking-[0.08em] text-muted'>
            {account.signedIn}
          </p>
          <p className='mt-2 text-sm'>{view.user.email}</p>
          <p className='mt-2 text-sm text-muted'>{account.dataDescription}</p>
          {view.dataError && (
            <div className='mt-4 rounded-md border border-red-400/30 bg-red-400/5 p-4'>
              <p className='text-sm text-red-200'>
                {account.syncErrorDescription}
              </p>
              <Button
                type='button'
                variant='ghost'
                disabled={view.isWorking}
                onClick={() => void view.retrySync()}
                className='mt-3'
              >
                {account.retrySync}
              </Button>
            </div>
          )}
          {view.showLocalImportOffer && (
            <div className='mt-6 rounded-lg border border-accent-green-fg/25 bg-accent-green-bg/30 p-4'>
              <p className='text-sm font-medium text-ink'>
                {account.localDataTitle}
              </p>
              <p className='mt-1 text-sm text-muted'>
                {account.localDataDescription}
              </p>
              <div className='mt-4 flex flex-wrap gap-3'>
                <Button
                  type='button'
                  variant='primary'
                  disabled={!view.isReady || view.isWorking}
                  onClick={() => void view.importLocal()}
                >
                  {view.isWorking ? account.importing : account.importLocal}
                </Button>
                <Button
                  type='button'
                  variant='ghost'
                  disabled={view.isWorking}
                  onClick={view.dismissLocalImportOffer}
                >
                  {account.notNow}
                </Button>
              </div>
            </div>
          )}
        </section>
      )}

      {view.isConfigured && !view.user && (
        <section
          className={`mt-6 overflow-hidden rounded-xl border bg-surface ${
            view.isCreatingAccount ?
              'border-accent-green-fg/25'
            : 'border-line'
          }`}
        >
          <div
            role='group'
            aria-label={account.authType}
            className='grid grid-cols-2 border-b border-line bg-canvas/70 p-1'
          >
            <button
              type='button'
              aria-pressed={!view.isCreatingAccount}
              disabled={view.isWorking}
              onClick={() => view.selectMode(false)}
              className={`rounded-md px-4 py-3 text-sm transition ${
                !view.isCreatingAccount ?
                  'bg-white/10 text-ink'
                : 'text-muted hover:text-ink'
              }`}
            >
              {account.loginTab}
            </button>
            <button
              type='button'
              aria-pressed={view.isCreatingAccount}
              disabled={view.isWorking}
              onClick={() => view.selectMode(true)}
              className={`rounded-md px-4 py-3 text-sm transition ${
                view.isCreatingAccount ?
                  'bg-accent-green-bg text-accent-green-fg'
                : 'text-muted hover:text-ink'
              }`}
            >
              {account.createTab}
            </button>
          </div>
          <div className='p-6 sm:p-8'>
            <p className='text-xs uppercase tracking-[0.12em] text-muted'>
              {view.isCreatingAccount ?
                account.newAccountEyebrow
              : account.accessEyebrow}
            </p>
            <h2 className='mt-2 text-xl font-medium'>
              {view.isCreatingAccount ?
                account.newAccountTitle
              : account.welcomeTitle}
            </h2>
            <p className='mt-2 text-sm text-muted'>
              {view.isCreatingAccount ?
                account.newAccountDescription
              : account.loginDescription}
            </p>
            <form
              onSubmit={(event) => void view.submitCredentials(event)}
              className='mt-6 grid gap-4'
            >
              <label className='block text-xs text-muted'>
                {account.email}
                <TextField
                  type='email'
                  autoComplete='email'
                  required
                  value={view.email}
                  onChange={(event) => view.setEmail(event.target.value)}
                  className='mt-1'
                />
              </label>
              <label className='block text-xs text-muted'>
                {account.password}
                <TextField
                  type='password'
                  autoComplete={
                    view.isCreatingAccount ? 'new-password' : 'current-password'
                  }
                  minLength={8}
                  required
                  value={view.password}
                  onChange={(event) => view.setPassword(event.target.value)}
                  className='mt-1'
                />
              </label>
              <Button
                type='submit'
                variant='primary'
                disabled={view.isWorking}
              >
                {view.isWorking ?
                  account.working
                : view.isCreatingAccount ?
                  account.createAccount
                : account.signIn
                }
              </Button>
            </form>
          </div>
        </section>
      )}

      {view.error && (
        <p className='mt-4 text-sm text-red-300' role='alert'>
          {view.error}
        </p>
      )}
      {view.dataError && (
        <p className='mt-4 text-sm text-red-300' role='alert'>
          {account.syncChangesError} {view.dataError}
        </p>
      )}
      {view.message && (
        <p className='mt-4 text-sm text-accent-green-fg' role='status'>
          {view.message}
        </p>
      )}
    </main>
  );
}
