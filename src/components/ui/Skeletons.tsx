import { PageShell } from "@/components/ui/PageShell";

type SkeletonProps = {
  className?: string;
};

function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <span
      aria-hidden='true'
      className={`block animate-pulse rounded-md bg-white/[0.08] ${className}`}
    />
  );
}

function SkeletonHeader({ compact = false }: { compact?: boolean }) {
  return (
    <header className='mb-8'>
      <Skeleton className='h-10 w-64 max-w-full sm:h-12' />
      <Skeleton className='mt-4 h-5 w-full max-w-xl' />
      {!compact && <Skeleton className='mt-2 h-5 w-4/5 max-w-lg' />}
    </header>
  );
}

function SkeletonCard({ className = '' }: SkeletonProps) {
  return (
    <div className={`rounded-xl border border-line bg-surface p-5 ${className}`}>
      <Skeleton className='h-3 w-24' />
      <Skeleton className='mt-5 h-8 w-32' />
      <Skeleton className='mt-3 h-3 w-40' />
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <PageShell
      aria-busy='true'
      aria-label='Cargando inicio'
    >
      <SkeletonHeader compact />
      <SkeletonCard className='h-36' />
      <SkeletonCard className='mt-5 h-32' />
      <Skeleton className='mt-5 h-72 w-full rounded-xl' />
      <div className='mt-5 grid items-stretch gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]'>
        <Skeleton className='h-64 rounded-xl' />
        <Skeleton className='h-64 rounded-xl' />
      </div>
    </PageShell>
  );
}

export function DashboardSkeleton() {
  return (
    <PageShell
      aria-busy='true'
      aria-label='Cargando panel'
    >
      <SkeletonHeader />
      <SkeletonCard className='h-36' />
      <Skeleton className='mt-5 h-48 w-full rounded-xl' />
      <div className='mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2'>
        <Skeleton className='h-72 rounded-xl' />
        <Skeleton className='h-72 rounded-xl' />
      </div>
      <div className='mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>
        {Array.from({ length: 6 }, (_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </PageShell>
  );
}

export function PracticeSkeleton() {
  return (
    <PageShell
      aria-busy='true'
      aria-label='Cargando práctica'
      className='flex flex-col gap-6'
    >
      <SkeletonHeader compact />
      <div className='rounded-xl border border-line bg-surface p-5 sm:p-7'>
        <Skeleton className='h-5 w-40' />
        <Skeleton className='mt-6 h-12 w-full' />
        <div className='mt-6 space-y-4'>
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className='rounded-lg border border-line p-4'>
              <div className='flex items-center justify-between gap-4'>
                <Skeleton className='h-5 w-32' />
                <Skeleton className='h-9 w-20' />
              </div>
              <Skeleton className='mt-4 h-10 w-full' />
            </div>
          ))}
        </div>
        <div className='mt-6 flex flex-wrap justify-between gap-3 border-t border-line pt-5'>
          <Skeleton className='h-11 w-28' />
          <div className='flex gap-2'>
            <Skeleton className='h-11 w-28' />
            <Skeleton className='h-11 w-32' />
          </div>
        </div>
      </div>
    </PageShell>
  );
}

export function MetronomeSkeleton() {
  return (
    <PageShell
      aria-busy='true'
      aria-label='Cargando metrónomo'
    >
      <SkeletonHeader compact />
      <div className='mx-auto w-full max-w-3xl rounded-xl border border-line bg-surface p-8 sm:p-12'>
        <div className='flex items-center justify-between'>
          <div>
            <Skeleton className='h-4 w-28' />
            <Skeleton className='mt-2 h-3 w-20' />
          </div>
          <Skeleton className='size-10 rounded-md' />
        </div>
        <div className='mt-10 flex items-center justify-between gap-4 sm:mt-14'>
          <Skeleton className='size-10 rounded-md' />
          <div className='flex flex-col items-center'>
            <Skeleton className='h-20 w-40' />
            <Skeleton className='mt-2 h-3 w-8' />
          </div>
          <Skeleton className='size-10 rounded-md' />
        </div>
        <Skeleton className='mt-8 h-3 w-full' />
        <Skeleton className='mt-8 h-11 w-full' />
        <Skeleton className='mt-5 h-11 w-full' />
        <Skeleton className='mx-auto mt-2 h-3 w-48' />
      </div>
    </PageShell>
  );
}

