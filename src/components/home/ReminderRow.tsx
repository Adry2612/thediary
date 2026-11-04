"use client";

import Link from 'next/link';
import { useInAppReminder } from '@/hooks/useInAppReminder';
import { useI18nSection } from '@/i18n/I18nProvider';

/** Recordatorio diario dentro de Inicio cuando el push no puede entregarse. */
export function ReminderRow() {
  const text = useI18nSection('reminders');
  const { visible, reasons, dismiss } = useInAppReminder();

  if (!visible) return null;

  return (
    <section
      aria-labelledby='home-reminder-title'
      className='mt-5 rounded-xl border border-accent-green-fg/40 bg-accent-green-bg/20 p-4 sm:p-5'
    >
      <div className='flex items-start justify-between gap-4'>
        <div className='min-w-0'>
          <h2
            id='home-reminder-title'
            className='text-sm font-medium text-ink'
          >
            {text.inAppTitle}
          </h2>
          <ul className='mt-2 space-y-1 text-sm leading-6 text-muted'>
            {reasons.map((reason) => (
              <li key={reason.kind} className='break-words'>
                <Link
                  href={reason.url}
                  className='underline decoration-line underline-offset-4 hover:text-ink'
                >
                  {reason.text}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href='/settings#settings-reminders'
            className='mt-3 inline-flex min-h-9 items-center text-xs text-muted underline decoration-line underline-offset-4 hover:text-ink'
          >
            {text.inAppSettings}
          </Link>
        </div>
        <button
          type='button'
          onClick={dismiss}
          aria-label={text.inAppDismiss}
          className='min-h-9 shrink-0 rounded-md border border-line px-3 text-xs text-muted transition hover:bg-white/5 hover:text-ink'
        >
          {text.inAppDismiss}
        </button>
      </div>
    </section>
  );
}
