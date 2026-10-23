import type { CSSProperties } from "react";

type MetricCardTone = "dark" | "light";

type MetricCardProps = {
  label: string;
  value: string;
  /** Texto de apoyo bajo el número; el resumen del repertorio no lo usa. */
  description?: string;
  /** Posición en la rejilla, para escalonar la entrada. */
  index?: number;
  /** `dark` es la tarjeta del panel; `light` la del resumen del repertorio. */
  tone?: MetricCardTone;
  as?: "article" | "section";
};

const TONE_CLASSES = {
  dark: {
    surface: "enter rounded-xl border border-zinc-800 bg-zinc-900 p-6 sm:p-7",
    label: "text-sm text-zinc-400",
    value:
      "mt-4 min-h-[2.25rem] break-words leading-tight tracking-normal text-zinc-100",
    description: "mt-2 text-sm text-muted",
  },
  light: {
    surface: "rounded-lg border border-line bg-surface p-4 sm:p-5",
    label: "text-xs uppercase tracking-[0.1em] text-muted",
    value:
      "mt-3 font-mono text-xs leading-6 tabular-nums tracking-normal sm:text-sm sm:leading-7",
    description: "mt-2 text-sm text-muted",
  },
} as const;

export function MetricCard({
  label,
  value,
  description,
  index,
  tone = "dark",
  as = "section",
}: MetricCardProps) {
  const valueHasNumber = /\d/.test(value);
  const classes = TONE_CLASSES[tone];
  const valueTypography =
    tone === "dark"
      ? valueHasNumber
        ? "font-mono text-2xl font-medium tabular-nums sm:text-3xl"
        : "font-sans text-base"
      : "";
  const Component = as;

  return (
    <Component
      className={classes.surface}
      style={
        index === undefined
          ? undefined
          : ({ "--index": index } as CSSProperties)
      }
    >
      <p className={classes.label}>{label}</p>
      <p
        className={
          valueTypography ? `${classes.value} ${valueTypography}` : classes.value
        }
      >
        {value}
      </p>
      {description ? <p className={classes.description}>{description}</p> : null}
    </Component>
  );
}
