import type { CSSProperties } from "react";

type MetricCardProps = {
  label: string;
  value: string;
  description: string;
  index: number;
};

export function MetricCard({
  label,
  value,
  description,
  index,
}: MetricCardProps) {
  const valueHasNumber = /\d/.test(value);

  return (
    <section
      className="enter rounded-xl border border-zinc-800 bg-zinc-900 p-6 sm:p-7"
      style={{ "--index": index } as CSSProperties}
    >
      <p className="text-sm text-zinc-400">{label}</p>
      <p
        className={`mt-4 min-h-[2.25rem] break-words leading-tight tracking-normal text-zinc-100 ${valueHasNumber ? "font-mono text-2xl font-medium tabular-nums sm:text-3xl" : "font-sans text-base"}`}
      >
        {value}
      </p>
      <p className="mt-2 text-sm text-zinc-500">{description}</p>
    </section>
  );
}
