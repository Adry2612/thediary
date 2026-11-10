import type { ButtonHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@/components/ui/icons';

/**
 * Contorno compartido por los controles de volver. Es deliberadamente más
 * discreto que un botón normal: texto apagado, borde neutro y un ligero
 * desplazamiento de la flecha al pasar el cursor.
 */
const backControlStyles =
  'group inline-flex min-h-11 self-start items-center gap-2 rounded-md border border-line px-3.5 text-sm text-muted transition hover:border-white/20 hover:bg-white/5 hover:text-ink active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink/60 disabled:cursor-not-allowed disabled:opacity-50';

const arrowStyles =
  'size-4 shrink-0 transition-transform duration-150 motion-safe:group-hover:-translate-x-0.5';

/**
 * Enlace para volver a la vista de la que se viene.
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
    <Link href={href} className={`${backControlStyles} ${className}`}>
      <ArrowLeftIcon className={arrowStyles} />
      <span className='truncate'>{children}</span>
    </Link>
  );
}

/** Mismo control que `BackLink`, para retrocesos que se resuelven con código. */
export function BackButton({
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      {...props}
      type={props.type ?? 'button'}
      className={`${backControlStyles} ${className}`}
    >
      <ArrowLeftIcon className={arrowStyles} />
      <span className='truncate'>{children}</span>
    </button>
  );
}
