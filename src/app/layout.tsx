import type { Metadata } from 'next';
import { AppDataProvider } from '@/components/providers/AppDataProvider';
import { GuestModeNotice } from '@/components/account/GuestModeNotice';
import { SiteNavigation } from '@/components/layout/SiteNavigation';
import './globals.css';

export const metadata: Metadata = {
  title: 'thediary',
  description: 'Registro de práctica musical sin distracciones.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang='es'
      className='dark'
    >
      <body className='min-h-screen bg-canvas text-ink antialiased'>
        <AppDataProvider>
          <SiteNavigation />
          <GuestModeNotice />
          {children}
        </AppDataProvider>
      </body>
    </html>
  );
}
