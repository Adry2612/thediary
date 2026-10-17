'use client';

import { useRouter } from 'next/navigation';
import { RepertoireSongForm } from '@/components/repertoire/RepertoireSongForm';
import { BackLink } from '@/components/ui/BackLink';
import { useI18nSection } from '@/i18n/I18nProvider';

export default function NewRepertoireItemPage() {
  const text = useI18nSection('repertoire');
  const router = useRouter();

  return (
    <main className='mx-auto min-h-screen max-w-5xl px-5 py-12 sm:px-8 sm:py-16'>
      <BackLink href='/repertoire'>{text.backToRepertoire}</BackLink>
      <header className='mt-6'>
        <p className='font-mono text-xs uppercase tracking-[0.14em] text-muted'>
          {text.library}
        </p>
        <h1 className='mt-3 font-sans text-3xl font-semibold tracking-tight text-ink sm:text-4xl'>
          {text.newItemTitle}
        </h1>
        <p className='mt-3 max-w-2xl text-sm text-muted'>
          {text.newItemDescription}
        </p>
      </header>

      <RepertoireSongForm
        onCreated={(itemId) => router.push(`/repertoire/${itemId}`)}
      />
    </main>
  );
}
