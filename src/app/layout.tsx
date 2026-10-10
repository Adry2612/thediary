import type { Metadata } from 'next';
import { AppDataProvider } from '@/components/providers/AppDataProvider';
import { GuestModeNotice } from '@/components/account/GuestModeNotice';
import { SiteNavigation } from '@/components/layout/SiteNavigation';
import { ActivePracticeSessionHost } from '@/components/practice/ActivePracticeSessionHost';
import { MetronomeProvider } from '@/hooks/useMetronome';
import { TutorialProvider } from '@/components/tutorial/TutorialProvider';
import { I18nProvider } from '@/i18n/I18nProvider';
import { defaultLocale, getDictionary } from '@/i18n/translations';
import './globals.css';

export const metadata: Metadata = {
  title: getDictionary(defaultLocale).app.name,
  description: getDictionary(defaultLocale).app.description,
  icons: {
    icon: [
      { url: '/favicon-32x32.png?v=4', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png?v=4', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/favicon.ico?v=4',
    apple: '/apple-touch-icon.png?v=4',
  },
  manifest: '/site.webmanifest?v=4',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang={defaultLocale}
      className='dark'
    >
      <body className='min-h-screen bg-canvas text-ink antialiased'>
        <AppDataProvider>
          <I18nProvider>
            <MetronomeProvider>
              <TutorialProvider>
                <SiteNavigation />
                <GuestModeNotice />
                {children}
                <ActivePracticeSessionHost />
              </TutorialProvider>
            </MetronomeProvider>
          </I18nProvider>
        </AppDataProvider>
      </body>
    </html>
  );
}
