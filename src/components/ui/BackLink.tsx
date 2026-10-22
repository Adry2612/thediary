import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@/components/ui/icons';

/**
 * Enlace para volver a la vista de la que se viene. La flecha hacia la
 * izquierda deja claro que se retrocede, sin depender de la palabra "volver".
 */
export function BackLink({
  href,
  children,
  className = '',
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 text-sm text-muted underline underline-offset-4 transition hover:text-ink focus-visible:outline-offset-2 focus-visible:outline-ink/60 ${className}`}
    >
      <ArrowLeftIcon className='size-4 shrink-0' />
      {children}
    </Link>
  );
}
