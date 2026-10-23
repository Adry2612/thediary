import type { InputHTMLAttributes, ReactNode } from "react";

interface CheckboxFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className"> {
  label: ReactNode;
  /** Clases del contenedor `<label>`. */
  className?: string;
}

/**
 * Casilla marcada a mano: el `input` real queda oculto y una caja dibujada
 * responde a `peer-checked`. El nombre visible envuelve el control, así que no
 * necesita `htmlFor`.
 */
export function CheckboxField({
  label,
  className = "",
  ...props
}: CheckboxFieldProps) {
  return (
    <label className={`flex cursor-pointer items-center gap-2 ${className}`}>
      <input type="checkbox" {...props} className="peer sr-only" />
      <span
        aria-hidden="true"
        className="flex size-4 items-center justify-center border border-muted text-transparent transition peer-checked:border-accent-green-fg peer-checked:bg-accent-green-fg peer-checked:text-canvas peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-green-fg"
      >
        <svg viewBox="0 0 12 12" className="size-3" fill="none">
          <path
            d="m2 6 2.5 2.5L10 3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span>{label}</span>
    </label>
  );
}
