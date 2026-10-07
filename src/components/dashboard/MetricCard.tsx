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
  return (
    <section
      className="enter rounded-xl border border-zinc-800 bg-zinc-900 p-6 sm:p-7"
      style={{ "--index": index } as CSSProperties}
    >
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-5 whitespace-nowrap font-mono text-[clamp(1.25rem,2.2vw,1.875rem)] tracking-tight text-zinc-100">
        {value}
      </p>
      <p className="mt-2 text-sm text-zinc-500">{description}</p>
    </section>
  );
}
