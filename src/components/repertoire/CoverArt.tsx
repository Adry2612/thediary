'use client';

import { useState } from 'react';
import { MusicNoteIcon } from '@/components/ui/icons';

interface CoverArtProps {
  coverUrl?: string;
  /** La lista usa la caja pequeña; el detalle, la grande; la tarjeta, el ancho. */
  size?: 'sm' | 'lg' | 'card';
  alt?: string;
}

/**
 * Carátula de una canción. La caja tiene un tamaño fijo para que la lista no
 * salte cuando falta la imagen o no se puede cargar, y el hueco lo ocupa una
 * nota en vez del icono roto del navegador.
 */
export function CoverArt({ coverUrl, size = 'sm', alt = '' }: CoverArtProps) {
  const [failed, setFailed] = useState(false);
  const imageSrc = failed ? undefined : coverUrl;
  const isCard = size === 'card';

  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden bg-canvas ${
        isCard
          ? 'aspect-square w-full'
          : size === 'sm'
            ? 'size-14 rounded-lg border border-line'
            : 'size-24 rounded-lg border border-line'
      }`}
    >
      {imageSrc ? (
        // La carátula es una URL externa: `next/image` exigiría declarar cada
        // proveedor en `next.config` y aquí no hay uno fijo.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageSrc}
          alt={alt}
          loading='lazy'
          decoding='async'
          referrerPolicy='no-referrer'
          onError={() => setFailed(true)}
          className='size-full object-cover'
        />
      ) : (
        <MusicNoteIcon
          aria-hidden='true'
          className={
            isCard
              ? 'size-8 text-muted/70'
              : size === 'sm'
                ? 'size-5 text-muted/70'
                : 'size-8 text-muted/70'
          }
        />
      )}
    </span>
  );
}
