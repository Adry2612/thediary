'use client';

import Link from 'next/link';
import { ReminderSettings } from '@/components/account/ReminderSettings';
import { PageHeader } from '@/components/ui/PageHeader';
import { PageShell } from '@/components/ui/PageShell';
import { SelectField } from '@/components/ui/SelectField';
import { useAppData } from '@/components/providers/AppDataProvider';
import { useDisplayPreferences } from '@/hooks/useDisplayPreferences';
import { usePracticeFeedbackPreference } from '@/hooks/usePracticeFeedbackPreference';
import { useI18n, useI18nSection } from '@/i18n/I18nProvider';
import { type Locale } from '@/i18n/translations';
import { useTutorial } from '@/components/tutorial/TutorialProvider';

export function SettingsView() {
  const { locale, setLocale } = useI18n();
  const settings = useI18nSection('settings');
  const { openTutorial } = useTutorial();
  const { user } = useAppData();
  const feedback = usePracticeFeedbackPreference();
  const display = useDisplayPreferences();
  const feedbackMetrics = [
    {
      metric: 'mood' as const,
      title: settings.feedbackMood,
      description: settings.feedbackMoodDescription,
      enabled: feedback.isMoodEnabled,
    },
    {
      metric: 'focus' as const,
      title: settings.feedbackFocus,
      description: settings.feedbackFocusDescription,
      enabled: feedback.isFocusEnabled,
    },
  ];

  return (
    <PageShell>
      <PageHeader
        title={settings.title}
        description={settings.description}
      />

      <div className='mx-auto max-w-3xl space-y-4'>
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
                {user?.email ?? settings.guest}
              </h2>
              <p className='mt-2 max-w-lg text-sm leading-6 text-muted'>
                {user ? settings.accountSaved : settings.accountPrompt}
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
          aria-labelledby='settings-display-title'
          className='rounded-xl border border-line bg-surface p-5 sm:p-6'
        >
          <p className='text-xs uppercase tracking-[0.08em] text-muted'>
            {settings.preferences}
          </p>
          <h2
            id='settings-display-title'
            className='mt-2 text-lg font-medium text-ink'
          >
            {settings.displayTitle}
          </h2>
          <p className='mt-2 max-w-xl text-sm leading-6 text-muted'>
            {settings.displayDescription}
          </p>
          <div className='mt-4 grid gap-4 sm:grid-cols-2'>
            <div className='text-xs text-muted'>
              {settings.techniqueNames}
              <SelectField
                className='mt-1'
                ariaLabel={settings.techniqueNames}
                value={display.techniqueNamePreference}
                options={[
                  { value: 'es', label: settings.techniqueNamesSpanish },
                  {
                    value: 'original',
                    label: settings.techniqueNamesOriginal,
                  },
                ]}
                onChange={(value) =>
                  display.setTechniqueNameLanguage(
                    value === 'original' ? 'original' : 'es',
                  )
                }
              />
            </div>
            <div className='text-xs text-muted'>
              {settings.tuningDisplay}
              <SelectField
                className='mt-1'
                ariaLabel={settings.tuningDisplay}
                value={display.tuningDisplay}
                options={[
                  { value: 'name', label: settings.tuningDisplayName },
                  { value: 'notes', label: settings.tuningDisplayNotes },
                ]}
                onChange={(value) =>
                  display.setTuningDisplay(value === 'notes' ? 'notes' : 'name')
                }
              />
            </div>
            <div className='text-xs text-muted'>
              {settings.weekStart}
              <SelectField
                className='mt-1'
                ariaLabel={settings.weekStart}
                value={display.weekStartsOn}
                options={[
                  { value: 'monday', label: settings.weekStartMonday },
                  { value: 'sunday', label: settings.weekStartSunday },
                ]}
                onChange={(value) =>
                  display.setWeekStartsOn(value === 'sunday' ? 'sunday' : 'monday')
                }
              />
            </div>
          </div>
          <p className='mt-3 text-xs text-muted'>{settings.displayScope}</p>
        </section>

        <section
          aria-labelledby='settings-feedback-title'
          className='rounded-xl border border-line bg-surface p-5 sm:p-6'
        >
          <p className='text-xs uppercase tracking-[0.08em] text-muted'>
            {settings.preferences}
          </p>
          <h2
            id='settings-feedback-title'
            className='mt-2 text-lg font-medium text-ink'
          >
            {settings.feedbackTitle}
          </h2>
          <p className='mt-2 max-w-xl text-sm leading-6 text-muted'>
            {settings.feedbackDescription}
          </p>
          <div className='mt-4 grid gap-3 sm:grid-cols-2'>
            {feedbackMetrics.map((metric) => (
              <div
                key={metric.metric}
                className='flex flex-col gap-3 rounded-md border border-line p-4'
              >
                <div>
                  <p className='text-sm font-medium text-ink'>{metric.title}</p>
                  <p className='mt-1 text-xs leading-5 text-muted'>
                    {metric.description}
                  </p>
                </div>
                <button
                  type='button'
                  aria-pressed={metric.enabled}
                  aria-label={`${metric.title}: ${metric.enabled ? settings.feedbackToggleOn : settings.feedbackToggleOff}`}
                  onClick={() =>
                    feedback.setEnabled(metric.metric, !metric.enabled)
                  }
                  className={`min-h-10 self-start rounded-md border px-3 text-sm transition hover:bg-white/5 ${
                    metric.enabled ?
                      'border-accent-green-fg/50 bg-accent-green-bg/30 text-accent-green-fg'
                    : 'border-line text-ink'
                  }`}
                >
                  {metric.enabled ?
                    settings.feedbackToggleOn
                  : settings.feedbackToggleOff}
                </button>
              </div>
            ))}
          </div>
        </section>

        <ReminderSettings />

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
    </PageShell>
  );
}
