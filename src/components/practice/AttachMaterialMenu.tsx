'use client';

import { useDismissibleMenu } from '@/hooks/useDismissibleMenu';
import {
  ATTACHMENT_TYPES,
  type AttachmentType,
} from '@/types/practice-attachment';
import { ATTACHMENT_OPTIONS } from '@/utils/practice-attachments';

interface Props {
  onSelect: (type: AttachmentType) => void;
}

export const AttachMaterialMenu = ({ onSelect }: Props) => {
  const { containerRef, isOpen, toggle, close } = useDismissibleMenu();

  function handleSelect(type: AttachmentType) {
    close();
    onSelect(type);
  }

  return (
    <div
      ref={containerRef}
      className='relative shrink-0'
    >
      <button
        type='button'
        onClick={toggle}
        aria-haspopup='menu'
        aria-expanded={isOpen}
        aria-label='Adjuntar material de estudio'
        title='Adjuntar material de estudio'
        className='inline-flex size-11 items-center justify-center rounded-md border border-line text-xl leading-none text-ink transition hover:bg-white/5 focus-visible:outline-offset-2 focus-visible:outline-ink/60'
      >
        <span
          aria-hidden='true'
          className={`transition-transform ${isOpen ? 'rotate-45' : ''}`}
        >
          +
        </span>
      </button>
      {isOpen && (
        <ul
          role='menu'
          aria-label='Tipo de material'
          className='absolute right-0 top-full z-30 mt-2 w-56 max-w-[calc(100vw-3rem)] overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-lg shadow-black/40'
        >
          {ATTACHMENT_TYPES.map((type) => (
            <li
              key={type}
              role='none'
            >
              <button
                type='button'
                role='menuitem'
                onClick={() => handleSelect(type)}
                className='flex min-h-11 w-full items-baseline justify-between gap-3 rounded-md px-3 py-2 text-left text-sm transition hover:bg-white/5 focus-visible:bg-white/5 focus-visible:outline-none'
              >
                <span className='font-medium'>{ATTACHMENT_OPTIONS[type].label}</span>
                <span className='truncate text-xs text-muted'>
                  {ATTACHMENT_OPTIONS[type].hint}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
