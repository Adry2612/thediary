"use client";

import { useAppData } from '@/components/providers/AppDataProvider';
import { usePushReminders } from '@/hooks/usePushReminders';
import { useReminderPreferences } from '@/hooks/useReminderPreferences';
import { useI18nSection } from '@/i18n/I18nProvider';
import { SelectField } from '@/components/ui/SelectField';
import type { ReminderInactivityDays } from '@/types/reminders';

function ReminderToggle({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}) {
  const settings = useI18nSection('settings');

  return (
    <button
      type='button'
      role='switch'
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`min-h-10 rounded-md border px-3 text-sm transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked
          ? 'border-accent-green-fg/50 bg-accent-green-bg/30 text-accent-green-fg'
          : 'border-line text-ink'
      }`}
    >
      {checked ? settings.feedbackToggleOn : settings.feedbackToggleOff}
    </button>
  );
}

export function ReminderSettings() {
  const text = useI18nSection('reminders');
  const { user } = useAppData();
  const push = usePushReminders();
  const {
    preferences,
    setEnabled,
    setReason,
    setTime,
    setInactivityDays,
  } = useReminderPreferences();

  const isGuest = !user;
  const pushUsable = push.support === 'supported';

  function handleMaster(next: boolean) {
    if (!next) {
      void push.disable();
      return;
    }
    if (user && pushUsable) {
      void push.enable();
      return;
    }
    // Invitado o navegador sin push: el aviso dentro de la app sigue valiendo.
    setEnabled(true);
  }

  let status = text.permissionDefault;
  if (isGuest) status = text.guestNotice;
  else if (push.support === 'unsupported') status = text.permissionUnsupported;
  else if (push.support === 'not-configured')
    status = text.permissionNotConfigured;
  else if (push.permission === 'granted') status = text.permissionGranted;
  else if (push.permission === 'denied') status = text.permissionDenied;

  return (
    <section
      id='settings-reminders'
      aria-labelledby='settings-reminders-title'
      className='rounded-xl border border-line bg-surface p-5 sm:p-6'
    >
      <p className='text-xs uppercase tracking-[0.08em] text-muted'>
        {text.title}
      </p>
      <h2
        id='settings-reminders-title'
        className='mt-2 text-lg font-medium text-ink'
      >
        {text.title}
      </h2>
      <p className='mt-2 max-w-xl text-sm leading-6 text-muted'>
        {text.description}
      </p>

      <div className='mt-4 flex flex-col gap-3 rounded-md border border-line p-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='min-w-0'>
          <p className='text-sm font-medium text-ink'>{text.enabled}</p>
          <p className='mt-1 text-xs leading-5 text-muted'>
            {text.enabledDescription}
          </p>
        </div>
        <ReminderToggle
          label={text.enabled}
          checked={preferences.enabled}
          disabled={push.busy}
          onChange={handleMaster}
        />
      </div>

      <div className='mt-3 grid gap-3 sm:grid-cols-2'>
        <div className='rounded-md border border-line p-4'>
          <p className='text-sm font-medium text-ink'>{text.practice}</p>
          <p className='mt-1 text-xs leading-5 text-muted'>
            {text.practiceDescription}
          </p>
          <div className='mt-3'>
            <ReminderToggle
              label={text.practice}
              checked={preferences.practice}
              onChange={(next) => setReason('practice', next)}
            />
          </div>
        </div>
        <div className='rounded-md border border-line p-4'>
          <p className='text-sm font-medium text-ink'>{text.strings}</p>
          <p className='mt-1 text-xs leading-5 text-muted'>
            {text.stringsDescription}
          </p>
          <div className='mt-3'>
            <ReminderToggle
              label={text.strings}
              checked={preferences.strings}
              onChange={(next) => setReason('strings', next)}
            />
          </div>
        </div>
        <div className='rounded-md border border-line p-4'>
          <p className='text-sm font-medium text-ink'>{text.inactivity}</p>
          <p className='mt-1 text-xs leading-5 text-muted'>
            {text.inactivityDescription}
          </p>
          <div className='mt-3'>
            <ReminderToggle
              label={text.inactivity}
              checked={preferences.inactivity}
              onChange={(next) => setReason('inactivity', next)}
            />
          </div>
        </div>
        <div className='rounded-md border border-line p-4'>
          <label
            htmlFor='reminder-time'
            className='text-xs text-muted'
          >
            {text.time}
          </label>
          <input
            id='reminder-time'
            type='time'
            value={preferences.time}
            onChange={(event) => setTime(event.target.value)}
            className='mt-2 block min-h-10 w-full rounded-md border border-line bg-canvas px-3 text-sm text-ink'
          />
          <p className='mt-1 text-xs leading-5 text-muted'>
            {text.timeDescription}
          </p>
        </div>
      </div>

      {preferences.inactivity ? (
        <div className='mt-3 max-w-xs text-xs text-muted'>
          {text.inactivityDays}
          <SelectField
            className='mt-1'
            ariaLabel={text.inactivityDays}
            value={String(preferences.inactivityDays)}
            options={[
              { value: '3', label: text.days3 },
              { value: '7', label: text.days7 },
              { value: '14', label: text.days14 },
              { value: '30', label: text.days30 },
            ]}
            onChange={(value) =>
              setInactivityDays(Number(value) as ReminderInactivityDays)
            }
          />
        </div>
      ) : null}

      <p className='mt-4 text-xs leading-5 text-muted' role='status'>
        {status}
      </p>
      {push.permission === 'denied' ? (
        <p className='mt-1 text-xs leading-5 text-muted'>{text.blockedHelp}</p>
      ) : null}

      <div className='mt-4 flex flex-wrap items-center gap-3'>
        {pushUsable && push.permission === 'granted' ? (
          <button
            type='button'
            onClick={() => void push.sendTest()}
            className='min-h-10 rounded-md border border-line px-3 text-sm text-ink transition hover:bg-white/5'
          >
            {text.test}
          </button>
        ) : null}
        <p className='text-xs text-muted'>{text.deviceScope}</p>
      </div>

      {push.error ? (
        <p className='mt-3 text-sm text-red-300' role='alert'>
          {push.error}
        </p>
      ) : null}
      {push.feedback ? (
        <p className='mt-3 text-sm text-accent-green-fg' role='status'>
          {push.feedback}
        </p>
      ) : null}
    </section>
  );
}
