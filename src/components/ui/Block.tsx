import type { HTMLAttributes } from 'react';

type BlockElement = 'article' | 'div' | 'fieldset' | 'section';

interface BlockProps extends HTMLAttributes<HTMLElement> {
  as?: BlockElement;
}

export function Block({
  as = 'section',
  className = '',
  ...props
}: BlockProps) {
  const Component = as;

  return (
    <Component
      {...props}
      className={`rounded-lg border border-line bg-surface p-4 sm:p-6 ${className}`}
    />
  );
}
