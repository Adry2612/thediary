'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppData } from '@/components/providers/AppDataProvider';
import { useTutorial } from '@/components/tutorial/TutorialProvider';
import { SelectField } from '@/components/ui/SelectField';
import { useI18n, useI18nSection } from '@/i18n/I18nProvider';
import { type Locale } from '@/i18n/translations';

type DialogName = 'password' | 'delete' | null;

function describeError(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function SettingsView() {
  const { locale, setLocale } = useI18n();
  const settings = useI18nSection('settings');
  const { user, signOut, updatePassword, deleteAllPracticeData } = useAppData();
  const { openTutorial } = useTutorial();
  const router = useRouter();
  const [dialog, setDialog] = useState<DialogName>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  async function handleSignOut() {
    setIsSigningOut(true);
    setSignOutError(null);
    try {
      await signOut();
      router.replace('/account');
    } catch (error) {
       setSignOutError(describeError(error, settings.signOut));
    } finally {
      setIsSigningOut(false);
    }
  }

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
                Cuenta
              </p>
              <h2
                id='settings-account-title'
                className='mt-2 text-lg font-medium text-ink'
              >
                 {user?.email ?? settings.guest}
              </h2>
              <p className='mt-2 max-w-lg text-sm leading-6 text-muted'>
                {user ?
                   settings.accountSaved
                : settings.accountPrompt
                }
              </p>
            </div>
            <Link
              href='/account'
              className='inline-flex min-h-11 shrink-0 items-center justify-center rounded-md border border-line px-4 text-sm text-ink transition hover:bg-white/5'
            >
               {user ? settings.accountSync : settings.signIn}
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

        {user && (
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
                  onClick={() => setDialog('password')}
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
                  disabled={isSigningOut}
                  onClick={() => void handleSignOut()}
                  className='min-h-11 shrink-0 rounded-md border border-line px-4 text-sm text-ink transition hover:bg-white/5 disabled:opacity-50'
                >
                   {isSigningOut ? `${settings.signOut}…` : settings.signOut}
                </button>
              </div>
              {signOutError && (
                <p
                  className='mt-3 text-sm text-accent-red-fg'
                  role='alert'
                >
                  {signOutError}
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
              onClick={() => setDialog('delete')}
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

      {dialog === 'password' && (
        <ChangePasswordDialog
          onClose={() => setDialog(null)}
          onUpdate={updatePassword}
        />
      )}
      {dialog === 'delete' && (
        <DeletePracticeDataDialog
          onClose={() => setDialog(null)}
          onDelete={deleteAllPracticeData}
        />
      )}
    </main>
  );
}

interface ModalProps {
  title: string;
  description: string;
  onClose: () => void;
  children: ReactNode;
  busy: boolean;
}

function Modal({ title, description, onClose, children, busy }: ModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !busy) onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [busy, onClose]);

  return createPortal(
    <div
      className='fixed inset-0 z-50 grid place-items-center bg-black/60 p-4'
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <section
        aria-labelledby='settings-dialog-title'
        aria-describedby='settings-dialog-description'
        aria-modal='true'
        role='dialog'
        className='w-full max-w-md rounded-xl border border-line bg-surface p-6'
      >
        <h2
          id='settings-dialog-title'
          className='text-lg font-semibold text-ink'
        >
          {title}
        </h2>
        <p
          id='settings-dialog-description'
          className='mt-2 text-sm leading-6 text-muted'
        >
          {description}
        </p>
        {children}
      </section>
    </div>,
    document.body,
  );
}

interface ChangePasswordDialogProps {
  onClose: () => void;
  onUpdate: (password: string) => Promise<void>;
}

function ChangePasswordDialog({
  onClose,
  onUpdate,
}: ChangePasswordDialogProps) {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  async function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmation) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsWorking(true);
    setError(null);
    try {
      await onUpdate(password);
      setIsComplete(true);
    } catch (updateError) {
      setError(describeError(updateError, 'No se pudo cambiar la contraseña.'));
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <Modal
      title='Cambiar contraseña'
      description='Escribe una contraseña nueva para tu cuenta.'
      onClose={onClose}
      busy={isWorking}
    >
      {isComplete ?
        <div className='mt-5'>
          <p
            className='text-sm text-accent-green-fg'
            role='status'
          >
            La contraseña se ha actualizado.
          </p>
          <button
            type='button'
            onClick={onClose}
            className='mt-5 rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-canvas transition hover:bg-white'
          >
            Cerrar
          </button>
        </div>
      : <form
          onSubmit={(event) => void submitPassword(event)}
          className='mt-5'
        >
          <label
            className='block text-sm text-ink'
            htmlFor='new-password'
          >
            Nueva contraseña
          </label>
          <input
            id='new-password'
            type='password'
            autoComplete='new-password'
            minLength={6}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className='mt-2 h-11 w-full rounded-md border border-line bg-canvas px-3 text-sm text-ink outline-none focus:border-ink/50'
          />
          <label
            className='mt-4 block text-sm text-ink'
            htmlFor='confirm-password'
          >
            Repite la contraseña
          </label>
          <input
            id='confirm-password'
            type='password'
            autoComplete='new-password'
            minLength={6}
            required
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            className='mt-2 h-11 w-full rounded-md border border-line bg-canvas px-3 text-sm text-ink outline-none focus:border-ink/50'
          />
          {error && (
            <p
              className='mt-3 text-sm text-accent-red-fg'
              role='alert'
            >
              {error}
            </p>
          )}
          <div className='mt-6 flex justify-end gap-3'>
            <button
              type='button'
              disabled={isWorking}
              onClick={onClose}
              className='rounded-md border border-line px-4 py-2.5 text-sm text-ink transition hover:bg-white/5 disabled:opacity-50'
            >
              Cancelar
            </button>
            <button
              type='submit'
              disabled={isWorking}
              className='rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-canvas transition hover:bg-white disabled:opacity-50'
            >
              {isWorking ? 'Guardando…' : 'Actualizar contraseña'}
            </button>
          </div>
        </form>
      }
    </Modal>
  );
}

interface DeletePracticeDataDialogProps {
  onClose: () => void;
  onDelete: () => Promise<void>;
}

function DeletePracticeDataDialog({
  onClose,
  onDelete,
}: DeletePracticeDataDialogProps) {
  const [confirmation, setConfirmation] = useState('');
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  async function deleteData() {
    setIsWorking(true);
    setError(null);
    try {
      await onDelete();
      setIsComplete(true);
    } catch (deleteError) {
      setError(
        describeError(deleteError, 'No se pudieron borrar todos los datos.'),
      );
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <Modal
      title='¿Seguro que quieres eliminar tus datos?'
      description='Se borrarán definitivamente tus sesiones, rutinas, repertorio, grabaciones y materiales de Supabase, además de los datos de práctica locales de este navegador. La cuenta seguirá activa y no se podrá recuperar el contenido eliminado.'
      onClose={onClose}
      busy={isWorking}
    >
      {isComplete ?
        <div className='mt-5'>
          <p
            className='text-sm text-accent-green-fg'
            role='status'
          >
            Se eliminaron tus datos de práctica. Tu cuenta sigue activa.
          </p>
          <button
            type='button'
            onClick={onClose}
            className='mt-5 rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-canvas transition hover:bg-white'
          >
            Cerrar
          </button>
        </div>
      : <div className='mt-5'>
          <label
            className='block text-sm text-ink'
            htmlFor='delete-confirmation'
          >
            Escribe <strong>BORRAR</strong> para confirmar
          </label>
          <input
            id='delete-confirmation'
            type='text'
            autoComplete='off'
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            className='mt-2 h-11 w-full rounded-md border border-line bg-canvas px-3 text-sm text-ink outline-none focus:border-ink/50'
          />
          {error && (
            <p
              className='mt-3 text-sm text-accent-red-fg'
              role='alert'
            >
              {error}
            </p>
          )}
          <div className='mt-6 flex justify-end gap-3'>
            <button
              type='button'
              disabled={isWorking}
              onClick={onClose}
              className='rounded-md border border-line px-4 py-2.5 text-sm text-ink transition hover:bg-white/5 disabled:opacity-50'
            >
              Cancelar
            </button>
            <button
              type='button'
              disabled={isWorking || confirmation !== 'BORRAR'}
              onClick={() => void deleteData()}
              className='rounded-md bg-accent-red-fg px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50'
            >
              {isWorking ? 'Borrando…' : 'Eliminar datos'}
            </button>
          </div>
        </div>
      }
    </Modal>
  );
}