export function RecordingsSkeleton() {
  return (
    <PageShell
      aria-busy='true'
      aria-label='Cargando grabaciones'
    >
      <SkeletonHeader compact />
      <div className='rounded-xl border border-line bg-surface p-5 sm:p-6'>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index}>
              <Skeleton className='h-3 w-24' />
              <Skeleton className='mt-2 h-11 w-full' />
            </div>
          ))}
        </div>
        <Skeleton className='mt-4 h-3 w-40' />
      </div>
      <div className='mt-8 space-y-10'>
        {Array.from({ length: 2 }, (_, groupIndex) => (
          <section key={groupIndex}>
            <div className='flex items-baseline justify-between border-b border-line pb-3'>
              <Skeleton className='h-8 w-52' />
              <Skeleton className='h-3 w-20' />
            </div>
            <div className='mt-4 space-y-3'>
              {Array.from({ length: 2 }, (_, itemIndex) => (
                <div
                  key={itemIndex}
                  className='rounded-lg border border-line bg-canvas/60 p-4'
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div className='min-w-0 flex-1'>
                      <Skeleton className='h-4 w-44 max-w-full' />
                      <Skeleton className='mt-2 h-3 w-56 max-w-full' />
                      <Skeleton className='mt-2 h-3 w-32' />
                      <Skeleton className='mt-2 h-3 w-24' />
                    </div>
                    <Skeleton className='size-10 shrink-0 rounded-md' />
                  </div>
                  <div className='mt-4 border-t border-line pt-4'>
                    <Skeleton className='h-10 w-full' />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}

export function RecordingsListSkeleton({
  label,
  rows = 3,
}: {
  label?: string;
  rows?: number;
}) {
  return (
    <div aria-busy='true' className='mt-8'>
      {label && (
        <p className='text-sm text-muted' role='status' aria-live='polite'>
          {label}
        </p>
      )}
      {rows > 0 && (
        <div className='mt-4 space-y-3'>
          {Array.from({ length: rows }, (_, index) => (
            <div
              key={index}
              className='rounded-lg border border-line bg-canvas/60 p-4'
            >
              <div className='flex items-start justify-between gap-3'>
                <div className='min-w-0 flex-1'>
                  <Skeleton className='h-4 w-44 max-w-full' />
                  <Skeleton className='mt-2 h-3 w-56 max-w-full' />
                  <Skeleton className='mt-2 h-3 w-32' />
                </div>
                <Skeleton className='size-10 shrink-0 rounded-md' />
              </div>
              <div className='mt-4 border-t border-line pt-4'>
                <Skeleton className='h-10 w-full' />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <PageShell
      aria-busy='true'
      aria-label='Cargando opciones'
    >
      <SkeletonHeader compact />
      <div className='max-w-3xl space-y-4'>
        {Array.from({ length: 5 }, (_, index) => (
          <SkeletonCard key={index} className='h-36 sm:h-32' />
        ))}
      </div>
    </PageShell>
  );
}

export function AccountSkeleton() {
  return (
    <PageShell
      aria-busy='true'
      aria-label='Cargando cuenta'
    >
      <SkeletonHeader compact />
      <div className='max-w-3xl'>
        <SkeletonCard className='h-40' />
        <SkeletonCard className='mt-6 h-72' />
      </div>
    </PageShell>
  );
}

export function RepertoireSkeleton() {
  return (
    <PageShell
      aria-busy='true'
      aria-label='Cargando repertorio'
    >
      <SkeletonHeader />
      <div className='rounded-xl border border-line bg-surface p-4'>
        <Skeleton className='h-11 w-full' />
        <div className='mt-4 flex flex-wrap gap-3'>
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className='h-9 w-24' />
          ))}
        </div>
      </div>
      <div className='mt-5 space-y-4'>
        {Array.from({ length: 4 }, (_, index) => (
          <SkeletonCard key={index} className='h-32' />
        ))}
      </div>
    </PageShell>
  );
}

export function GenericPageSkeleton() {
  return (
    <PageShell
      aria-busy='true'
      aria-label='Cargando página'
    >
      <SkeletonHeader compact />
      <SkeletonCard className='h-80' />
    </PageShell>
  );
}

export function LicksSkeleton() {
  return (
    <PageShell
      aria-busy='true'
      aria-label='Cargando licks'
    >
      <SkeletonHeader />
      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {Array.from({ length: 4 }, (_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
      <div className='mt-5 grid gap-5 xl:grid-cols-2'>
        <Skeleton className='h-56 rounded-xl' />
        <Skeleton className='h-56 rounded-xl' />
      </div>
      <Skeleton className='mt-5 h-72 w-full rounded-xl' />
      <div className='mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
        {Array.from({ length: 3 }, (_, index) => (
          <SkeletonCard key={index} className='h-72' />
        ))}
      </div>
    </PageShell>
  );
}
