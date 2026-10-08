'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAVIGATION = [
  { href: '/', label: 'Inicio' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/practice', label: 'Práctica' },
  { href: '/metronome', label: 'Metrónomo' },
  { href: '/recordings', label: 'Grabaciones' },
  { href: '/repertoire', label: 'Mi repertorio' },
];

export function SiteNavigation() {
  const pathname = usePathname();

  return (
    <header className='border-b border-line'>
      <nav
        aria-label='Navegación principal'
        className='mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8'
      >
        <div
          data-tour-target='brand'
          className='shrink-0 font-sans text-xl font-semibold tracking-[-0.02em] text-ink'
        >
          thediary.
        </div>
        <ul className='flex min-w-0 flex-1 items-center gap-1 overflow-x-auto'>
          {NAVIGATION.map((item) => {
            const isCurrent =
              item.href === '/' ?
                pathname === '/'
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li
                key={item.href}
                className='shrink-0'
              >
                <Link
                  href={item.href}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={`block rounded-md px-3 py-2 text-xs transition sm:text-sm ${isCurrent ? 'bg-white/5 text-ink' : 'text-muted hover:text-ink'}`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <Link
          href='/settings'
          aria-label='Configuración'
          aria-current={
            pathname === '/settings' || pathname.startsWith('/settings/') ?
              'page'
            : undefined
          }
          className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-md border border-line px-3 text-sm text-ink transition hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/60 ${pathname === '/settings' || pathname.startsWith('/settings/') ? 'bg-white/5' : ''}`}
        >
          <svg
            aria-hidden='true'
            viewBox='0 0 24 24'
            className='size-5'
            fill='none'
          >
            <path
              d='M10.4 3.5h3.2l.5 2.1a6.9 6.9 0 0 1 1.5.9l2.1-.6 1.6 2.8-1.6 1.5a7 7 0 0 1 0 1.8l1.6 1.5-1.6 2.8-2.1-.6a6.9 6.9 0 0 1-1.5.9l-.5 2.1h-3.2l-.5-2.1a6.9 6.9 0 0 1-1.5-.9l-2.1.6-1.6-2.8 1.6-1.5a7 7 0 0 1 0-1.8L4.7 8.7l1.6-2.8 2.1.6a6.9 6.9 0 0 1 1.5-.9l.5-2.1Z'
              stroke='currentColor'
              strokeLinejoin='round'
              strokeWidth='1.5'
            />
            <circle
              cx='12'
              cy='11.5'
              r='2.5'
              stroke='currentColor'
              strokeWidth='1.5'
            />
          </svg>
          <span className='hidden sm:inline'>Configuración</span>
        </Link>
      </nav>
    </header>
  );
}
