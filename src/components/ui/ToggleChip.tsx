import type { ComponentPropsWithRef, ReactNode } from "react";

type Tone = "accent" | "soft";
type Size = "xs" | "sm";

interface ToggleChipProps
  extends Omit<ComponentPropsWithRef<"button">, "aria-pressed" | "children"> {
  /** `"mixed"` reproduce el estado parcial de un grupo; se refleja en `aria-pressed`. */
  selected: boolean | "mixed";
  /** `accent` es el relleno fuerte; `soft` el tenue de los estados parciales. */
  tone?: Tone;
  size?: Size;
  children: ReactNode;
}

const baseStyles = "inline-flex items-center border transition";

const selectedStyles: Record<Tone, string> = {
  accent: "border-accent-green-fg bg-accent-green-bg/40 text-ink",
  soft: "border-accent-green-fg/60 bg-accent-green-bg/20 text-ink",
};

const unselectedStyles = "border-line text-muted";

const sizeStyles: Record<Size, string> = {
  xs: "rounded px-2 py-1 text-xs",
  sm: "rounded-md px-2 py-1.5 text-[11px]",
};

/**
 * Pastilla de selección. El estado parcial (`"mixed"`) siempre usa el tono
 * tenue, porque el fuerte queda reservado a "todo seleccionado".
 */
export function ToggleChip({
  selected,
  tone = "accent",
  size = "xs",
  type = "button",
  className = "",
  ...props
}: ToggleChipProps) {
  const isSelected = selected !== false;
  const selectedTone = selected === "mixed" ? "soft" : tone;

  return (
    <button
      {...props}
      type={type}
      aria-pressed={selected}
      className={`${baseStyles} ${sizeStyles[size]} ${
        isSelected ? selectedStyles[selectedTone] : unselectedStyles
      } ${className}`}
    />
  );
}
