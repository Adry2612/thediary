import { MetronomeCard } from "@/components/practice/MetronomeCard";

export default function MetronomePage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <header className="enter mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
          Herramientas de práctica
        </p>
        <h1 className="mt-3 font-sans text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
          Metrónomo
        </h1>
        <p className="mt-4 max-w-xl text-base text-muted sm:text-lg">
          Ajusta el pulso, la subdivisión y el volumen en una vista dedicada.
        </p>
      </header>
      <MetronomeCard variant="large" />
    </main>
  );
}
