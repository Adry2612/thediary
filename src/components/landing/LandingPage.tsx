import Link from "next/link";

const FEATURES = [
  {
    number: "01",
    title: "Una práctica con estructura",
    description:
      "Prepara bloques, objetivos y tiempos; después sigue cada etapa con un temporizador continuo.",
  },
  {
    number: "02",
    title: "Progreso que se entiende",
    description:
      "Consulta tus días de práctica, el tiempo registrado y el reparto entre habilidades.",
  },
  {
    number: "03",
    title: "Repertorio en movimiento",
    description:
      "Organiza canciones, licks y partes. El tiempo de los bloques vinculados actualiza cada elemento.",
  },
];

export function LandingPage() {
  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
      <section className="enter grid gap-10 rounded-xl border border-line bg-surface p-6 sm:p-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)] lg:items-center lg:gap-16 lg:p-14">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
            Tu espacio de práctica musical
          </p>
          <h1 className="mt-5 max-w-3xl font-serif text-5xl leading-[0.98] tracking-[-0.04em] sm:text-7xl">
            Practica con intención. Recuerda lo que avanzas.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Organiza cada sesión, sigue tu constancia y construye un repertorio
            que muestre lo que ya sabes tocar y lo que quieres dominar.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/practice"
              className="inline-flex h-12 items-center justify-center rounded-md bg-ink px-5 text-sm font-medium text-canvas transition hover:opacity-90 active:scale-[0.98]"
            >
              Preparar una práctica
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-12 items-center justify-center rounded-md border border-line px-5 text-sm text-ink transition hover:bg-white/5 active:scale-[0.98]"
            >
              Ver mi dashboard
            </Link>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="rounded-lg border border-line bg-canvas p-5 sm:p-7"
        >
          <div className="flex items-center justify-between border-b border-line pb-4">
            <span className="text-xs uppercase tracking-[0.12em] text-muted">
              Una semana de práctica
            </span>
            <span className="font-mono text-xs text-muted">L — D</span>
          </div>
          <div className="mt-6 grid grid-cols-7 gap-2">
            {[32, 58, 0, 82, 46, 0, 68].map((height, index) => (
              <div
                key={index}
                className="flex h-36 flex-col items-center justify-end gap-3"
              >
                <span
                  className={`w-full rounded-t-sm ${height ? "bg-accent-green-bg" : "bg-white/[0.04]"}`}
                  style={{ height: `${Math.max(height, 6)}%` }}
                />
                <span className="font-mono text-[10px] text-muted">
                  {["L", "M", "X", "J", "V", "S", "D"][index]}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-baseline justify-between border-t border-line pt-4">
            <span className="text-sm text-muted">Tiempo que suma</span>
            <span className="font-mono text-2xl">sesión a sesión</span>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {FEATURES.map((feature) => (
          <article
            key={feature.number}
            className="enter rounded-lg border border-line bg-surface p-6 sm:p-7"
          >
            <p className="font-mono text-xs text-muted">{feature.number}</p>
            <h2 className="mt-8 font-serif text-2xl tracking-[-0.02em]">
              {feature.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {feature.description}
            </p>
          </article>
        ))}
      </section>

      <footer className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 text-sm text-muted">
        <p>Un registro local y claro de tu trabajo musical.</p>
        <Link
          href="/repertoire"
          className="underline decoration-line underline-offset-4 transition hover:text-ink"
        >
          Explorar mi repertorio
        </Link>
      </footer>
    </main>
  );
}
