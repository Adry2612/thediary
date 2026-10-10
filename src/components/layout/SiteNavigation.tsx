'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useI18nSection } from '@/i18n/I18nProvider';

const NAVIGATION = [
  { href: '/', label: 'home' },
  { href: '/dashboard', label: 'dashboard' },
  { href: '/practice', label: 'practice' },
  { href: '/metronome', label: 'metronome' },
  { href: '/recordings', label: 'recordings' },
  { href: '/repertoire', label: 'repertoire' },
];

export function SiteNavigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigation = useI18nSection('navigation');
  const common = useI18nSection('common');
  const app = useI18nSection('app');
  const isSettingsCurrent =
    pathname === '/settings' || pathname.startsWith('/settings/');
  const currentNavigationItem = NAVIGATION.find((item) =>
    item.href === '/'
      ? pathname === '/'
      : pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  const currentSection = currentNavigationItem
    ? navigation[currentNavigationItem.label as keyof typeof navigation]
    : isSettingsCurrent
      ? common.settings
      : undefined;

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMenuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isMenuOpen]);

  const renderNavigationItems = (onNavigate?: () => void) =>
    NAVIGATION.map((item) => {
      const isCurrent =
        item.href === '/' ?
          pathname === '/'
        : pathname === item.href || pathname.startsWith(`${item.href}/`);

      return (
        <li key={item.href} className='shrink-0'>
          <Link
            href={item.href}
            aria-current={isCurrent ? 'page' : undefined}
            onClick={onNavigate}
            className={`block rounded-md px-3 py-2 text-xs transition sm:text-sm ${isCurrent ? 'bg-white/5 text-ink' : 'text-muted hover:text-ink'}`}
          >
            {navigation[item.label as keyof typeof navigation]}
          </Link>
        </li>
      );
    });

  const settingsLink = (onNavigate?: () => void) => (
    <Link
      href='/settings'
      aria-label={common.settings}
      aria-current={isSettingsCurrent ? 'page' : undefined}
      onClick={onNavigate}
      className={`inline-flex h-10 items-center gap-2 rounded-md border border-line px-3 text-sm text-ink transition hover:bg-white/5 focus-visible:outline-offset-2 focus-visible:outline-ink/60 ${isSettingsCurrent ? 'bg-white/5' : ''}`}
    >
      <SettingsIcon />
      <span>{common.settings}</span>
    </Link>
  );

  return (
    <header className='border-b border-line'>
      <nav
        aria-label={navigation.main}
        className='mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8'
      >
        <div
          data-tour-target='brand'
          className='shrink-0 font-sans text-xl font-semibold tracking-[-0.02em] text-ink'
        >
          {app.name}
        </div>
        <ul className='hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto md:flex'>
          {renderNavigationItems()}
        </ul>
        <div className='hidden md:block'>
          {settingsLink()}
        </div>
        <button
          type='button'
          aria-label={isMenuOpen ? common.closeMenu : common.openMenu}
          aria-expanded={isMenuOpen}
          aria-controls='mobile-navigation-menu'
          onClick={() => setIsMenuOpen((open) => !open)}
          className='inline-flex size-10 items-center justify-center rounded-md border border-line text-ink transition hover:bg-white/5 focus-visible:outline-offset-2 focus-visible:outline-ink/60 md:hidden'
        >
          <span className='sr-only'>{isMenuOpen ? common.closeMenu : common.openMenu}</span>
          <span aria-hidden='true' className={`relative block size-5 ${isMenuOpen ? 'rotate-0' : ''}`}>
            <span className={`absolute left-0 top-1/2 h-px w-5 bg-current transition-transform duration-200 ${isMenuOpen ? 'rotate-45' : '-translate-y-1.5'}`} />
            <span className={`absolute left-0 top-1/2 h-px w-5 bg-current transition-opacity duration-200 ${isMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`absolute left-0 top-1/2 h-px w-5 bg-current transition-transform duration-200 ${isMenuOpen ? '-rotate-45' : 'translate-y-1.5'}`} />
          </span>
        </button>
      </nav>
      {currentSection && (
        <div className='border-t border-line md:hidden'>
          <div className='mx-auto max-w-7xl px-5 py-2 sm:px-8'>
            <p className='truncate text-xs font-medium text-muted'>
              {currentSection}
            </p>
          </div>
        </div>
      )}
      {isMenuOpen && (
        <div id='mobile-navigation-menu' className='navigation-menu-enter border-t border-line bg-surface md:hidden'>
          <div className='mx-auto max-w-7xl px-5 py-3 sm:px-8'>
            <ul className='space-y-1'>{renderNavigationItems(() => setIsMenuOpen(false))}</ul>
            <div className='mt-3 border-t border-line pt-3'>
              {settingsLink(() => setIsMenuOpen(false))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function SettingsIcon() {
  return (
    <svg aria-hidden='true' viewBox='0 0 24 24' className='size-5' fill='none'>
      <path d='M10.4 3.5h3.2l.5 2.1a6.9 6.9 0 0 1 1.5.9l2.1-.6 1.6 2.8-1.6 1.5a7 7 0 0 1 0 1.8l1.6 1.5-1.6 2.8-2.1-.6a6.9 6.9 0 0 1-1.5.9l-.5 2.1h-3.2l-.5-2.1a6.9 6.9 0 0 1-1.5-.9l-2.1.6-1.6-2.8 1.6-1.5a7 7 0 0 1 0-1.8L4.7 8.7l1.6-2.8 2.1.6a6.9 6.9 0 0 1 1.5-.9l.5-2.1Z' stroke='currentColor' strokeLinejoin='round' strokeWidth='1.5' />
      <circle cx='12' cy='11.5' r='2.5' stroke='currentColor' strokeWidth='1.5' />
    </svg>
  );
}
