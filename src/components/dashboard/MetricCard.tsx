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
        className={`mt-5 whitespace-nowrap text-[clamp(0.75rem,1.4vw,1rem)] leading-relaxed tracking-normal text-zinc-100 ${valueHasNumber ? "font-mono tabular-nums" : "font-sans"}`}
      >
        {value}
      </p>
      <p className="mt-2 text-sm text-zinc-500">{description}</p>
    </section>
  );
}
