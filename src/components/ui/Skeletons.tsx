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
    <header className={compact ? 'mb-8' : 'mb-10'}>
      <Skeleton className='h-3 w-24' />
      <Skeleton className='mt-4 h-10 w-64 max-w-full sm:h-12' />
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
    <main
      aria-busy='true'
      aria-label='Cargando inicio'
      className='mx-auto min-h-screen max-w-7xl px-5 py-12 sm:px-8 sm:py-16'
    >
      <SkeletonHeader compact />
      <SkeletonCard className='h-36' />
      <SkeletonCard className='mt-5 h-32' />
      <Skeleton className='mt-5 h-72 w-full rounded-xl' />
      <div className='mt-5 grid items-stretch gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]'>
        <Skeleton className='h-64 rounded-xl' />
        <Skeleton className='h-64 rounded-xl' />
      </div>
    </main>
  );
}

export function DashboardSkeleton() {
  return (
    <main
      aria-busy='true'
      aria-label='Cargando panel'
      className='mx-auto min-h-screen max-w-7xl px-5 py-12 sm:px-8 sm:py-16'
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
    </main>
  );
}

export function PracticeSkeleton() {
  return (
    <main
      aria-busy='true'
      aria-label='Cargando práctica'
      className='mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-6 pt-16 pb-16 sm:pt-24 sm:pb-24'
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
    </main>
  );
}

export function MetronomeSkeleton() {
  return (
    <main
      aria-busy='true'
      aria-label='Cargando metrónomo'
      className='mx-auto min-h-screen max-w-5xl px-5 py-12 sm:px-8 sm:py-16'
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
    </main>
  );
}

export function RecordingsSkeleton() {
  return (
    <main
      aria-busy='true'
      aria-label='Cargando grabaciones'
      className='mx-auto min-h-screen max-w-7xl px-5 py-12 sm:px-8 sm:py-16'
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
    </main>
  );
}

export function SettingsSkeleton() {
  return (
    <main
      aria-busy='true'
      aria-label='Cargando opciones'
      className='mx-auto max-w-3xl px-5 py-12 sm:px-8'
    >
      <SkeletonHeader compact />
      <div className='space-y-4'>
        {Array.from({ length: 5 }, (_, index) => (
          <SkeletonCard key={index} className='h-36 sm:h-32' />
        ))}
      </div>
    </main>
  );
}

export function AccountSkeleton() {
  return (
    <main
      aria-busy='true'
      aria-label='Cargando cuenta'
      className='mx-auto max-w-3xl px-5 py-12 sm:px-8'
    >
      <SkeletonHeader compact />
      <SkeletonCard className='h-40' />
      <SkeletonCard className='mt-6 h-72' />
    </main>
  );
}

export function RepertoireSkeleton() {
  return (
    <main
      aria-busy='true'
      aria-label='Cargando repertorio'
      className='mx-auto min-h-screen max-w-5xl px-5 py-12 sm:px-8 sm:py-16'
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
    </main>
  );
}

export function GenericPageSkeleton() {
  return (
    <main
      aria-busy='true'
      aria-label='Cargando página'
      className='mx-auto min-h-screen max-w-5xl px-5 py-12 sm:px-8 sm:py-16'
    >
      <SkeletonHeader compact />
      <SkeletonCard className='h-80' />
    </main>
  );
}
