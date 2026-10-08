'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Field';
import { useAppData } from '@/components/providers/AppDataProvider';

export function AccountView() {
  const {
    user,
    isReady,
    isConfigured,
    configurationError,
    dataError,
    signIn,
    signUp,
    retryCloudSync,
    showLocalImportOffer,
    dismissLocalImportOffer,
    importLocalData,
  } = useAppData();
  const router = useRouter();
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function submitCredentials(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsWorking(true);
    setError(null);
    setMessage(null);

    try {
      if (isCreatingAccount) {
        const hasSession = await signUp(email.trim(), password);
        setMessage(
          hasSession ? 'Cuenta creada.' : (
            'Cuenta creada. Revisa tu correo para confirmar la dirección antes de iniciar sesión.'
          ),
        );
      } else {
        await signIn(email.trim(), password);
        router.replace('/');
      }
    } catch (authError) {
      setError(
        authError instanceof Error ?
          authError.message
        : 'No se pudo completar la operación de cuenta.',
      );
    } finally {
      setIsWorking(false);
    }
  }

  async function handleImport() {
    if (
      !window.confirm(
        'Se fusionarán los datos locales de este navegador con tu cuenta. Los datos locales seguirán guardados en este dispositivo.',
      )
    ) {
      return;
    }

    setIsWorking(true);
    setError(null);
    setMessage(null);
    try {
      const counts = await importLocalData();
      setMessage(
        `Importación completada: ${counts.sessions} sesiones, ${counts.templates} rutinas, ${counts.repertoireItems} elementos de repertorio, ${counts.recordings} grabaciones y ${counts.assets} archivos.`,
      );
    } catch (importError) {
      setError(
        importError instanceof Error ?
          importError.message
        : 'No se pudieron importar los datos locales.',
      );
    } finally {
      setIsWorking(false);
    }
  }

  async function handleRetrySync() {
    setIsWorking(true);
    setError(null);
    try {
      await retryCloudSync();
      setMessage('La sincronización se completó correctamente.');
    } catch (syncError) {
      setError(
        syncError instanceof Error ?
          syncError.message
        : 'No se pudieron sincronizar tus datos.',
      );
    } finally {
      setIsWorking(false);
    }
  }

  return (
    <main className='mx-auto max-w-3xl px-5 py-12 sm:px-8'>
      <p className='text-xs uppercase tracking-[0.12em] text-muted'>Cuenta</p>
      <h1 className='mt-2 font-sans text-3xl font-semibold tracking-tight'>
        Tus datos y sincronización
      </h1>

      {!isReady && (
        <p
          className='mt-6 text-sm text-muted'
          role='status'
        >
          Cargando tus datos guardados…
        </p>
      )}

      {configurationError && (
        <p
          className='mt-6 rounded-lg border border-red-400/30 bg-red-400/5 p-4 text-sm text-red-200'
          role='alert'
        >
          {configurationError}
        </p>
      )}

      {!isConfigured && !configurationError && (
        <section className='mt-6 rounded-xl border border-line bg-surface p-6'>
          <h2 className='text-lg font-medium'>
            Supabase aún no está conectado
          </h2>
          <p className='mt-2 text-sm text-muted'>
            Puedes seguir usando la app en modo local. Para activar cuentas y
            sincronización, sigue los pasos de configuración del proyecto.
          </p>
          <Link
            href='/account#configuracion'
            className='mt-4 inline-block text-sm underline underline-offset-4'
          >
            Ver la configuración necesaria
          </Link>
        </section>
      )}

      {isConfigured && user && (
        <section className='mt-6 rounded-xl border border-line bg-surface p-6'>
          <p className='text-xs uppercase tracking-[0.08em] text-muted'>
            Sesión iniciada
          </p>
          <p className='mt-2 text-sm'>{user.email}</p>
          <p className='mt-2 text-sm text-muted'>
            Tus datos se guardan en tu cuenta y se sincronizan al hacer cambios.
            Los archivos están en almacenamiento privado.
          </p>
          {dataError && (
            <div className='mt-4 rounded-md border border-red-400/30 bg-red-400/5 p-4'>
              <p className='text-sm text-red-200'>
                No se pudo completar la sincronización. Al reintentar se
                fusionarán los datos guardados en este dispositivo con los de la
                nube.
              </p>
              <Button
                type='button'
                variant='ghost'
                disabled={isWorking}
                onClick={() => void handleRetrySync()}
                className='mt-3'
              >
                Reintentar sincronización
              </Button>
            </div>
          )}
          {showLocalImportOffer && (
            <div className='mt-6 rounded-lg border border-accent-green-fg/25 bg-accent-green-bg/30 p-4'>
              <p className='text-sm font-medium text-ink'>
                Hay datos guardados en este dispositivo
              </p>
              <p className='mt-1 text-sm text-muted'>
                Si quieres, puedes importarlos una vez a esta cuenta. Los datos
                locales no se borrarán.
              </p>
              <div className='mt-4 flex flex-wrap gap-3'>
                <Button
                  type='button'
                  variant='primary'
                  disabled={!isReady || isWorking}
                  onClick={() => void handleImport()}
                >
                  {isWorking ? 'Importando…' : 'Importar datos locales'}
                </Button>
                <Button
                  type='button'
                  variant='ghost'
                  disabled={isWorking}
                  onClick={dismissLocalImportOffer}
                >
                  Ahora no
                </Button>
              </div>
            </div>
          )}
        </section>
      )}

      {isConfigured && !user && (
        <section
          className={`mt-6 overflow-hidden rounded-xl border bg-surface ${
            isCreatingAccount ? 'border-accent-green-fg/25' : 'border-line'
          }`}
        >
          <div
            role='group'
            aria-label='Tipo de acceso'
            className='grid grid-cols-2 border-b border-line bg-canvas/70 p-1'
          >
            <button
              type='button'
              aria-pressed={!isCreatingAccount}
              disabled={isWorking}
              onClick={() => {
                setIsCreatingAccount(false);
                setError(null);
                setMessage(null);
              }}
              className={`rounded-md px-4 py-3 text-sm transition ${
                !isCreatingAccount ?
                  'bg-white/10 text-ink'
                : 'text-muted hover:text-ink'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type='button'
              aria-pressed={isCreatingAccount}
              disabled={isWorking}
              onClick={() => {
                setIsCreatingAccount(true);
                setError(null);
                setMessage(null);
              }}
              className={`rounded-md px-4 py-3 text-sm transition ${
                isCreatingAccount ?
                  'bg-accent-green-bg text-accent-green-fg'
                : 'text-muted hover:text-ink'
              }`}
            >
              Crear cuenta
            </button>
          </div>
          <div className='p-6 sm:p-8'>
            <p className='text-xs uppercase tracking-[0.12em] text-muted'>
              {isCreatingAccount ? 'Nueva cuenta' : 'Acceso a tu cuenta'}
            </p>
            <h2 className='mt-2 text-xl font-medium'>
              {isCreatingAccount ? 'Empieza tu diario' : 'Qué bueno verte'}
            </h2>
            <p className='mt-2 text-sm text-muted'>
              {isCreatingAccount ?
                'Crea una cuenta para guardar y sincronizar tu práctica entre dispositivos.'
              : 'Inicia sesión para recuperar tu historial y continuar practicando.'
              }
            </p>
            <form
              onSubmit={(event) => void submitCredentials(event)}
              className='mt-6 grid gap-4'
            >
              <label className='block text-xs text-muted'>
                Correo electrónico
                <TextField
                  type='email'
                  autoComplete='email'
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className='mt-1'
                />
              </label>
              <label className='block text-xs text-muted'>
                Contraseña
                <TextField
                  type='password'
                  autoComplete={
                    isCreatingAccount ? 'new-password' : 'current-password'
                  }
                  minLength={8}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className='mt-1'
                />
              </label>
              <Button
                type='submit'
                variant='primary'
                disabled={isWorking}
              >
                {isWorking ?
                  'Un momento…'
                : isCreatingAccount ?
                  'Crear cuenta'
                : 'Iniciar sesión'}
              </Button>
            </form>
          </div>
        </section>
      )}

      {error && (
        <p
          className='mt-4 text-sm text-red-300'
          role='alert'
        >
          {error}
        </p>
      )}
      {dataError && (
        <p
          className='mt-4 text-sm text-red-300'
          role='alert'
        >
          No se pudieron sincronizar los cambios con Supabase: {dataError}
        </p>
      )}
      {message && (
        <p
          className='mt-4 text-sm text-accent-green-fg'
          role='status'
        >
          {message}
        </p>
      )}
    </main>
  );
}
