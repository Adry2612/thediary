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
      className='mt-5 rounded-xl border border-line bg-surface p-5 sm:p-6'
    >
      <h2
        id='home-reminder-title'
        className='text-xs font-medium uppercase tracking-[0.08em] text-muted'
      >
        {text.inAppTitle}
      </h2>
      <ul className='mt-3 space-y-2'>
        {reasons.map((reason) => (
          <li
            key={reason.kind}
            className='flex items-start gap-3 text-sm leading-6'
          >
            <span
              aria-hidden
              className='mt-2.5 size-1.5 shrink-0 rounded-full bg-accent-green-fg'
            />
            <Link
              href={reason.url}
              className='min-w-0 break-words text-ink transition hover:text-accent-green-fg'
            >
              {reason.text}
            </Link>
          </li>
        ))}
      </ul>
      <div className='mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs'>
        <Link
          href='/settings#settings-reminders'
          className='text-muted transition hover:text-ink'
        >
          {text.inAppSettings}
        </Link>
        <button
          type='button'
          onClick={dismiss}
          aria-label={text.inAppDismiss}
          className='min-h-8 text-muted transition hover:text-ink'
        >
          {text.inAppDismiss}
        </button>
      </div>
    </section>
  );
}
