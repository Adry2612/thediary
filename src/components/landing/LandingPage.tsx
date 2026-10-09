import Link from "next/link";
import { useI18nSection } from "@/i18n/I18nProvider";

export function LandingPage() {
  const landing = useI18nSection("landing");
  const features = landing.features.map((feature, index) => ({
    number: String(index + 1).padStart(2, "0"),
    ...feature,
  }));

  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
      <section className="enter grid gap-10 rounded-xl border border-line bg-surface p-6 sm:p-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)] lg:items-center lg:gap-16 lg:p-14">
        <div>
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
            {landing.eyebrow}
            </p>
          <h1 className="mt-5 max-w-3xl font-sans text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
            {landing.title}
          </h1>
          <p className="mt-6 max-w-xl text-base font-medium leading-relaxed text-muted sm:text-lg">
            {landing.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/practice"
              className="inline-flex h-12 items-center justify-center rounded-md bg-ink px-5 text-sm font-medium text-canvas transition hover:opacity-90 active:scale-[0.98]"
            >
              {landing.primaryAction}
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-12 items-center justify-center rounded-md border border-line px-5 text-sm text-ink transition hover:bg-white/5 active:scale-[0.98]"
            >
              {landing.secondaryAction}
            </Link>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="rounded-lg border border-line bg-canvas p-5 sm:p-7"
        >
          <div className="flex items-center justify-between border-b border-line pb-4">
            <span className="text-xs uppercase tracking-[0.12em] text-muted">
              {landing.summaryTitle}
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
            <span className="text-sm text-muted">{landing.summaryTrend}</span>
            <span className="font-mono text-2xl">{landing.summaryTrendValue}</span>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.number}
            className="enter rounded-lg border border-line bg-surface p-6 sm:p-7"
          >
            <p className="font-mono text-xs text-muted">{feature.number}</p>
            <h2 className="mt-8 font-sans text-lg leading-7 font-semibold tracking-tight sm:text-xl sm:leading-8">
              {feature.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {feature.description}
            </p>
          </article>
        ))}
      </section>

      <footer className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 text-sm text-muted">
          <p>{landing.footer}</p>
        <Link
          href="/repertoire"
          className="underline decoration-line underline-offset-4 transition hover:text-ink"
        >
          {landing.exploreRepertoire}
        </Link>
      </footer>
    </main>
  );
}
